"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Briefcase, Building2, DollarSign, MapPin } from "lucide-react";

import type { Opportunity } from "@/lib/types/opportunity";
import { formatDescription, formatRelativeTime, initialsFromName, truncateText } from "@/lib/format";
import { useToggleSaveOpportunityMutation } from "@/lib/redux/endpoints/opportunities-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApplyFlow } from "./use-apply-flow";
import { ApplyComposer } from "./apply-composer";

const TYPE_LABEL: Record<Opportunity["type"], string> = {
  HIRING: "Hiring",
  COLLABORATION: "Collaboration",
  BRAND_DEAL: "Brand Deal",
  FREELANCE_GIG: "Freelance Gig",
};

const SOURCE_LABEL: Record<string, string> = { linkedin: "LinkedIn" };

function sourceLabel(source: string) {
  return SOURCE_LABEL[source] ?? source.charAt(0).toUpperCase() + source.slice(1);
}

const STATUS_LABEL: Record<Opportunity["status"], string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  PAUSED: "Paused",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
  DELETED: "Deleted",
};

export function OpportunityCard({
  opportunity,
  initiallySaved = false,
  fullDescription = false,
}: {
  opportunity: Opportunity;
  initiallySaved?: boolean;
  /** Detail page passes true for the full, paragraph-formatted description;
   * list/feed views (the default) show a truncated single-line summary. */
  fullDescription?: boolean;
}) {
  const [toggleSave] = useToggleSaveOpportunityMutation();
  const [saved, setSaved] = useState(initiallySaved);
  const applyFlow = useApplyFlow(opportunity.id, opportunity.viewerHasApplied, opportunity.postedByUserId);
  const { canApply, isFreelancer, composing, setComposing, isApplying, hasApplied, handleApply } = applyFlow;

  async function handleSave() {
    setSaved((prev) => !prev);
    try {
      await toggleSave(opportunity.id).unwrap();
    } catch {
      setSaved((prev) => !prev);
    }
  }

  const typeStatusBadges = (
    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
      <span className="rounded-full bg-[#e6f4ea] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#2d4a35] uppercase dark:bg-[#1a261d] dark:text-[#daf0dd]">
        {TYPE_LABEL[opportunity.type]}
      </span>
      {opportunity.status !== "OPEN" ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
          {STATUS_LABEL[opportunity.status]}
        </span>
      ) : null}
    </div>
  );

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md [content-visibility:auto] [contain-intrinsic-size:auto_320px]">
      <div className="flex items-start justify-between gap-4">
        {opportunity.poster ? (
          <Link href={`/profile/${opportunity.poster.username}`} className="group/poster flex items-start gap-3">
            <Avatar size="lg" className="transition-transform group-hover/poster:scale-105">
              <AvatarImage src={opportunity.poster.avatarUrl ?? undefined} />
              <AvatarFallback>{initialsFromName(opportunity.poster.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover/poster:underline">
                {opportunity.poster.name}
              </p>
              {typeStatusBadges}
            </div>
          </Link>
        ) : (
          <a
            href={opportunity.sourceUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="group/poster flex items-start gap-3"
          >
            <Avatar size="lg" className="transition-transform group-hover/poster:scale-105">
              <AvatarFallback>{(opportunity.source ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover/poster:underline">
                {sourceLabel(opportunity.source ?? "")}
              </p>
              {typeStatusBadges}
            </div>
          </a>
        )}
        <time
          dateTime={opportunity.createdAt}
          className="shrink-0 text-xs whitespace-nowrap text-muted-foreground"
        >
          {formatRelativeTime(opportunity.createdAt)}
        </time>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-foreground hover:underline">
        <Link href={`/opportunities/${opportunity.id}`}>{opportunity.title}</Link>
      </h3>
      <p
        className={cn(
          "mt-2 text-sm leading-relaxed text-muted-foreground",
          fullDescription && "whitespace-pre-line",
        )}
      >
        {fullDescription ? formatDescription(opportunity.description) : truncateText(opportunity.description, 220)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {opportunity.company ? (
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <Building2 className="size-3.5 text-[#476948] dark:text-[#a7d9b5]" />
            {opportunity.company}
          </span>
        ) : null}
        {opportunity.budget ? (
          <span className="flex items-center gap-1.5">
            <DollarSign className="size-3.5 text-[#476948] dark:text-[#a7d9b5]" />
            {opportunity.budget}
          </span>
        ) : null}
        {opportunity.location ? (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-[#476948] dark:text-[#a7d9b5]" />
            {opportunity.location}
            {opportunity.isRemote ? " · Remote" : ""}
          </span>
        ) : null}
        {opportunity.category ? (
          <span className="flex items-center gap-1.5">
            <Briefcase className="size-3.5 text-[#476948] dark:text-[#a7d9b5]" />
            {opportunity.category}
          </span>
        ) : null}
      </div>

      {opportunity.skillsRequired.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {opportunity.skillsRequired.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleSave}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save opportunity"}
        >
          <Bookmark
            className={cn("size-4", saved && "fill-[#476948] text-[#476948] dark:fill-[#a7d9b5] dark:text-[#a7d9b5]")}
          />
        </Button>
        {opportunity.source ? (
          <a
            href={opportunity.sourceUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]",
            )}
          >
            Apply on {sourceLabel(opportunity.source)}
          </a>
        ) : canApply && !composing ? (
          <Button
            size="sm"
            className="bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
            disabled={isApplying || hasApplied || opportunity.status !== "OPEN"}
            onClick={() => {
              if (isFreelancer) setComposing(true);
              else void handleApply();
            }}
          >
            {hasApplied
              ? "Applied"
              : opportunity.status !== "OPEN"
                ? STATUS_LABEL[opportunity.status]
                : isApplying
                  ? "Applying…"
                  : "Apply"}
          </Button>
        ) : null}
      </div>

      {composing ? <ApplyComposer flow={applyFlow} /> : null}
    </article>
  );
}
