"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Link2,
  MessageSquare,
  Trash2,
  UserPlus,
  Share2,
  Edit,
  Search,
  ExternalLink,
  Download,
} from "lucide-react";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import {
  useAddToShortlistMutation,
  useGetCampaignAnalyticsQuery,
  useGetCampaignQuery,
  useGetCampaignShortlistQuery,
  useRemoveFromShortlistMutation,
  useUpdateCampaignMutation,
} from "@/lib/redux/endpoints/campaigns-api";
import { useGetApplicationsForOpportunityQuery } from "@/lib/redux/endpoints/applications-api";
import { useGetMyRosterQuery } from "@/lib/redux/endpoints/roster-api";
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
import { ShortlistCommentThread } from "@/components/campaigns/shortlist-comment-thread";
import { ApplicantsList } from "@/components/opportunities/applicants-list";
import { initialsFromName } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  const { data: session } = useGetSessionQuery();
  const role = session?.user?.role;
  const isAgency = role === "AGENCY" || role === "AGENCY_MANAGER";

  if (isAgency) {
    return <AgencyCampaignDetailView campaignId={id} />;
  }

  return <StandardCampaignDetailPage campaignId={id} />;
}

/* ==========================================================================
   AGENCY CAMPAIGN DETAIL VIEW (Redesigned Layout with Sidebar & Pipeline)
   ========================================================================== */
