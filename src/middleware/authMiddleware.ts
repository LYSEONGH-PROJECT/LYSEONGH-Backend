import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../utils/roles';

interface DecodedToken {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Omit<
      DecodedToken,
      'role'
    > & { role: string };

    //  Ensure the role matches our allowed UserRole values
    if (!['ADMIN', 'TECHNICIAN', 'VIEWER'].includes(decoded.role)) {
      return res.status(403).json({ message: 'Invalid role in token' });
    }

    req.user = {
      ...decoded,
      role: decoded.role as UserRole,
    };

    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
