import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, refreshSchema } from '../types/auth.types';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/refresh', validate(refreshSchema), authController.refresh.bind(authController));
router.post('/logout', validate(refreshSchema), authController.logout.bind(authController));

// Protected routes
router.post('/logout-all', authMiddleware, authController.logoutAll.bind(authController));
router.get('/me', authMiddleware, authController.me.bind(authController));

export default router;
