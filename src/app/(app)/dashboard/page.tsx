"use client";

import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";
import { CreatorDashboard } from "@/components/dashboard/creator-dashboard";
import { FreelancerDashboard } from "@/components/dashboard/freelancer-dashboard";
import { BrandDashboard } from "@/components/dashboard/brand-dashboard";
import { AgencyDashboard } from "@/components/dashboard/agency-dashboard";

export default function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardQuery();

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Dashboard & Stats</h1>

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
        <div className="mt-6">
          {data.kind === "CREATOR" ? <CreatorDashboard data={data} /> : null}
          {data.kind === "FREELANCER" ? <FreelancerDashboard data={data} /> : null}
          {data.kind === "BRAND" ? <BrandDashboard data={data} /> : null}
          {data.kind === "AGENCY" ? <AgencyDashboard data={data} /> : null}
        </div>
      )}
    </div>
  );
}
