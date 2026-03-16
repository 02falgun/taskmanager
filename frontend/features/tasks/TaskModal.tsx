"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarIcon, Tag, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskMutations } from "@/hooks/useTasks";
import { useUIStore } from "@/store/ui.store";
import { Task, TaskStatus, Priority, CreateTaskPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import React from "react";

const TASK_STATUS_VALUES = ["TODO", "IN_PROGRESS", "COMPLETED"] as const;
const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  status: z.enum(TASK_STATUS_VALUES),
  priority: z.enum(PRIORITY_VALUES),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskModalProps {
  open: boolean;
  task?: Task | null;
}

export function TaskModal({ open, task }: TaskModalProps) {
  const closeTaskModal = useUIStore((s) => s.closeTaskModal);
  const { createTask, updateTask } = useTaskMutations();
  const isEditing = !!task;
  const [tagInput, setTagInput] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      tags: [],
    },
  });

  const tags = watch("tags") ?? [];
  const status = watch("status");
  const priority = watch("priority");

  useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
          tags: task.tags ?? [],
        });
      } else {
        reset({
          title: "",
          description: "",
          status: "TODO",
          priority: "MEDIUM",
          dueDate: "",
          tags: [],
        });
      }
      setTagInput("");
    }
  }, [open, task, reset]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setValue("tags", [...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setValue("tags", tags.filter((existingTag: string) => existingTag !== tag));
  };

  const onSubmit = async (data: TaskFormValues) => {
    const payload: CreateTaskPayload = {
      title: data.title,
      description: data.description || undefined,
      status: data.status as TaskStatus,
      priority: data.priority as Priority,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      tags: data.tags,
    };

    if (isEditing && task) {
      updateTask.mutate(
        { id: task.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Task updated");
            closeTaskModal();
          },
          onError: () => toast.error("Failed to update task"),
        }
      );
    } else {
      createTask.mutate(payload, {
        onSuccess: () => {
          toast.success("Task created");
          closeTaskModal();
        },
        onError: () => toast.error("Failed to create task"),
      });
    }
  };

  const isPending = createTask.isPending || updateTask.isPending || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeTaskModal()}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden">
        {/* Priority accent bar */}
        <div
          className={cn(
            "h-1 w-full transition-colors duration-300",
            priority === "HIGH" && "bg-red-500",
            priority === "MEDIUM" && "bg-amber-500",
            priority === "LOW" && "bg-emerald-500"
          )}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isEditing ? "Edit Task" : "New Task"}
            </DialogTitle>
          </DialogHeader>

          {/* Title */}
          <div className="space-y-1">
            <Input
              label="Title"
              placeholder="What needs to be done?"
              error={errors.title?.message}
              {...register("title")}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Textarea
              label="Description"
              placeholder="Add more details… (optional)"
              error={errors.description?.message}
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select
                value={status}
                  onValueChange={(v) => setValue("status", v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">Todo</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Select
                value={priority}
                  onValueChange={(v) => setValue("priority", v as Priority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Due Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                className={cn(
                  "w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                  "text-foreground transition-all duration-200"
                )}
                {...register("dueDate")}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tags</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Add a tag…"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className={cn(
                    "w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                    "text-foreground transition-all duration-200"
                  )}
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-10">
                Add
              </Button>
            </div>

            <AnimatePresence>
              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-1.5 pt-1"
                >
                  {tags.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500 transition-colors ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={closeTaskModal} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" loading={isPending}>
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
