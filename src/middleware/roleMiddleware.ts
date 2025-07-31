// src/middleware/roleMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { UserRole, hasRole, hasAtLeastRole, isValidRole } from '../utils/roles';

export const authorizeRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.role) {
      return res.status(401).json({ message: 'Unauthorized: No user role' });
    }

    if (!isValidRole(user.role)) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    if (!hasRole(user.role as UserRole, requiredRole) && !hasAtLeastRole(user.role as UserRole, requiredRole)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }

    next();
  };
};

export const authorizeAdmin = authorizeRole(UserRole.ADMIN);
export const authorizeTechnician = authorizeRole(UserRole.TECHNICIAN);
export const authorizeViewer = authorizeRole(UserRole.VIEWER);