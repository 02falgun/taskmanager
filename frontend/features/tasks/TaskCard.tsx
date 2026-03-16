"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Flag,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { Task } from "@/lib/types";
import {
  cn,
  getPriorityConfig,
  getStatusConfig,
  isOverdue,
  isDueSoon,
  truncate,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTaskMutations } from "@/hooks/useTasks";
import { useUIStore } from "@/store/ui.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  dragging?: boolean;
}

export function TaskCard({ task, compact = false, dragging = false }: TaskCardProps) {
  const { openTaskModal } = useUIStore();
  const { toggleTask, deleteTask } = useTaskMutations();

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const overdue = isOverdue(task.dueDate) && task.status !== "COMPLETED";
  const dueSoon = isDueSoon(task.dueDate);
  const isCompleted = task.status === "COMPLETED";

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTask.mutate(task.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openTaskModal(task);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask.mutate(task.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={cn(
        "group relative rounded-xl border bg-card transition-all duration-200",
        "hover:shadow-soft hover:border-primary/20",
        dragging && "shadow-soft-lg rotate-1 border-primary/30 scale-[1.02]",
        isCompleted && "opacity-70",
        compact ? "p-3" : "p-4"
      )}
      onClick={handleEdit}
    >
      <div className="flex items-start gap-3">
        {/* Status toggle button */}
        <button
          onClick={handleToggle}
          disabled={toggleTask.isPending}
          className={cn(
            "mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200",
            "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
            isCompleted
              ? "bg-emerald-500 border-emerald-500 text-white"
              : task.status === "IN_PROGRESS"
              ? "border-indigo-500 hover:border-indigo-600"
              : "border-muted-foreground/40 hover:border-primary",
            toggleTask.isPending && "animate-pulse"
          )}
        >
          {isCompleted && <CheckCircle2 className="w-full h-full" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "text-sm font-medium leading-snug transition-all",
                  isCompleted && "line-through text-muted-foreground",
                  !isCompleted && "text-foreground"
                )}
              >
                {truncate(task.title, compact ? 60 : 100)}
              </h3>

              {!compact && task.description && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-muted transition-all -mr-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={handleEdit}
                  className="gap-2 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleToggle}
                  className="gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Toggle status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Status badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                statusConfig.bgColor,
                statusConfig.textColor
              )}
            >
              <span
                className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dotColor)}
              />
              {statusConfig.label}
            </span>

            {/* Priority badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                priorityConfig.bgColor,
                priorityConfig.textColor
              )}
            >
              <Flag className="w-2.5 h-2.5" />
              {priorityConfig.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                  overdue
                    ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                    : dueSoon
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Calendar className="w-2.5 h-2.5" />
                {overdue ? "Overdue · " : ""}
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}

            {/* Tags */}
            {!compact &&
              task.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Priority left border accent */}
      <div
        className={cn(
          "absolute left-0 top-3 bottom-3 w-0.5 rounded-full",
          priorityConfig.dotColor,
          "opacity-60"
        )}
      />
    </motion.div>
  );
}
