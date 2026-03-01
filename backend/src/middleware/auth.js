import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { forbidden, unauthorized } from '../utils/http.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return unauthorized(res);

  const token = authHeader.split(' ')[1];
  if (!token) return unauthorized(res);

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch {
    return unauthorized(res, 'Token inválido.');
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) return forbidden(res);
  next();
};
