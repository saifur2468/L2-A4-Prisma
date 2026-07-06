// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

// export interface AuthRequest extends Request {
//   user?: { id: string; role: 'TENANT' | 'LANDLORD' | 'ADMIN' };
// }

// export const authGuard = (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) throw new Error('You are not authorized! Token missing.');

//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthRequest['user'];
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ success: false, message: 'Unauthorized access!' });
//   }
// };















import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'TENANT' | 'LANDLORD' | 'ADMIN';
  };
}

export const authGuard = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token missing!',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthRequest['user'];

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access!',
    });
  }
};

export const checkRole = (
  ...roles: ('TENANT' | 'LANDLORD' | 'ADMIN')[]
) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    next();
  };
};