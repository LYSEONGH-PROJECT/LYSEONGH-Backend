import { UserRole } from '../utils/roles';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        iat?: number;
        exp?: number;
      };
    }
  }
}