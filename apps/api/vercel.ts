import { VercelRequest, VercelResponse } from '@vercel/node';
import app from './src/index';

export default async (req: VercelRequest, res: VercelResponse) => {
  // Configuração específica para o Vercel
  if (req.url?.startsWith('/api')) {
    req.url = req.url.replace('/api', '');
  }
  return app(req, res);
};
