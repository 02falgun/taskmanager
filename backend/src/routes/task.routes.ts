import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  taskParamSchema,
} from '../types/task.types';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// Statistics (must be before /:id to avoid conflict)
router.get('/stats', taskController.getStats.bind(taskController));

// Task CRUD
router.get('/', validate(taskQuerySchema), taskController.getTasks.bind(taskController));
router.post('/', validate(createTaskSchema), taskController.createTask.bind(taskController));
router.get('/:id', validate(taskParamSchema), taskController.getTask.bind(taskController));
router.patch('/:id', validate(updateTaskSchema), taskController.updateTask.bind(taskController));
router.patch('/:id/toggle', validate(taskParamSchema), taskController.toggleTask.bind(taskController));
router.delete('/:id', validate(taskParamSchema), taskController.deleteTask.bind(taskController));

export default router;
