"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Users } from "lucide-react";

import type { Opportunity, OpportunityStatus } from "@/lib/types/opportunity";
import {
  useDeleteOpportunityMutation,
  useGetMyOpportunitiesQuery,
  useTransitionOpportunityMutation,
} from "@/lib/redux/endpoints/opportunities-api";
import { RoleGuard } from "@/components/auth/role-guard";
import { OPPORTUNITY_POSTER_ROLES } from "@/lib/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApplicantsList } from "@/components/opportunities/applicants-list";
import { formatRelativeTime } from "@/lib/format";

const STATUS_LABEL: Record<OpportunityStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  PAUSED: "Paused",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
  DELETED: "Deleted",
};

const STATUS_VARIANT: Record<OpportunityStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  OPEN: "default",
  PAUSED: "secondary",
  CLOSED: "secondary",
  ARCHIVED: "outline",
  DELETED: "destructive",
};

type LifecycleAction = "publish" | "pause" | "resume" | "close" | "reopen" | "archive";

const PAST_TENSE: Record<LifecycleAction, string> = {
  publish: "Published",
  pause: "Paused",
  resume: "Resumed",
  close: "Closed",
  reopen: "Reopened",
  archive: "Archived",
};

/** Mirrors `ALLOWED_TRANSITIONS` in `backend/src/modules/opportunity/opportunity.service.ts`
 * — kept as UI-facing actions (not raw target statuses) so only the actions
 * that make sense from each state are ever shown. */
const NEXT_ACTIONS: Record<OpportunityStatus, { action: LifecycleAction; label: string }[]> = {
  DRAFT: [
    { action: "publish", label: "Publish" },
    { action: "archive", label: "Archive" },
  ],
  OPEN: [
    { action: "pause", label: "Pause" },
    { action: "close", label: "Close" },
    { action: "archive", label: "Archive" },
  ],
  PAUSED: [
    { action: "resume", label: "Resume" },
    { action: "close", label: "Close" },
    { action: "archive", label: "Archive" },
  ],
  CLOSED: [
    { action: "reopen", label: "Reopen" },
    { action: "archive", label: "Archive" },
  ],
  ARCHIVED: [{ action: "reopen", label: "Restore to Open" }],
  DELETED: [],
};

export default function MyOpportunitiesPage() {
  const [applicantsFor, setApplicantsFor] = useState<Opportunity | null>(null);

  return (
    <RoleGuard allowed={OPPORTUNITY_POSTER_ROLES} redirectTo="/opportunities">
      <div className="mx-auto max-w-3xl space-y-5 px-6 py-6">
        <Link
          href="/opportunities"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Opportunities
        </Link>

        <div>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">My Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            Manage the lifecycle of opportunities you&apos;ve posted and review applicants.
          </p>
        </div>

        <OwnOpportunitiesList onViewApplicants={setApplicantsFor} />

        <Dialog open={applicantsFor !== null} onOpenChange={(open) => !open && setApplicantsFor(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{applicantsFor ? `Applicants — ${applicantsFor.title}` : "Applicants"}</DialogTitle>
            </DialogHeader>
            {applicantsFor ? <ApplicantsList opportunityId={applicantsFor.id} /> : null}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}

function OwnOpportunitiesList({ onViewApplicants }: { onViewApplicants: (opportunity: Opportunity) => void }) {
  const { data, isLoading, isError } = useGetMyOpportunitiesQuery();
  const [transition, { isLoading: isTransitioning }] = useTransitionOpportunityMutation();
  const [deleteOpportunity, { isLoading: isDeleting }] = useDeleteOpportunityMutation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-2xl border border-dashed border-destructive/40 py-16 text-center text-sm text-destructive">
        Couldn&apos;t load your opportunities.
      </p>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        You haven&apos;t posted any opportunities yet.
      </p>
    );
  }

  async function handleTransition(opportunity: Opportunity, action: LifecycleAction) {
    try {
      await transition({ id: opportunity.id, action }).unwrap();
      toast.success(`${PAST_TENSE[action]} "${opportunity.title}"`);
    } catch {
      toast.error(`Couldn't ${action} that opportunity. Please try again.`);
    }
  }

  async function handleDelete(opportunity: Opportunity) {
    if (!confirm("Delete this opportunity? This can't be undone.")) return;
    try {
      await deleteOpportunity(opportunity.id).unwrap();
      toast.success(`Deleted "${opportunity.title}"`);
    } catch {
      toast.error("Couldn't delete that opportunity. Please try again.");
    }
  }

  return (
    <ul className="space-y-3">
      {data.items.map((opportunity) => (
        <li
          key={opportunity.id}
          className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{opportunity.title}</p>
              <p className="text-xs text-muted-foreground">
                Posted {formatRelativeTime(opportunity.createdAt)}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[opportunity.status]}>{STATUS_LABEL[opportunity.status]}</Badge>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {NEXT_ACTIONS[opportunity.status].map(({ action, label }) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                disabled={isTransitioning}
                onClick={() => handleTransition(opportunity, action)}
              >
                {label}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onViewApplicants(opportunity)}>
              <Users className="size-3.5" />
              Applicants
            </Button>
            <Link
              href={`/opportunities/${opportunity.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <Pencil className="size-3.5" />
              Edit
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              disabled={isDeleting}
              onClick={() => handleDelete(opportunity)}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
