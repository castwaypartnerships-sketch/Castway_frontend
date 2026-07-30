"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";

/** Real, platform-wide "opportunities posted in the last 7 days" count —
 * talent roles only (Brand/Agency post opportunities rather than browse
 * them, so `newOpportunitiesCount` isn't in their dashboard summary). */
export function NewOpportunitiesCard() {
  const { data: dashboard, isLoading } = useGetDashboardQuery();

  if (isLoading) return <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />;
  if (!dashboard || !("newOpportunitiesCount" in dashboard)) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
        This Week&apos;s Opportunities
      </h3>
      <p className="mt-3 text-2xl font-bold text-foreground">{dashboard.newOpportunitiesCount}</p>
      <p className="mt-1 text-xs text-muted-foreground">new opportunities posted in the last 7 days.</p>
      <Link
        href="/opportunities"
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1c3322] dark:text-[#a7d9b5]"
      >
        Explore opportunities
        <ArrowRight className="size-3" />
      </Link>
    </section>
  );
}
