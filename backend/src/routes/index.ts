import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'TMS API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

export default router;
