import Link from "next/link";
import { Bell, Briefcase, CheckCircle2, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type {
  AgencyDashboardSummary,
  BrandDashboardSummary,
} from "@/lib/redux/endpoints/dashboard-api";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApplicationStatusBadge } from "./status-badge";

type HiringSummary = BrandDashboardSummary | AgencyDashboardSummary;

const STATS: { key: keyof HiringSummary; label: string; icon: LucideIcon }[] = [
  { key: "postedOpportunitiesCount", label: "Opportunities Posted", icon: Briefcase },
  { key: "activeOpportunitiesCount", label: "Active Postings", icon: CheckCircle2 },
  { key: "totalApplicantsCount", label: "Total Applicants", icon: Users },
  { key: "connectionsCount", label: "Connections", icon: Users },
  { key: "pendingConnectionRequestsCount", label: "Pending Requests", icon: UserPlus },
  { key: "unreadNotificationsCount", label: "Unread Notifications", icon: Bell },
];

/** Shared presentation for Brand and Agency dashboards — see the note on
 * `TalentSummaryView` for why this is a shared view behind per-role wrapper
 * components rather than one component branching internally. */
export function HiringSummaryView({
  data,
  subtitle,
}: {
  data: HiringSummary;
  subtitle: string;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <Link href="/opportunities/new" className={buttonVariants({ size: "sm" })}>
          Post an opportunity
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.key} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <stat.icon className="size-4.5" />
            </span>
            <p className="mt-4 text-2xl font-semibold text-foreground tabular-nums">
              {data[stat.key] as number}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Recent applicants</h2>
        {data.recentApplicants.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No applicants yet — post an opportunity to start receiving applications.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {data.recentApplicants.map((applicant) => (
              <li
                key={applicant.applicationId}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <Avatar size="lg">
                  <AvatarImage src={applicant.applicantAvatarUrl ?? undefined} />
                  <AvatarFallback>{initialsFromName(applicant.applicantName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {applicant.applicantName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Applied to {applicant.opportunityTitle} · {formatRelativeTime(applicant.appliedAt)}
                  </p>
                </div>
                <ApplicationStatusBadge status={applicant.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
