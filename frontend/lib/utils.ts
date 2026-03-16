import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns";
import { Priority, TaskStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "No date";
  return format(new Date(date), "MMM d, yyyy");
}

/**
 * Format a date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Check if a date is overdue (past and not completed)
 */
export function isOverdue(dueDate: string | Date | null | undefined): boolean {
  if (!dueDate) return false;
  return isBefore(new Date(dueDate), new Date());
}

/**
 * Check if a task is due soon (within 2 days)
 */
export function isDueSoon(dueDate: string | Date | null | undefined): boolean {
  if (!dueDate) return false;
  const date = new Date(dueDate);
  return isAfter(date, new Date()) && isBefore(date, addDays(new Date(), 2));
}

/**
 * Get priority color classes
 */
export function getPriorityConfig(priority: Priority) {
  const configs = {
    HIGH: {
      label: "High",
      className: "priority-high",
      color: "#ef4444",
      bgColor: "bg-red-100 dark:bg-red-950/50",
      textColor: "text-red-700 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800",
      dotColor: "bg-red-500",
    },
    MEDIUM: {
      label: "Medium",
      className: "priority-medium",
      color: "#f59e0b",
      bgColor: "bg-amber-100 dark:bg-amber-950/50",
      textColor: "text-amber-700 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-800",
      dotColor: "bg-amber-500",
    },
    LOW: {
      label: "Low",
      className: "priority-low",
      color: "#10b981",
      bgColor: "bg-emerald-100 dark:bg-emerald-950/50",
      textColor: "text-emerald-700 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      dotColor: "bg-emerald-500",
    },
  };
  return configs[priority];
}

/**
 * Get status config
 */
export function getStatusConfig(status: TaskStatus) {
  const configs = {
    TODO: {
      label: "To Do",
      className: "status-todo",
      bgColor: "bg-slate-100 dark:bg-slate-800/50",
      textColor: "text-slate-600 dark:text-slate-400",
      dotColor: "bg-slate-400",
      kanbanColor: "bg-slate-200 dark:bg-slate-800",
    },
    IN_PROGRESS: {
      label: "In Progress",
      className: "status-in-progress",
      bgColor: "bg-indigo-100 dark:bg-indigo-950/50",
      textColor: "text-indigo-700 dark:text-indigo-400",
      dotColor: "bg-indigo-500",
      kanbanColor: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    COMPLETED: {
      label: "Completed",
      className: "status-completed",
      bgColor: "bg-emerald-100 dark:bg-emerald-950/50",
      textColor: "text-emerald-700 dark:text-emerald-400",
      dotColor: "bg-emerald-500",
      kanbanColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
  };
  return configs[status];
}

/**
 * Truncate text to a max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Generate user avatar initials
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Parse API error to readable message
 */
export function parseApiError(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const axiosError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return (
      axiosError.response?.data?.message ||
      axiosError.message ||
      "An unexpected error occurred"
    );
  }
  return "An unexpected error occurred";
}
