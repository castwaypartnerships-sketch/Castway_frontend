import { Eye, TrendingUp, FileText } from "lucide-react";

import type { AgencyDashboardSummary } from "@/lib/redux/endpoints/dashboard-api";
import { HiringSummaryView } from "./hiring-summary-view";

const ROSTER_STATS = [
  { key: "rosterProfileViews" as const, label: "Roster Profile Views (30d)", icon: Eye },
  { key: "rosterConnectionsGrowthLast30Days" as const, label: "Roster Connection Growth", icon: TrendingUp },
  { key: "rosterApplicationsSentCount" as const, label: "Roster Applications Sent", icon: FileText },
];

export function AgencyDashboard({ data }: { data: AgencyDashboardSummary }) {
  return (
    <div className="space-y-8">
      <HiringSummaryView data={data} subtitle="Your postings and roster activity at a glance." />

      <section>
        <h2 className="text-sm font-semibold text-foreground">Roster-level analytics</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Aggregated across every roster member who has accepted your invite.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ROSTER_STATS.map((stat) => (
            <div key={stat.key} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-4.5" />
              </span>
              <p className="mt-4 font-mono text-2xl font-semibold text-foreground tabular-nums">
                {data[stat.key]}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
