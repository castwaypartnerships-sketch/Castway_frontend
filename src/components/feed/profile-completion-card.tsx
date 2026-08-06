"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";

import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import { CircularProgress } from "@/components/ui/circular-progress";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Mirrors the task ids from `buildProfileCompletion` (backend) to the
// section each one is actually completed in on `/profile/edit`.
const TASK_ANCHORS: Record<string, string> = {
  avatar: "avatar-section",
  bio: "bio",
  portfolio: "portfolio-section",
  services: "services",
  skills: "skills",
  location: "location",
  socialLinks: "social-links-section",
  availability: "availability-section",
};

export function ProfileCompletionCard() {
  const { data, isLoading, isError } = useGetOwnProfileQuery();

  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-2xl border border-border bg-muted" />;
  }
  if (isError || !data) return null;

  const { completion } = data;
  const isComplete = completion.percent >= 100;

  // Hide the entire card once the profile is fully complete
  if (isComplete) return null;

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
        {completion.tasks.map((task) => {
          const anchor = TASK_ANCHORS[task.id];
          const content = (
            <>
              <CheckCircle2
                className={cn(
                  "size-4 shrink-0",
                  task.done ? "text-success" : "text-muted-foreground/40",
                )}
              />
              <span className={cn("flex-1", task.done && "text-muted-foreground line-through")}>
                {task.label}
              </span>
              {!task.done && anchor ? (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
              ) : null}
            </>
          );

          return (
            <li key={task.id} className="text-sm">
              {!task.done && anchor ? (
                <Link
                  href={`/profile/edit#${anchor}`}
                  className="flex items-center gap-2 rounded-md transition-colors hover:text-[#476948] dark:hover:text-[#a7d9b5]"
                >
                  {content}
                </Link>
              ) : (
                <span className="flex items-center gap-2">{content}</span>
              )}
            </li>
          );
        })}
      </ul>

      {!isComplete ? (
        <Link
          href="/profile/edit"
          className={cn(
            buttonVariants({ size: "sm" }),
            "mt-4 w-full bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]",
          )}
        >
          Complete your profile
        </Link>
      ) : null}
    </section>
  );
}
