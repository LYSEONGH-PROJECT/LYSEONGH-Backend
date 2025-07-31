// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import authRoutes from './routes/authRoutes';
import contactRoutes from './routes/contactRoutes';
import protectedRoutes from './routes/protectedRoutes';
import { setupSwagger } from './utils/swagger';

const app = express();

app.use(express.json());
setupSwagger(app); // API documentation
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/protected', protectedRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;