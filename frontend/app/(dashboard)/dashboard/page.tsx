"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { useTaskStats, useTasks } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCard } from "@/features/tasks/TaskCard";
import { cn } from "@/lib/utils";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { openTaskModal } = useUIStore();
  const { data: stats, isLoading: statsLoading } = useTaskStats();
  const { data: recentTasksData, isLoading: tasksLoading } = useTasks({
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const statCards = [
    {
      title: "Total Tasks",
      value: stats?.total ?? 0,
      icon: CheckCircle2,
      description: "All tasks",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      title: "In Progress",
      value: stats?.inProgress ?? 0,
      icon: Clock,
      description: "Currently active",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Completed",
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      description: `${stats?.completionRate ?? 0}% completion rate`,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Overdue",
      value: stats?.overdue ?? 0,
      icon: AlertCircle,
      description: "Needs attention",
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your tasks today.
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => openTaskModal()}
          className="gap-2 hidden sm:flex"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          : statCards.map((stat, i) => (
              <motion.div key={stat.title} variants={fadeInUp}>
                <Card className="hover:shadow-soft-lg transition-all duration-200 group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                          stat.bg
                        )}
                      >
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-sm font-medium text-foreground mt-0.5">
                        {stat.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </motion.div>

      {/* Progress bar */}
      {!statsLoading && stats && stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Overall Progress</span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {stats.completionRate}%
                </span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionRate}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{stats.completed} completed</span>
                <span>{stats.total - stats.completed} remaining</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Tasks</h2>
          <Link href="/dashboard/tasks">
            <Button variant="ghost" size="sm" className="gap-1.5">
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {tasksLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : !recentTasksData?.tasks?.length ? (
          <EmptyState onCreateTask={() => openTaskModal()} />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {recentTasksData.tasks.map((task) => (
              <motion.div key={task.id} variants={fadeInUp}>
                <TaskCard task={task} compact />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function EmptyState({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 px-8"
    >
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
        Create your first task to get started with organizing your work.
      </p>
      <Button variant="gradient" onClick={onCreateTask} className="gap-2">
        <Plus className="w-4 h-4" />
        Create your first task
      </Button>
    </motion.div>
  );
}
