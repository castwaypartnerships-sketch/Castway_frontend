"use client";

import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { CreatorDashboard } from "@/components/dashboard/creator-dashboard";
import { FreelancerDashboard } from "@/components/dashboard/freelancer-dashboard";
import { BrandDashboard } from "@/components/dashboard/brand-dashboard";
import { AgencyDashboard } from "@/components/dashboard/agency-dashboard";
import { RecentActivitySection } from "@/components/dashboard/recent-activity-section";
import { ProfileCompletionCard } from "@/components/feed/profile-completion-card";

export default function HomePage() {
  const { data, isLoading, isError } = useGetDashboardQuery();
  const { data: session } = useGetSessionQuery();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-6">
      <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Home</h1>

      <ProfileCompletionCard />

      <RecentActivitySection role={session?.user?.role} />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : isError || !data ? (
        <p className="rounded-2xl border border-dashed border-destructive/40 py-16 text-center text-sm text-destructive">
          Couldn&apos;t load your stats.
        </p>
      ) : (
        <div>
          {data.kind === "CREATOR" ? <CreatorDashboard data={data} /> : null}
          {data.kind === "FREELANCER" ? <FreelancerDashboard data={data} /> : null}
          {data.kind === "BRAND" ? <BrandDashboard data={data} /> : null}
          {data.kind === "AGENCY" ? <AgencyDashboard data={data} /> : null}
        </div>
      )}
    </div>
  );
}
