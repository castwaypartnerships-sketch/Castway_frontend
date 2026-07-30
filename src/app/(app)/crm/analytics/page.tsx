"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useGetBrandRelationshipsQuery } from "@/lib/redux/endpoints/crm-api";
import type { DealStage } from "@/lib/types/crm";

const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  NEW_CONTACT: "New Contact",
  NEGOTIATING: "Negotiating",
  DEAL_CLOSED: "Deal Closed",
  PAST_COLLAB: "Past Collab",
  LOST: "Lost",
};

const STAGE_BAR_COLOR: Record<DealStage, string> = {
  NEW_CONTACT: "#9ca3af",
  NEGOTIATING: "#fbbf24",
  DEAL_CLOSED: "#476948",
  PAST_COLLAB: "#2563eb",
  LOST: "#e24b4a",
};

const DEAL_STAGES = Object.keys(DEAL_STAGE_LABELS) as DealStage[];

function currency(value: number): string {
  return `$${value.toLocaleString()}`;
}

export default function CrmAnalyticsPage() {
  const { data, isLoading } = useGetBrandRelationshipsQuery();
  const items = useMemo(() => data?.items ?? [], [data]);

  const stageCounts = useMemo(() => {
    const counts = new Map<DealStage, number>();
    for (const stage of DEAL_STAGES) counts.set(stage, 0);
    for (const item of items) counts.set(item.stage, (counts.get(item.stage) ?? 0) + 1);
    return counts;
  }, [items]);

  const closedDeals = items.filter((item) => item.stage === "DEAL_CLOSED");
  const closedWithValue = closedDeals.filter((item) => item.dealValue != null);
  const totalValueClosed = closedWithValue.reduce((sum, item) => sum + (item.dealValue ?? 0), 0);
  const averageDealValue = closedWithValue.length === 0 ? 0 : Math.round(totalValueClosed / closedWithValue.length);
  const lostCount = stageCounts.get("LOST") ?? 0;
  const decidedCount = closedDeals.length + lostCount;
  const winRate = decidedCount === 0 ? 0 : Math.round((closedDeals.length / decidedCount) * 100);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
      <Link
        href="/crm"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Brand CRM
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">CRM Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {`A snapshot of your pipeline, computed from the ${items.length} relationship${items.length === 1 ? "" : "s"} you're tracking.`}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Track a brand relationship first to see analytics here.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total Tracked", value: items.length },
              { label: "Deals Closed", value: closedDeals.length },
              { label: "Win Rate", value: `${winRate}%` },
              { label: "Avg. Deal Value", value: currency(averageDealValue) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">{stat.label}</p>
                <p className="mt-1 text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Total Value Closed</h2>
            <p className="mt-1 text-2xl font-bold text-foreground">{currency(totalValueClosed)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {closedWithValue.length} closed deal{closedWithValue.length === 1 ? "" : "s"} with a logged
              value{closedDeals.length > closedWithValue.length ? ` (${closedDeals.length - closedWithValue.length} closed without a value logged)` : ""}.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">Stage Distribution</h2>
            <div className="mt-4 space-y-3">
              {DEAL_STAGES.map((stage) => {
                const count = stageCounts.get(stage) ?? 0;
                const percent = items.length === 0 ? 0 : Math.round((count / items.length) * 100);
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{DEAL_STAGE_LABELS[stage]}</span>
                      <span className="font-bold text-foreground">
                        {count} · {percent}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: STAGE_BAR_COLOR[stage] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
