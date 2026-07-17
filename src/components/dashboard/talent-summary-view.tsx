import Link from "next/link";
import { Bell, Bookmark, Eye, Rss, Send, TrendingUp, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type {
  CreatorDashboardSummary,
  FreelancerDashboardSummary,
} from "@/lib/redux/endpoints/dashboard-api";
import { formatRelativeTime } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { ApplicationStatusBadge } from "./status-badge";

type TalentSummary = CreatorDashboardSummary | FreelancerDashboardSummary;

const STATS: {
  key: keyof TalentSummary;
  label: string;
  icon: LucideIcon;
  format?: (value: number) => string;
}[] = [
  { key: "profileViewsCount", label: "Profile Views (30d)", icon: Eye },
  {
    key: "connectionsGrowthLast30Days",
    label: "Connection Growth (30d)",
    icon: TrendingUp,
    format: (value) => (value > 0 ? `+${value}` : `${value}`),
  },
  { key: "applicationsSubmittedCount", label: "Applications Submitted", icon: Send },
  { key: "savedOpportunitiesCount", label: "Saved Opportunities", icon: Bookmark },
  { key: "connectionsCount", label: "Connections", icon: Users },
  { key: "pendingConnectionRequestsCount", label: "Pending Requests", icon: UserPlus },
  { key: "unreadNotificationsCount", label: "Unread Notifications", icon: Bell },
  { key: "postsCount", label: "Posts Published", icon: Rss },
];

/** Shared presentation for Creator and Freelancer dashboards — the two
 * roles' summaries are identical in shape today. `creator-dashboard.tsx` /
 * `freelancer-dashboard.tsx` each own their subtitle/CTA copy so a later
 * phase can diverge one role's dashboard (e.g. add an availability-calendar
 * widget just for one of them) without touching the other. */
export function TalentSummaryView({
  data,
  subtitle,
  ctaHref,
  ctaLabel,
}: {
  data: TalentSummary;
  subtitle: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <Link href={ctaHref} className={buttonVariants({ size: "sm" })}>
          {ctaLabel}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.key} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <stat.icon className="size-4.5" />
            </span>
            <p className="mt-4 text-2xl font-semibold text-foreground tabular-nums">
              {stat.format ? stat.format(data[stat.key] as number) : (data[stat.key] as number)}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Recent applications</h2>
        {data.recentApplications.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            You haven&apos;t applied to any opportunities yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {data.recentApplications.map((application) => (
              <li
                key={application.applicationId}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {application.opportunityTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Applied {formatRelativeTime(application.appliedAt)}
                  </p>
                </div>
                <ApplicationStatusBadge status={application.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
