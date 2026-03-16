"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { CircleDot, Loader2, CheckCircle2, Circle, Plus } from "lucide-react";
import { toast } from "sonner";
import { TaskCard } from "./TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Task, TaskStatus } from "@/lib/types";
import { useTaskMutations } from "@/hooks/useTasks";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/lib/utils";

const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED"];

interface TaskBoardViewProps {
  tasks: Task[];
  isLoading: boolean;
}

const COLUMNS: { id: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
  {
    id: "TODO",
    label: "To Do",
    icon: <Circle className="h-4 w-4" />,
    color: "text-slate-500 bg-slate-100 dark:bg-slate-800",
  },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40",
  },
  {
    id: "COMPLETED",
    label: "Completed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
  },
];

function SortableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

function ColumnSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskBoardView({ tasks, isLoading }: TaskBoardViewProps) {
  const { updateTask } = useTaskMutations();
  const openTaskModal = useUIStore((s) => s.openTaskModal);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const columns = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      tasks: tasks.filter((t) => t.status === col.id),
    }));
  }, [tasks]);

  const taskById = useMemo(() => {
    const map: Record<string, Task> = {};
    tasks.forEach((t) => (map[t.id] = t));
    return map;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = taskById[event.active.id as string];
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTask = taskById[active.id as string];
    if (!activeTask) return;

    // Dropped on a column container
    const targetStatus = over.id as TaskStatus;
    if (TASK_STATUSES.includes(targetStatus) && activeTask.status !== targetStatus) {
      updateTask.mutate(
        { id: activeTask.id, data: { status: targetStatus } },
        { onError: () => toast.error("Failed to move task") }
      );
      return;
    }

    // Dropped on another task — infer column from that task
    const overTask = taskById[over.id as string];
    if (overTask && overTask.status !== activeTask.status) {
      updateTask.mutate(
        { id: activeTask.id, data: { status: overTask.status } },
        { onError: () => toast.error("Failed to move task") }
      );
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handled in dragEnd for simplicity
    void event;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {columns.map((col, colIdx) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIdx * 0.08, duration: 0.3 }}
            className="flex flex-col rounded-2xl border bg-card/40 backdrop-blur-sm overflow-hidden"
            id={col.id}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <span className={cn("flex items-center justify-center w-6 h-6 rounded-full", col.color)}>
                  {col.icon}
                </span>
                <span className="font-semibold text-sm text-foreground">{col.label}</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                  {isLoading ? "—" : col.tasks.length}
                </Badge>
              </div>

              <button
                onClick={() => openTaskModal()}
                className="h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Add task"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Column Tasks */}
            <div
              id={col.id}
              className="flex-1 p-3 space-y-3 min-h-[200px] overflow-y-auto"
            >
              {isLoading ? (
                <ColumnSkeleton />
              ) : col.tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <CircleDot className="h-6 w-6 text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">No tasks here</p>
                  <p className="text-xs text-muted-foreground/60">Drag tasks here or create one</p>
                </div>
              ) : (
                <SortableContext
                  items={col.tasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {col.tasks.map((task) => (
                    <SortableTaskCard key={task.id} task={task} />
                  ))}
                </SortableContext>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 shadow-glow scale-105 transition-transform">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
