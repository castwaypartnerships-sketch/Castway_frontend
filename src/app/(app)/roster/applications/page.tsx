"use client";

import Link from "next/link";

import { useGetRosterApplicationsQuery } from "@/lib/redux/endpoints/applications-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initialsFromName } from "@/lib/format";

const STATUS_VARIANT = {
  PENDING: "outline",
  ACCEPTED: "default",
  REJECTED: "outline",
  WITHDRAWN: "outline",
} as const;

/** Batch application management — an Agency's aggregated view of every
 * ACCEPTED roster member's own applications, across every opportunity. */
export default function RosterApplicationsPage() {
  const { data, isLoading } = useGetRosterApplicationsQuery();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Roster Applications
        </h1>
        <p className="text-sm text-muted-foreground">
          Every application your roster members have sent, across all opportunities.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
          <div className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No applications from your roster yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((application) => (
            <li key={application.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarImage src={application.applicant.avatarUrl ?? undefined} />
                    <AvatarFallback>{initialsFromName(application.applicant.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link
                      href={`/opportunities/${application.opportunity.id}`}
                      className="truncate text-sm font-medium text-foreground hover:underline"
                    >
                      {application.opportunity.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {application.applicant.name}
                      {application.opportunity.budget ? ` · ${application.opportunity.budget}` : ""}
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[application.status]} className="shrink-0">
                  {application.status}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
