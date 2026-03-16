import api from "@/lib/api";
import {
  ApiResponse,
  Task,
  TaskStats,
  TaskFilters,
  CreateTaskPayload,
  UpdateTaskPayload,
  PaginationMeta,
} from "@/lib/types";

export interface TasksResponse {
  tasks: Task[];
  pagination: PaginationMeta;
}

export const taskApi = {
  /**
   * Get all tasks with filters and pagination
   */
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await api.get<ApiResponse<Task[]>>(
      `/tasks?${params.toString()}`
    );

    return {
      tasks: response.data.data ?? [],
      pagination: response.data.meta?.pagination ?? {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasMore: false,
      },
    };
  },

  /**
   * Get a single task by ID
   */
  async getTask(id: string): Promise<Task> {
    const response = await api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
    return response.data.data!.task;
  },

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskPayload): Promise<Task> {
    const response = await api.post<ApiResponse<{ task: Task }>>(`/tasks`, data);
    return response.data.data!.task;
  },

  /**
   * Update an existing task
   */
  async updateTask(id: string, data: UpdateTaskPayload): Promise<Task> {
    const response = await api.patch<ApiResponse<{ task: Task }>>(
      `/tasks/${id}`,
      data
    );
    return response.data.data!.task;
  },

  /**
   * Toggle task status
   */
  async toggleTask(id: string): Promise<Task> {
    const response = await api.patch<ApiResponse<{ task: Task }>>(
      `/tasks/${id}/toggle`
    );
    return response.data.data!.task;
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  /**
   * Get task statistics for dashboard
   */
  async getStats(): Promise<TaskStats> {
    const response = await api.get<ApiResponse<{ stats: TaskStats }>>(
      "/tasks/stats"
    );
    return response.data.data!.stats;
  },
};
