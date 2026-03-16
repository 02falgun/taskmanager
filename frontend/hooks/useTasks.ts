"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { taskApi } from "@/services/task.service";
import { useUIStore } from "@/store/ui.store";
import { CreateTaskPayload, UpdateTaskPayload, TaskFilters } from "@/lib/types";
import { parseApiError } from "@/lib/utils";

export const TASKS_QUERY_KEY = ["tasks"] as const;
export const STATS_QUERY_KEY = ["tasks", "stats"] as const;

/**
 * Hook for fetching tasks with filters
 */
export const useTasks = (filters: TaskFilters = {}) => {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, filters],
    queryFn: () => taskApi.getTasks(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook for fetching a single task
 */
export const useTask = (id: string) => {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, id],
    queryFn: () => taskApi.getTask(id),
    enabled: !!id,
  });
};

/**
 * Hook for task statistics
 */
export const useTaskStats = () => {
  return useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: taskApi.getStats,
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Hook for all task mutations (create, update, delete, toggle)
 */
export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const { closeTaskModal } = useUIStore();

  const invalidateTasks = () => {
    queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
  };

  // Create task
  const createTask = useMutation({
    mutationFn: (data: CreateTaskPayload) => taskApi.createTask(data),
    onSuccess: () => {
      invalidateTasks();
      closeTaskModal();
      toast.success("Task created successfully! ✨");
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });

  // Update task
  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskPayload }) =>
      taskApi.updateTask(id, data),
    onSuccess: () => {
      invalidateTasks();
      closeTaskModal();
      toast.success("Task updated successfully");
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });

  // Toggle task status
  const toggleTask = useMutation({
    mutationFn: (id: string) => taskApi.toggleTask(id),
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previousData = queryClient.getQueriesData({ queryKey: TASKS_QUERY_KEY });

      queryClient.setQueriesData(
        { queryKey: TASKS_QUERY_KEY },
        (old: { tasks: { id: string; status: string }[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.map((task) => {
              if (task.id !== id) return task;
              const nextStatus: Record<string, string> = {
                TODO: "IN_PROGRESS",
                IN_PROGRESS: "COMPLETED",
                COMPLETED: "TODO",
              };
              return { ...task, status: nextStatus[task.status] };
            }),
          };
        }
      );

      return { previousData };
    },
    onError: (error, _id, context) => {
      // Rollback on error
      context?.previousData.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(parseApiError(error));
    },
    onSettled: () => {
      invalidateTasks();
    },
  });

  // Delete task
  const deleteTask = useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      invalidateTasks();
      toast.success("Task deleted", {
        description: "The task has been permanently removed.",
      });
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });

  return {
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
  };
};
