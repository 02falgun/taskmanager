import { z } from 'zod';
import { TaskStatus, Priority } from '@prisma/client';

// ─────────────────────────────────────────────
// Task Validation Schemas
// ─────────────────────────────────────────────

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title cannot exceed 200 characters')
      .trim(),
    description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
    priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
    dueDate: z.string().datetime({ offset: true }).optional().nullable(),
    tags: z.array(z.string().max(50)).max(10).default([]),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(2000).optional().nullable(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(Priority).optional(),
    dueDate: z.string().datetime({ offset: true }).optional().nullable(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    order: z.number().int().min(0).optional(),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z
      .coerce
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(20),
    search: z.string().optional(),
    status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]).optional(),
    priority: z.nativeEnum(Priority).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title', 'order']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    tags: z.string().optional(), // comma-separated
  }),
});

export const taskParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
});

// ─────────────────────────────────────────────
// Task Types
// ─────────────────────────────────────────────

export interface TaskResponse {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  order: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface TaskStatsResponse {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export type CreateTaskBody = z.infer<typeof createTaskSchema>['body'];
export type UpdateTaskBody = z.infer<typeof updateTaskSchema>['body'];
export type TaskQuery = z.infer<typeof taskQuerySchema>['query'];
