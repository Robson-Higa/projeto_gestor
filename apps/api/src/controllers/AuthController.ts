// controllers/AuthController.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { db } from '../config/firebase'; // exemplo de conexão com Firebase
import { User } from '../types';

export class AuthController {
  /** Login */
  async login(req: VercelRequest, res: VercelResponse) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      // Buscar usuário no Firestore
      const snapshot = await db.collection('users').where('email', '==', email).get();
      if (snapshot.empty) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const userDoc = snapshot.docs[0];
      const user = userDoc.data() as User;

      // Verificar senha
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Senha inválida' });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { uid: userDoc.id, userType: user.userType },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );

      return res.status(200).json({ token, user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro interno no login' });
    }
  }

  /** Registro */
  async register(req: VercelRequest, res: VercelResponse) {
    try {
      const { name, email, password, userType } = req.body;

      if (!name || !email || !password || !userType) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10);

      // Criar usuário no Firestore
      const newUser = {
        name,
        email,
        userType,
        passwordHash,
        active: true,
        createdAt: new Date(),
      };

      const docRef = await db.collection('users').add(newUser);

      return res.status(201).json({ uid: docRef.id, ...newUser });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro interno no registro' });
    }
  }

  /** Verificação de token */
  async verifyTokenString(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      return decoded;
    } catch (err) {
      throw new Error('Token inválido');
    }
  }
}
