"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, SlidersHorizontal, Plus, X } from "lucide-react";
import { useUIStore } from "@/store/ui.store";
import { useTasks } from "@/hooks/useTasks";
import { TaskListView } from "@/features/tasks/TaskListView";
import { TaskBoardView } from "@/features/tasks/TaskBoardView";
import { TaskModal } from "@/features/tasks/TaskModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TaskStatus, Priority } from "@/lib/types";

export default function TasksPage() {
  const {
    viewMode,
    setViewMode,
    openTaskModal,
    taskModalOpen,
    editingTask,
    searchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    clearFilters,
  } = useUIStore();

  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const hasFilters = !!(searchQuery || selectedStatus || selectedPriority);

  const filters = {
    page,
    limit: 20,
    ...(searchQuery && { search: searchQuery }),
    ...(selectedStatus && { status: selectedStatus as TaskStatus }),
    ...(selectedPriority && { priority: selectedPriority as Priority }),
  };

  const { data, isLoading, isFetching } = useTasks(filters);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {data?.pagination.total ?? 0} tasks total
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-all duration-200",
                viewMode === "list"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={cn(
                "p-1.5 rounded-md transition-all duration-200",
                viewMode === "board"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Board view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Filters button */}
          <Button
            variant={hasFilters ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="ml-1 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {[searchQuery, selectedStatus, selectedPriority].filter(Boolean).length}
              </span>
            )}
          </Button>

          <Button
            variant="gradient"
            size="sm"
            className="gap-1.5"
            onClick={() => openTaskModal()}
          >
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-5 p-4 bg-card border border-border rounded-xl flex flex-wrap items-center gap-3"
        >
          <Select
            value={selectedStatus || "all"}
            onValueChange={(v) => setSelectedStatus(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedPriority || "all"}
            onValueChange={(v) => setSelectedPriority(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="HIGH">High Priority</SelectItem>
              <SelectItem value="MEDIUM">Medium Priority</SelectItem>
              <SelectItem value="LOW">Low Priority</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={clearFilters}
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </Button>
          )}
        </motion.div>
      )}

      {/* Task views */}
      {viewMode === "list" ? (
        <TaskListView
          tasks={data?.tasks ?? []}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={data?.pagination}
          page={page}
          onPageChange={setPage}
        />
      ) : (
        <TaskBoardView tasks={data?.tasks ?? []} isLoading={isLoading} />
      )}

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        task={editingTask}
      />
    </div>
  );
}
