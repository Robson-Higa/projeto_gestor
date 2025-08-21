import { body, validationResult } from 'express-validator';
import { AuthController } from '../../../../../backend/src/controllers/AuthController';

// Adaptador para rodar express-validator no Next.js
const middlewareNext = (validators) => {
  return async (req, res, next) => {
    for (const validator of validators) {
      await validator.run(req); // executa cada validator
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    await next();
  };
};

// Instância do controller
const authController = new AuthController();

// Validator para login com idToken
const validateLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isString().notEmpty().withMessage('Senha é obrigatória'),
];

// Função para aplicar middlewares
const applyMiddleware = (middlewares, handler) => {
  return async (req, res) => {
    const execute = async (index) => {
      if (index < middlewares.length) {
        await middlewares[index](req, res, () => execute(index + 1));
      } else {
        await handler(req, res);
      }
    };
    await execute(0);
  };
};

// Rota final
export default applyMiddleware([middlewareNext(validateLogin)], async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    await authController.login(req, res);
  } catch (err) {
    console.error('Erro no login Next.js:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
