"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Target,
} from "lucide-react";
import { useTaskStats } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-card hover:shadow-soft-lg transition-shadow duration-300">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">{label}</p>
              <p className="text-3xl font-bold mt-1 text-foreground">{value}</p>
              {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </div>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <motion.div
        className={cn("h-full rounded-full", color)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      />
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useTaskStats();

  const total = stats?.totalTasks ?? 0;
  const completed = stats?.completedTasks ?? 0;
  const pending = stats?.pendingTasks ?? 0;
  const inProgress = stats?.inProgress ?? 0;
  const todo = stats?.todo ?? Math.max(pending - inProgress, 0);

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const inProgressRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const todoRate = total > 0 ? Math.round((todo / total) * 100) : 0;

  const priorityStats = [
    {
      label: "High Priority",
      value: stats?.highPriority ?? 0,
      color: "bg-red-500",
      textColor: "text-red-600",
    },
    {
      label: "Medium Priority",
      value: stats?.mediumPriority ?? 0,
      color: "bg-amber-500",
      textColor: "text-amber-600",
    },
    {
      label: "Low Priority",
      value: stats?.lowPriority ?? 0,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-11">
          Overview of your task performance and progress
        </p>
      </motion.div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            icon={<Target className="h-5 w-5 text-indigo-600" />}
            label="Total Tasks"
            value={total}
            color="bg-indigo-50 dark:bg-indigo-950/40"
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            label="Completed"
            value={completed}
            sub={`${completionRate}% completion rate`}
            color="bg-emerald-50 dark:bg-emerald-950/40"
          />
          <StatCard
            icon={<Loader2 className="h-5 w-5 text-blue-600" />}
            label="Pending"
            value={pending}
            color="bg-blue-50 dark:bg-blue-950/40"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            label="High Priority"
            value={stats?.highPriority ?? 0}
            color="bg-red-50 dark:bg-red-950/40"
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Completed
                      </span>
                      <span className="font-semibold text-foreground">
                        {completed} <span className="text-muted-foreground font-normal">({completionRate}%)</span>
                      </span>
                    </div>
                    <ProgressBar value={completionRate} color="bg-emerald-500" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 text-indigo-500" />
                        In Progress
                      </span>
                      <span className="font-semibold text-foreground">
                        {inProgress} <span className="text-muted-foreground font-normal">({inProgressRate}%)</span>
                      </span>
                    </div>
                    <ProgressBar value={inProgressRate} color="bg-indigo-500" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Circle className="h-4 w-4 text-slate-400" />
                        To Do
                      </span>
                      <span className="font-semibold text-foreground">
                        {todo} <span className="text-muted-foreground font-normal">({todoRate}%)</span>
                      </span>
                    </div>
                    <ProgressBar value={todoRate} color="bg-slate-400" />
                  </div>

                  {/* Visual donut approximation */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                      {completionRate > 0 && (
                        <div
                          className="bg-emerald-500 transition-all duration-700"
                          style={{ width: `${completionRate}%` }}
                        />
                      )}
                      {inProgressRate > 0 && (
                        <div
                          className="bg-indigo-500 transition-all duration-700"
                          style={{ width: `${inProgressRate}%` }}
                        />
                      )}
                      {todoRate > 0 && (
                        <div
                          className="bg-slate-300 dark:bg-slate-600 transition-all duration-700"
                          style={{ width: `${todoRate}%` }}
                        />
                      )}
                      {total === 0 && <div className="bg-muted w-full" />}
                    </div>
                    <div className="flex gap-4 mt-2">
                      {[
                        { label: "Done", color: "bg-emerald-500" },
                        { label: "Active", color: "bg-indigo-500" },
                        { label: "Todo", color: "bg-slate-300 dark:bg-slate-600" },
                      ].map((item) => (
                        <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span className={cn("w-2.5 h-2.5 rounded-sm", item.color)} />
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Priority breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {priorityStats.map((p) => {
                    const pct = total > 0 ? Math.round((p.value / total) * 100) : 0;
                    return (
                      <div key={p.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{p.label}</span>
                          <span className="font-semibold text-foreground">
                            {p.value} <span className="text-muted-foreground font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <ProgressBar value={pct} color={p.color} />
                      </div>
                    );
                  })}

                  {/* Bar chart */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-3">Tasks by priority</p>
                    <div className="flex items-end gap-3 h-24">
                      {priorityStats.map((p) => {
                        const maxVal = Math.max(...priorityStats.map((x) => x.value), 1);
                        const barHeight = total > 0 ? Math.max((p.value / maxVal) * 80, p.value > 0 ? 8 : 0) : 0;
                        return (
                          <div key={p.label} className="flex-1 flex flex-col items-center gap-1">
                            <span className={cn("text-xs font-semibold", p.textColor)}>{p.value}</span>
                            <motion.div
                              className={cn("w-full rounded-t-md", p.color)}
                              initial={{ height: 0 }}
                              animate={{ height: barHeight }}
                              transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
                            />
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {p.label.split(" ")[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </div>
  );
}
