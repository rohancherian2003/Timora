import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';
import type { UserRole } from '@timora/shared';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        403,
        'FORBIDDEN',
        `Forbidden: Role '${req.user.role}' does not have access to this resource.`
      );
    }

    next();
  };
}
