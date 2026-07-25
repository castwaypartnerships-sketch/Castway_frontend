"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, FileText, Link2, MessageSquare, Trash2, UserPlus } from "lucide-react";
import { ShortlistCommentThread } from "@/components/campaigns/shortlist-comment-thread";

import {
  useAddToShortlistMutation,
  useGetCampaignAnalyticsQuery,
  useGetCampaignQuery,
  useGetCampaignShortlistQuery,
  useRemoveFromShortlistMutation,
  useUpdateCampaignMutation,
} from "@/lib/redux/endpoints/campaigns-api";
import { useCreateOpportunityMutation } from "@/lib/redux/endpoints/opportunities-api";
import { useLazyGetPublicProfileQuery } from "@/lib/redux/endpoints/search-api";
import type { CampaignStatus } from "@/lib/types/campaign";
import type { OpportunityType } from "@/lib/types/opportunity";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicantsList } from "@/components/opportunities/applicants-list";
import { initialsFromName } from "@/lib/format";

const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  CLOSED: "Closed",
};

const CAMPAIGN_STATUS_VARIANT: Record<CampaignStatus, "default" | "secondary" | "outline"> = {
  DRAFT: "outline",
  ACTIVE: "default",
  CLOSED: "secondary",
};

const OPPORTUNITY_TYPE_OPTIONS: { value: OpportunityType; label: string }[] = [
  { value: "BRAND_DEAL", label: "Brand deal" },
  { value: "COLLABORATION", label: "Collaboration" },
  { value: "HIRING", label: "Hiring" },
  { value: "FREELANCE_GIG", label: "Freelance gig" },
];

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: campaign, isLoading } = useGetCampaignQuery(id);
  const [updateCampaign, { isLoading: isSaving }] = useUpdateCampaignMutation();

  const [name, setName] = useState("");
  const [goals, setGoals] = useState("");
  const [budget, setBudget] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!campaign) return;
    setName(campaign.name);
    setGoals(campaign.goals ?? "");
    setBudget(campaign.budget ?? "");
    setDeliverables(campaign.deliverables.join(", "));
  }, [campaign]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateCampaign({
      id,
      patch: {
        name,
        goals: goals || undefined,
        budget: budget || undefined,
        deliverables: deliverables
          .split(",")
          .map((d) => d.trim())
          .filter(Boolean),
      },
    }).unwrap();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-muted" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-6">
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Campaign not found.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/campaigns"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Campaigns
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`/api/campaigns/${campaign.id}/report`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <FileText className="size-4" />
            Client report
          </a>
          <StatusControls campaign={campaign} />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground">Brief</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Campaign name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goals">Goals</Label>
          <Textarea id="goals" rows={3} value={goals} onChange={(e) => setGoals(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="budget">Budget</Label>
            <Input id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="$10,000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deliverables">Deliverables (comma-separated)</Label>
            <Input
              id="deliverables"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="1 reel, 2 stories"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save brief"}
          </Button>
          {saved ? <span className="text-sm text-success">Saved</span> : null}
        </div>
      </form>

      <ShortlistSection campaignId={id} />
      <LinkOpportunitySection campaign={campaign} />
      <AnalyticsSection campaignId={id} />
    </div>
  );
}

