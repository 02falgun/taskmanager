import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.utils';
import { CreateTaskBody, UpdateTaskBody, TaskQuery } from '../types/task.types';

/**
 * Task Controller — handles all task CRUD endpoints
 */
export class TaskController {
  /**
   * GET /tasks
   * List all tasks for the authenticated user with filters and pagination
   */
  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const query = req.query as unknown as TaskQuery;

      const { tasks, total } = await taskService.getTasks(userId, query);
      const { page, limit } = query;

      sendPaginated(res, tasks, total, page, limit, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /tasks
   * Create a new task
   */
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const body = req.body as CreateTaskBody;

      const task = await taskService.createTask(userId, body);
      sendCreated(res, { task }, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/:id
   * Get a single task by ID
   */
  async getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const task = await taskService.getTask(id, userId);
      sendSuccess(res, { task }, 'Task retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /tasks/:id
   * Update a task
   */
  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const body = req.body as UpdateTaskBody;

      const task = await taskService.updateTask(id, userId, body);
      sendSuccess(res, { task }, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /tasks/:id/toggle
   * Toggle task status (TODO → IN_PROGRESS → COMPLETED → TODO)
   */
  async toggleTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const task = await taskService.toggleTask(id, userId);
      sendSuccess(res, { task }, 'Task status updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /tasks/:id
   * Delete a task
   */
  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await taskService.deleteTask(id, userId);
      sendSuccess(res, null, 'Task deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /tasks/stats
   * Get task stats for dashboard analytics
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const stats = await taskService.getStats(userId);

      sendSuccess(res, { stats }, 'Statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
