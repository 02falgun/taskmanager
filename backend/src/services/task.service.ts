import { taskRepository } from '../repositories/task.repository';
import { Task } from '@prisma/client';
import {
  CreateTaskBody,
  UpdateTaskBody,
  TaskQuery,
  TaskResponse,
  TaskStatsResponse,
} from '../types/task.types';
import { AppError } from './auth.service';

/**
 * Service layer for task logic
 */
export class TaskService {
  /**
   * Get all tasks for a user with filters and pagination
   */
  async getTasks(
    userId: string,
    query: TaskQuery
  ): Promise<{ tasks: TaskResponse[]; total: number }> {
    const { tasks, total } = await taskRepository.findAll(userId, query);
    return { tasks: tasks.map(this.toResponse), total };
  }

  /**
   * Get a single task
   */
  async getTask(id: string, userId: string): Promise<TaskResponse> {
    const task = await taskRepository.findById(id, userId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return this.toResponse(task);
  }

  /**
   * Create a new task
   */
  async createTask(userId: string, data: CreateTaskBody): Promise<TaskResponse> {
    const task = await taskRepository.create(userId, data);
    return this.toResponse(task);
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, userId: string, data: UpdateTaskBody): Promise<TaskResponse> {
    const task = await taskRepository.update(id, userId, data);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return this.toResponse(task);
  }

  /**
   * Toggle task status
   */
  async toggleTask(id: string, userId: string): Promise<TaskResponse> {
    const task = await taskRepository.toggle(id, userId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return this.toResponse(task);
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string, userId: string): Promise<void> {
    const deleted = await taskRepository.delete(id, userId);
    if (!deleted) {
      throw new AppError('Task not found', 404);
    }
  }

  /**
   * Get task statistics for dashboard
   */
  async getStats(userId: string): Promise<TaskStatsResponse> {
    return taskRepository.getStats(userId);
  }

  /**
   * Map Prisma Task to TaskResponse
   */
  private toResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      order: task.order,
      tags: task.tags,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      userId: task.userId,
    };
  }
}

export const taskService = new TaskService();
