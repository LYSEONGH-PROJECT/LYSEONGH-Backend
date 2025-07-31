// src/routes/protectedRoutes.ts
import { Router } from 'express';
import { authorizeAdmin, authorizeTechnician, authorizeViewer } from '../middleware/roleMiddleware';

const router = Router();

// Admin-only route
router.get('/admin-only', authorizeAdmin, (req, res) => {
  res.status(200).json({ message: 'Welcome Admin', user: req.user });
});

// Technician-only route
router.get('/tech-dashboard', authorizeTechnician, (req, res) => {
  res.status(200).json({ message: 'Technician Dashboard', user: req.user });
});

// Viewer-only route
router.get('/viewer-page', authorizeViewer, (req, res) => {
  res.status(200).json({ message: 'Viewer Page', user: req.user });
});

export default router;