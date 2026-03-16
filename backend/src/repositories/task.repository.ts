import { prisma } from '../config/database';
import { Task, TaskStatus, Priority, Prisma } from '@prisma/client';
import { TaskQuery, CreateTaskBody, UpdateTaskBody } from '../types/task.types';

interface FindAllResult {
  tasks: Task[];
  total: number;
}

/**
 * Repository for task database operations
 */
export class TaskRepository {
  /**
   * Find all tasks for a user with filtering, sorting, and pagination
   */
  async findAll(userId: string, query: TaskQuery): Promise<FindAllResult> {
    const { page, limit, search, status, priority, sortBy, sortOrder, tags } = query;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: Prisma.TaskWhereInput = {
      userId,
      ...(search && {
        title: { contains: search, mode: 'insensitive' },
      }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(tags && {
        tags: { hasSome: tags.split(',').map((t) => t.trim()) },
      }),
    };

    // Build dynamic orderBy
    const orderBy = this.buildOrderBy(sortBy, sortOrder);

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  }

  /**
   * Find a single task by ID belonging to a user
   */
  async findById(id: string, userId: string): Promise<Task | null> {
    return prisma.task.findFirst({ where: { id, userId } });
  }

  /**
   * Create a new task
   */
  async create(userId: string, data: CreateTaskBody): Promise<Task> {
    // Get current max order for this user to place new task at end
    const maxOrderTask = await prisma.task.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return prisma.task.create({
      data: {
        ...data,
        userId,
        order: (maxOrderTask?.order ?? -1) + 1,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  }

  /**
   * Update a task
   */
  async update(id: string, userId: string, data: UpdateTaskBody): Promise<Task | null> {
    const task = await this.findById(id, userId);
    if (!task) return null;

    return prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      },
    });
  }

  /**
   * Toggle task status (cycle: TODO → IN_PROGRESS → COMPLETED → TODO)
   */
  async toggle(id: string, userId: string): Promise<Task | null> {
    const task = await this.findById(id, userId);
    if (!task) return null;

    const nextStatus: Record<TaskStatus, TaskStatus> = {
      TODO: TaskStatus.IN_PROGRESS,
      IN_PROGRESS: TaskStatus.COMPLETED,
      COMPLETED: TaskStatus.TODO,
    };

    return prisma.task.update({
      where: { id },
      data: { status: nextStatus[task.status] },
    });
  }

  /**
   * Delete a task
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const task = await this.findById(id, userId);
    if (!task) return false;

    await prisma.task.delete({ where: { id } });
    return true;
  }

  /**
   * Get task statistics for a user (for dashboard analytics)
   */
  async getStats(userId: string) {
    const [totalTasks, byStatus, byPriority] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { userId },
        _count: { priority: true },
      }),
    ]);

    const statusCounts = byStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<TaskStatus, number>
    );

    const priorityCounts = byPriority.reduce(
      (acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      },
      {} as Record<Priority, number>
    );

    const completedTasks = statusCounts.COMPLETED ?? 0;
    const todo = statusCounts.TODO ?? 0;
    const inProgress = statusCounts.IN_PROGRESS ?? 0;
    const pendingTasks = todo + inProgress;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      highPriority: priorityCounts.HIGH ?? 0,
      mediumPriority: priorityCounts.MEDIUM ?? 0,
      lowPriority: priorityCounts.LOW ?? 0,
      total: totalTasks,
      todo,
      inProgress,
      completed: completedTasks,
      overdue: 0,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }

  /**
   * Build orderBy clause
   */
  private buildOrderBy(
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Prisma.TaskOrderByWithRelationInput | Prisma.TaskOrderByWithRelationInput[] {
    if (sortBy === 'priority') {
      return [{ priority: sortOrder }, { createdAt: 'desc' }];
    }

    return [{ [sortBy]: sortOrder }];
  }
}

export const taskRepository = new TaskRepository();