function StatusControls({
  campaign,
}: {
  campaign: { id: string; status: CampaignStatus };
}) {
  const [updateCampaign, { isLoading }] = useUpdateCampaignMutation();

  async function handleSetStatus(status: CampaignStatus) {
    try {
      await updateCampaign({ id: campaign.id, patch: { status } }).unwrap();
    } catch {
      toast.error("Couldn't update the campaign status. Please try again.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={CAMPAIGN_STATUS_VARIANT[campaign.status]}>{CAMPAIGN_STATUS_LABEL[campaign.status]}</Badge>
      {campaign.status === "DRAFT" ? (
        <Button variant="outline" size="sm" disabled={isLoading} onClick={() => handleSetStatus("ACTIVE")}>
          Activate
        </Button>
      ) : null}
      {campaign.status === "ACTIVE" ? (
        <Button variant="outline" size="sm" disabled={isLoading} onClick={() => handleSetStatus("CLOSED")}>
          Close
        </Button>
      ) : null}
      {campaign.status === "CLOSED" ? (
        <Button variant="outline" size="sm" disabled={isLoading} onClick={() => handleSetStatus("ACTIVE")}>
          Reopen
        </Button>
      ) : null}
    </div>
  );
}

function LinkOpportunitySection({
  campaign,
}: {
  campaign: { id: string; name: string; goals: string | null; budget: string | null; status: CampaignStatus; opportunityId: string | null };
}) {
  if (campaign.opportunityId) {
    return (
      <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Applicants</h2>
          <Link
            href={`/opportunities/${campaign.opportunityId}`}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            View opportunity
          </Link>
        </div>
        <ApplicantsList opportunityId={campaign.opportunityId} />
      </section>
    );
  }

  return <CreateOpportunityForm campaign={campaign} />;
}

function CreateOpportunityForm({
  campaign,
}: {
  campaign: { id: string; name: string; goals: string | null; budget: string | null; status: CampaignStatus };
}) {
  const [createOpportunity, { isLoading: isCreating }] = useCreateOpportunityMutation();
  const [updateCampaign] = useUpdateCampaignMutation();

  const [title, setTitle] = useState(campaign.name);
  const [description, setDescription] = useState(campaign.goals ?? "");
  const [type, setType] = useState<OpportunityType>("BRAND_DEAL");
  const [budget, setBudget] = useState(campaign.budget ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const opportunity = await createOpportunity({
        title,
        description,
        type,
        budget: budget || undefined,
      }).unwrap();
      await updateCampaign({
        id: campaign.id,
        patch: {
          opportunityId: opportunity.id,
          status: campaign.status === "DRAFT" ? "ACTIVE" : campaign.status,
        },
      }).unwrap();
      toast.success("Opportunity created and linked to this campaign");
    } catch {
      toast.error("Couldn't create that opportunity. Please try again.");
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-1.5">
        <Link2 className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Link an opportunity</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Publish this campaign as a real Opportunity so creators can apply — Applicants below will populate
        once one is linked.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="opp-title">Title</Label>
          <Input id="opp-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="opp-description">Description</Label>
          <Textarea
            id="opp-description"
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="opp-type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as OpportunityType)}>
              <SelectTrigger id="opp-type" className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {OPPORTUNITY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opp-budget">Budget</Label>
            <Input id="opp-budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="$10,000" />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={isCreating}>
          {isCreating ? "Creating…" : "Create & link opportunity"}
        </Button>
      </form>
    </section>
  );
}

function ShortlistSection({ campaignId }: { campaignId: string }) {
  const { data, isLoading } = useGetCampaignShortlistQuery(campaignId);
  const [addToShortlist, { isLoading: isAdding }] = useAddToShortlistMutation();
  const [removeFromShortlist] = useRemoveFromShortlistMutation();
  const [lookupProfile] = useLazyGetPublicProfileQuery();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [contractFor, setContractFor] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  function toggleComments(creatorUserId: string) {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(creatorUserId)) next.delete(creatorUserId);
      else next.add(creatorUserId);
      return next;
    });
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const profile = await lookupProfile(username.trim()).unwrap();
      await addToShortlist({ campaignId, creatorUserId: profile.profile.userId }).unwrap();
      setUsername("");
    } catch {
      setError("Couldn't find that username.");
    }
  }

  async function handleDownloadContract(creatorUserId: string) {
    setContractFor(creatorUserId);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/contract?creatorUserId=${creatorUserId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Contract request failed");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contract-draft.txt";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn't generate that contract. Please try again.");
    } finally {
      setContractFor(null);
    }
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Shortlist</h2>

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Add creator by username"
          required
        />
        <Button type="submit" size="sm" className="shrink-0 gap-1.5" disabled={isAdding}>
          <UserPlus className="size-4" />
          Add
        </Button>
      </form>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No creators shortlisted yet.</p>
      ) : (
        <ul className="space-y-2">
          {data.items.map((entry) => (
            <li key={entry.creatorUserId} className="space-y-3 rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={entry.profile?.avatarUrl ?? undefined} />
                  <AvatarFallback>{initialsFromName(entry.profile?.name ?? "?")}</AvatarFallback>
                </Avatar>
                <Link href={`/profile/${entry.profile?.username}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{entry.profile?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{entry.profile?.username}</p>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => toggleComments(entry.creatorUserId)}
                >
                  <MessageSquare className="size-3.5" />
                  {expandedComments.has(entry.creatorUserId) ? "Hide notes" : "Team notes"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  disabled={contractFor === entry.creatorUserId}
                  onClick={() => handleDownloadContract(entry.creatorUserId)}
                >
                  <FileText className="size-3.5" />
                  {contractFor === entry.creatorUserId ? "Generating…" : "Generate contract"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove from shortlist"
                  onClick={() => removeFromShortlist({ campaignId, creatorUserId: entry.creatorUserId })}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {expandedComments.has(entry.creatorUserId) ? (
                <ShortlistCommentThread campaignId={campaignId} creatorUserId={entry.creatorUserId} />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AnalyticsSection({ campaignId }: { campaignId: string }) {
  const { data, isLoading } = useGetCampaignAnalyticsQuery(campaignId);

  if (isLoading || !data) {
    return <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground">Performance</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile value={data.shortlistCount} label="Shortlisted" />
        <StatTile value={data.applicantCount} label="Applicants" />
        {Object.entries(data.applicantsByStatus).map(([status, count]) => (
          <StatTile key={status} value={count} label={status} />
        ))}
      </div>
    </section>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border p-3 text-center">
      <p className="text-xl font-semibold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
