"use client";

import { Bell, Briefcase, MessageSquare, Rss, Send, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useGetDashboardQuery, type DashboardSummary } from "@/lib/redux/endpoints/dashboard-api";

const STATS: { key: keyof DashboardSummary; label: string; icon: LucideIcon }[] = [
  { key: "postedOpportunitiesCount", label: "Opportunities Posted", icon: Briefcase },
  { key: "applicationsSubmittedCount", label: "Applications Submitted", icon: Send },
  { key: "connectionsCount", label: "Connections", icon: Users },
  { key: "pendingConnectionRequestsCount", label: "Pending Requests", icon: UserPlus },
  { key: "conversationsCount", label: "Conversations", icon: MessageSquare },
  { key: "unreadNotificationsCount", label: "Unread Notifications", icon: Bell },
  { key: "postsCount", label: "Posts Published", icon: Rss },
];

export default function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardQuery();

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <h1 className="text-lg font-semibold text-foreground">Dashboard & Stats</h1>
      <p className="text-sm text-muted-foreground">A quick read on your activity across Castway.</p>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : isError || !data ? (
        <p className="mt-6 rounded-2xl border border-dashed border-destructive/40 py-16 text-center text-sm text-destructive">
          Couldn&apos;t load your stats.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.key} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-4.5" />
              </span>
              <p className="mt-4 text-2xl font-semibold text-foreground tabular-nums">{data[stat.key]}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