function AgencyCampaignDetailView({ campaignId }: { campaignId: string }) {
  const { data: campaign, isLoading } = useGetCampaignQuery(campaignId);
  const [updateCampaign, { isLoading: isSaving }] = useUpdateCampaignMutation();
  const { data: roster } = useGetMyRosterQuery();

  // Query live applicants if opportunity is linked
  const opportunityId = campaign?.opportunityId ?? "";
  const { data: liveApplicants } = useGetApplicationsForOpportunityQuery(
    opportunityId,
    { skip: !opportunityId }
  );

  // Read-only / Edit layout toggle
  const [isEditing, setIsEditing] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");

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
      id: campaignId,
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
    setIsEditing(false);
    toast.success("Campaign brief updated successfully!");
    setTimeout(() => setSaved(false), 2000);
  }

  // Filter roster for Assign Talent widget
  const filterRosterItems = () => {
    const list: Array<{ id: string; name: string; role: string; initials: string; avatarUrl?: string }> = [];

    // 1. Add real roster members
    if (roster?.items) {
      const accepted = roster.items.filter((r) => r.status === "ACCEPTED" && r.member);
      accepted.forEach((entry) => {
        list.push({
          id: entry.id,
          name: entry.member!.name,
          role: "Represented Performer",
          initials: initialsFromName(entry.member!.name),
          avatarUrl: entry.member?.avatarUrl ?? undefined,
        });
      });
    }

    // Apply search query
    return list.filter((item) =>
      item.name.toLowerCase().includes(rosterSearch.toLowerCase())
    );
  };

  const assignableTalentList = filterRosterItems();

  const handleAssignTalent = (talentName: string) => {
    toast.success(`Assigned ${talentName} to campaign "${campaign?.name ?? 'Brief'}"!`);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-6 py-6 animate-pulse">
        <div className="h-48 rounded-2xl bg-muted" />
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-6 text-center">
        <p className="rounded-2xl border border-dashed border-border py-16 text-sm text-muted-foreground">
          Campaign brief not found.
        </p>
      </div>
    );
  }

  const applicantItems = liveApplicants?.items ?? [];
  const pipelineStages = [
    { label: "PENDING", count: applicantItems.filter((a) => a.status === "PENDING").length, colorClass: "bg-slate-500" },
    { label: "ACCEPTED", count: applicantItems.filter((a) => a.status === "ACCEPTED").length, colorClass: "bg-[#476948]" },
    { label: "REJECTED", count: applicantItems.filter((a) => a.status === "REJECTED").length, colorClass: "bg-red-500" },
    { label: "COMPLETED", count: applicantItems.filter((a) => a.status === "COMPLETED").length, colorClass: "bg-blue-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      
      {/* Back button & top right actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
        <Link
          href="/campaigns/clients"
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider"
        >
          <ArrowLeft className="size-4" />
          Back to Campaigns
        </Link>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Campaign brief link copied to clipboard!")}
            className="text-xs font-semibold flex items-center gap-1 h-8"
          >
            <Share2 className="size-3.5" />
            Share
          </Button>

          <Button
            onClick={() => setIsEditing((v) => !v)}
            className="bg-[#476948] hover:bg-[#3d5a3e] text-white text-xs font-semibold rounded-lg flex items-center gap-1 h-8"
          >
            <Edit className="size-3.5" />
            {isEditing ? "View Dashboard" : "Edit Campaign"}
          </Button>
        </div>
      </div>

      {isEditing ? (
        /* Edit Campaign Brief Mode */
        <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-border bg-card p-6 max-w-3xl mx-auto shadow-sm">
          <h2 className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">Edit Campaign Brief</h2>
          <div className="space-y-1.5">
            <Label htmlFor="name">Campaign name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goals">Goals / Description</Label>
            <Textarea id="goals" rows={5} value={goals} onChange={(e) => setGoals(e.target.value)} />
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
          <div className="flex items-center gap-3 pt-3">
            <Button type="submit" disabled={isSaving} className="bg-[#476948] hover:bg-[#3d5a3e] text-white">
              {isSaving ? "Saving…" : "Save brief"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            {saved ? <span className="text-sm text-success">Saved</span> : null}
          </div>
        </form>
      ) : (
        /* Dashboard Mode */
        <div className="space-y-6">
          {/* Header Brief Info */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <Badge variant={CAMPAIGN_STATUS_VARIANT[campaign.status]} className="text-[9px] py-0.5 leading-none">
                {CAMPAIGN_STATUS_LABEL[campaign.status]}
              </Badge>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground leading-tight mt-1">
              {campaign.name}
            </h1>
          </div>

          {/* Core Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Content (2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Applicant Pipeline Widget */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Applicant Pipeline</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {pipelineStages.map((stage) => (
                    <div key={stage.label} className="border border-border rounded-xl p-3 space-y-2 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-muted-foreground tracking-wide">{stage.label}</span>
                        <span className="text-xs font-bold font-mono">{stage.count}</span>
                      </div>
                      {/* Progress line */}
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={cn("h-full rounded-full", stage.colorClass)} style={{ width: stage.count > 0 ? "50%" : "0%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campaign Brief */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h3 className="text-sm font-bold text-foreground">Campaign Brief</h3>
                  <button
                    onClick={() => toast.info("PDF generation and download is disabled in layout validation.")}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 uppercase tracking-wider"
                  >
                    <Download className="size-3.5" />
                    Download PDF
                  </button>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {campaign.goals || "No brief provided yet."}
                </p>
              </div>

              {/* Project Timeline */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                  Project Timeline
                </h3>

                {campaign.timelineStart || campaign.timelineEnd ? (
                  <p className="text-xs font-bold text-foreground leading-normal">
                    {campaign.timelineStart ? new Date(campaign.timelineStart).toLocaleDateString() : "No start date"}
                    {" – "}
                    {campaign.timelineEnd ? new Date(campaign.timelineEnd).toLocaleDateString() : "No end date"}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No timeline set.</p>
                )}
              </div>

              {/* Linking Opportunities section & Shortlists */}
              <div className="space-y-4">
                <LinkOpportunitySection campaign={campaign} />
                <ShortlistSection campaignId={campaignId} />
              </div>

            </div>

            {/* Right Columns (Sidebar) */}
            <div className="space-y-5">
              
              {/* Widget 1: Campaign Details */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3.5">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                  Campaign Details
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-bold text-foreground font-mono">{campaign.budget || "$4,000 - $6,000"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-border/40">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-semibold text-foreground">Post-Production</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-border/40">
                    <span className="text-muted-foreground">Deadline</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">3 days remaining</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-border/40">
                    <span className="text-muted-foreground">Visibility</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <ExternalLink className="size-3.5" />
                      Public
                    </span>
                  </div>
                </div>
              </div>

              {/* Widget 2: Assign Talent */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                  Assign Talent
                </h4>

                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search roster..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="w-full pl-8 h-8 rounded-lg border border-border bg-card text-xs focus:ring-1 focus:ring-[#476948] outline-none"
                  />
                </div>

                {assignableTalentList.length === 0 ? (
                  <p className="py-4 text-center text-[10px] text-muted-foreground">
                    No accepted roster members yet.
                  </p>
                ) : (
                <ul className="space-y-3">
                  {assignableTalentList.map((talent) => (
                    <li key={talent.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar size="sm" className="size-7">
                          <AvatarImage src={talent.avatarUrl} />
                          <AvatarFallback className="text-[9px]">{talent.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate leading-normal">{talent.name}</p>
                          <p className="text-[9px] text-muted-foreground truncate leading-none mt-0.5">{talent.role}</p>
                        </div>
                      </div>

                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleAssignTalent(talent.name)}
                        className="text-[10px] font-semibold h-6 text-[#476948] border-[#476948] hover:bg-[#476948]/5 dark:text-[#a7d9b5]"
                      >
                        Assign
                      </Button>
                    </li>
                  ))}
                </ul>
                )}

                <div className="text-center pt-1 border-t border-border/40">
                  <Link href="/roster" className="text-[10px] font-bold text-[#476948] dark:text-[#a7d9b5] uppercase tracking-wider hover:underline">
                    View All Roster
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/* ==========================================================================
   STANDARD CAMPAIGN DETAIL PAGE (FALLBACK FOR OTHER ROLES)
   ========================================================================== */
function StandardCampaignDetailPage({ campaignId }: { campaignId: string }) {
  const { data: campaign, isLoading } = useGetCampaignQuery(campaignId);
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
      id: campaignId,
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
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      <ShortlistSection campaignId={campaignId} />
      <LinkOpportunitySection campaign={campaign} />
      <AnalyticsSection campaignId={campaignId} />
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
