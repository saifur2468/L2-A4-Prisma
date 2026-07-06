import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const checkRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden! You do not have permission.',
      });
    }
    next();
  };
};