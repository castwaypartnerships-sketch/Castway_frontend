"use client";

import { useState } from "react";
import { Bookmark, Briefcase, DollarSign, MapPin } from "lucide-react";
import { toast } from "sonner";

import type { Opportunity } from "@/lib/types/opportunity";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import {
  useApplyToOpportunityMutation,
  useToggleSaveOpportunityMutation,
} from "@/lib/redux/endpoints/opportunities-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useGetProposalTemplatesQuery } from "@/lib/redux/endpoints/proposal-templates-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { canApplyToOpportunity } from "@/lib/rbac";

const TYPE_LABEL: Record<Opportunity["type"], string> = {
  HIRING: "Hiring",
  COLLABORATION: "Collaboration",
  BRAND_DEAL: "Brand Deal",
  FREELANCE_GIG: "Freelance Gig",
};

export function OpportunityCard({ opportunity, initiallySaved = false }: { opportunity: Opportunity; initiallySaved?: boolean }) {
  const [apply, { isLoading: isApplying, isSuccess: hasApplied }] = useApplyToOpportunityMutation();
  const [toggleSave] = useToggleSaveOpportunityMutation();
  const [saved, setSaved] = useState(initiallySaved);
  const { data: session } = useGetSessionQuery();
  const canApply = canApplyToOpportunity(session?.user?.role);
  const isFreelancer = session?.user?.role === "FREELANCER";
  const [composing, setComposing] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const { data: templates } = useGetProposalTemplatesQuery(undefined, { skip: !isFreelancer });

  async function handleSave() {
    setSaved((prev) => !prev);
    try {
      await toggleSave(opportunity.id).unwrap();
    } catch {
      setSaved((prev) => !prev);
    }
  }

  async function handleApply(applyMessage?: string) {
    try {
      await apply({ opportunityId: opportunity.id, message: applyMessage }).unwrap();
      setComposing(false);
    } catch (err) {
      const fallback = "Couldn't submit your application. Please try again.";
      const description =
        err && typeof err === "object" && "data" in err && err.data && typeof err.data === "object" && "error" in err.data
          ? String((err.data as { error: unknown }).error)
          : fallback;
      toast.error(description);
    }
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar size="lg">
            <AvatarImage src={opportunity.poster.avatarUrl ?? undefined} />
            <AvatarFallback>{initialsFromName(opportunity.poster.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{opportunity.poster.name}</p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                {TYPE_LABEL[opportunity.type]}
              </span>
              {opportunity.status === "CLOSED" ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                  Closed
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <time
          dateTime={opportunity.createdAt}
          className="shrink-0 text-xs whitespace-nowrap text-muted-foreground"
        >
          {formatRelativeTime(opportunity.createdAt)}
        </time>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-foreground">{opportunity.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{opportunity.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        {opportunity.budget ? (
          <span className="flex items-center gap-1.5">
            <DollarSign className="size-3.5 text-primary" />
            {opportunity.budget}
          </span>
        ) : null}
        {opportunity.location ? (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" />
            {opportunity.location}
            {opportunity.isRemote ? " · Remote" : ""}
          </span>
        ) : null}
        {opportunity.category ? (
          <span className="flex items-center gap-1.5">
            <Briefcase className="size-3.5 text-primary" />
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
          <Bookmark className={cn("size-4", saved && "fill-foreground")} />
        </Button>
        {canApply && !composing ? (
          <Button
            size="sm"
            disabled={isApplying || hasApplied || opportunity.status === "CLOSED"}
            onClick={() => {
              if (isFreelancer) setComposing(true);
              else void handleApply();
            }}
          >
            {hasApplied ? "Applied" : opportunity.status === "CLOSED" ? "Closed" : isApplying ? "Applying…" : "Apply"}
          </Button>
        ) : null}
      </div>

      {composing ? (
        <div className="mt-4 space-y-3 rounded-xl border border-border p-4">
          {templates && templates.items.length > 0 ? (
            <Select
              value={selectedTemplateId}
              onValueChange={(id) => {
                setSelectedTemplateId(id);
                const template = templates.items.find((t) => t.id === id);
                if (template) setMessage(template.body);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Use a proposal template…">
                  {(id: string | null) => templates.items.find((t) => t.id === id)?.title}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {templates.items.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your pitch…"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={isApplying}
              onClick={() => void handleApply(message || undefined)}
            >
              {isApplying ? "Applying…" : "Send application"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setComposing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
