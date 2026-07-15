"use client";

import { CheckCircle2 } from "lucide-react";

import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";

export function ProfileCompletionCard() {
  const { data, isLoading, isError } = useGetOwnProfileQuery();

  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-2xl border border-border bg-muted" />;
  }
  if (isError || !data) return null;

  const { completion } = data;
  const isComplete = completion.percent >= 100;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <CircularProgress percent={completion.percent} size={56} strokeWidth={5}>
          <span className="text-sm font-semibold text-foreground">{completion.percent}%</span>
        </CircularProgress>
        <div>
          <p className="text-sm font-semibold text-foreground">Profile Completion</p>
          <p className="text-xs text-muted-foreground">
            {isComplete ? "Ready to work!" : "A few steps left"}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {completion.tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 text-sm">
            <CheckCircle2
              className={cn(
                "size-4 shrink-0",
                task.done ? "text-success" : "text-muted-foreground/40",
              )}
            />
            <span className={cn(task.done && "text-muted-foreground line-through")}>
              {task.label}
              {task.bonusLabel ? ` (${task.bonusLabel})` : ""}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
