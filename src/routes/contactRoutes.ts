// src/routes/contactRoutes.ts
import { Router } from 'express';
import { submitContact, getContacts } from '../controllers/contactController';
import { authenticateToken } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
});

router.post('/contact', limiter, submitContact);
router.get('/contact', authenticateToken, getContacts); // Optional admin endpoint

export default router;