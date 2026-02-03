import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

interface AdminRequest extends Request {
  user?: JwtPayload;
}

export const adminMiddleware = (req: AdminRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Требуется аутентификация' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён: требуется роль администратора' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Неверный токен' });
  }
};