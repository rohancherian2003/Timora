import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';
import type { UserRole } from '@timora/shared';

export interface AuthUser {
  id: string;
  phone: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication token missing or malformed.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Token is missing.');
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = {
      id: payload.id,
      phone: payload.phone,
      role: payload.role,
    };
    next();
  } catch (_err) {
    throw new AppError(401, 'INVALID_TOKEN', 'Token is invalid or expired.');
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
        req.user = {
          id: payload.id,
          phone: payload.phone,
          role: payload.role,
        };
      } catch {
        // Silently ignore invalid optional tokens
      }
    }
  }
  next();
}
