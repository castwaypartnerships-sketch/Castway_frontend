"use client";

import type { LucideIcon } from "lucide-react";
import { Briefcase, Eye, MessageCircle, Sparkles, Users } from "lucide-react";

import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";
import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-[#476948] dark:text-[#a7d9b5]" />
        <p className="text-xs font-medium">{label}</p>
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold text-foreground tabular-nums">{value}</p>
    </div>
  );
}

export function FeedStatsRow() {
  const { data: session } = useGetSessionQuery();
  // AGENCY_MANAGER has no dashboard of its own (see dashboard.service.ts) —
  // skip so this doesn't 403 on every page load for that role.
  const { data: dashboard, isLoading: dashboardLoading } = useGetDashboardQuery(undefined, {
    skip: session?.user?.role === "AGENCY_MANAGER",
  });
  const { data: profileData, isLoading: profileLoading } = useGetOwnProfileQuery();

  if (dashboardLoading || profileLoading) {
    return (
      <div className="hidden gap-4 md:flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 flex-1 animate-pulse rounded-2xl border border-border bg-muted" />
        ))}
      </div>
    );
  }
  if (!dashboard) return null;

  const isTalent = dashboard.kind === "CREATOR" || dashboard.kind === "FREELANCER";

  return (
    <div className="hidden flex-wrap gap-4 md:flex">
      {isTalent ? (
        <StatCard icon={Sparkles} label="New Opportunities" value={dashboard.newOpportunitiesCount} />
      ) : null}
      <StatCard icon={Users} label="Connections" value={dashboard.connectionsCount} />
      <StatCard icon={MessageCircle} label="Unread Messages" value={dashboard.unreadMessagesCount} />
      <StatCard icon={Eye} label="Portfolio Views" value={dashboard.profileViewsCount} />
      {profileData ? (
        <StatCard icon={Briefcase} label="Profile Strength" value={`${profileData.completion.percent}%`} />
      ) : null}
    </div>
  );
}
