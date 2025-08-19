import { VercelRequest, VercelResponse } from '@vercel/node';
import { AuthController } from './controllers/AuthController';

const authController = new AuthController();

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'POST') {
    return authController.login(req, res);
  }
  res.status(405).json({ error: 'Method not allowed' });
};
