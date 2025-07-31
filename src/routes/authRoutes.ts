// src/routes/authRoutes.ts
import { Router } from 'express';
import { register, login, me, forgotPassword, resetPassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;