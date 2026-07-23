"use client";

import Link from "next/link";
import { toast } from "sonner";

import {
  useGetApplicationsForOpportunityQuery,
  useSetApplicationStatusMutation,
} from "@/lib/redux/endpoints/applications-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, initialsFromName } from "@/lib/format";

export function ApplicantsList({ opportunityId }: { opportunityId: string }) {
  const { data, isLoading } = useGetApplicationsForOpportunityQuery(opportunityId);
  const [setStatus, { isLoading: isUpdating }] = useSetApplicationStatusMutation();

  async function handleStatus(applicationId: string, applicantName: string, status: "ACCEPTED" | "REJECTED") {
    try {
      await setStatus({ applicationId, opportunityId, status }).unwrap();
      toast.success(status === "ACCEPTED" ? `Accepted ${applicantName}` : `Rejected ${applicantName}`);
    } catch {
      toast.error("Couldn't update that application. Please try again.");
    }
  }

  if (isLoading) {
    return <div className="mt-4 h-24 animate-pulse rounded-xl bg-muted" />;
  }

  if (!data || data.items.length === 0) {
    return <p className="mt-4 text-sm text-muted-foreground">No applicants yet.</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {data.items.map((application) => (
        <li key={application.id} className="flex items-start justify-between gap-3 rounded-xl border border-border p-3">
          <Link
            href={`/profile/${application.applicant.username}`}
            className="group/applicant flex min-w-0 items-start gap-2.5"
          >
            <Avatar size="sm" className="transition-transform group-hover/applicant:scale-105">
              <AvatarImage src={application.applicant.avatarUrl ?? undefined} />
              <AvatarFallback>{initialsFromName(application.applicant.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground group-hover/applicant:underline">
                {application.applicant.name}
              </p>
              {application.message ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{application.message}</p>
              ) : null}
              <p className="mt-0.5 text-xs text-muted-foreground">
                Applied {formatRelativeTime(application.createdAt)}
              </p>
            </div>
          </Link>
          {application.status === "PENDING" ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdating}
                onClick={() => handleStatus(application.id, application.applicant.name, "REJECTED")}
              >
                Reject
              </Button>
              <Button
                size="sm"
                disabled={isUpdating}
                onClick={() => handleStatus(application.id, application.applicant.name, "ACCEPTED")}
              >
                Accept
              </Button>
            </div>
          ) : (
            <Badge variant={application.status === "ACCEPTED" ? "default" : "secondary"}>
              {application.status === "ACCEPTED" ? "Accepted" : application.status === "REJECTED" ? "Rejected" : "Withdrawn"}
            </Badge>
          )}
        </li>
      ))}
    </ul>
  );
}
