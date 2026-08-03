"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  AlertCircle,
  FileText,
  MessageSquare,
  Trash2,
  Download,
  Calendar,
  DollarSign,
  ChevronRight,
  Eye,
  ArrowLeft,
  X,
  Users,
} from "lucide-react";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import {
  useAcceptAgencyInviteMutation,
  useDeclineAgencyInviteMutation,
  useGetClientBrandsQuery,
  useGetPendingAgencyInvitesQuery,
} from "@/lib/redux/endpoints/brand-agency-api";
import {
  useCreateCampaignOnBehalfMutation,
  useGetClientCampaignsQuery,
} from "@/lib/redux/endpoints/campaigns-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initialsFromName } from "@/lib/format";
import { SectionHelp } from "@/components/shared/section-help";
import { cn } from "@/lib/utils";

export default function AgencyClientsPage() {
  const { data: session } = useGetSessionQuery();
  const role = session?.user?.role;
  const isAgency = role === "AGENCY" || role === "AGENCY_MANAGER";

  if (isAgency) {
    return <AgencyCampaignsDashboard />;
  }

  // Fallback to standard co-management list for other roles (e.g. Brands co-managing)
  return <StandardAgencyClientsPage />;
}

/* ==========================================================================
   AGENCY CLIENT CAMPAIGNS DASHBOARD (Redesigned Overview & Create Form)
   ========================================================================== */
function AgencyCampaignsDashboard() {
  const [view, setView] = useState<"list" | "create">("list");

  // Client Brands Queries
  const { data: pendingLinks } = useGetPendingAgencyInvitesQuery();
  const [acceptInvite] = useAcceptAgencyInviteMutation();
  const [declineInvite] = useDeclineAgencyInviteMutation();
  const { data: clients } = useGetClientBrandsQuery();

  // Active Selected client states (for filtering/actions)
  const [selectedBrandUserId, setSelectedBrandUserId] = useState<string>("all");
  const [statusTab, setStatusTab] = useState<"all" | "active" | "draft" | "in-review" | "completed">("all");
  
  // Create Campaign States
  const [formBrandUserId, setFormBrandUserId] = useState("");
  const [formCategory, setFormCategory] = useState("Production");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBudget, setFormBudget] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formVisibility, setFormVisibility] = useState<"public" | "private">("public");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignOnBehalfMutation();

  const activeClientBrands = clients?.items ?? [];

  // Query live campaigns for the selected brand if one is picked
  // Skip if we are looking at "all" brands
  const isAllSelected = selectedBrandUserId === "all";
  const { data: liveBrandCampaigns, isLoading: isLoadingLiveBriefs } = useGetClientCampaignsQuery(
    selectedBrandUserId,
    { skip: isAllSelected }
  );

  // Live campaigns for the currently selected client only — there is no
  // backend query that aggregates campaigns across all of an agency's
  // clients at once, so the "all" selection legitimately has nothing to show.
  const getCombinedCampaigns = () => {
    const list: Array<{
      id: string;
      client: string;
      logoText: string;
      title: string;
      status: string;
      budget: string;
      category: string;
      closesIn: string;
      applicantsCount: number;
      assignedText: string;
      assignedAvatars: string[];
      isLive?: boolean;
    }> = [];

    if (!isAllSelected && liveBrandCampaigns?.items) {
      // Find client brand info
      const brandLink = activeClientBrands.find((c) => c.brand?.userId === selectedBrandUserId);
      const brandName = brandLink?.brand?.name ?? "Client Brand";
      
      liveBrandCampaigns.items.forEach((brief) => {
        list.push({
          id: brief.id,
          client: brandName,
          logoText: brandName.charAt(0).toUpperCase(),
          title: brief.name,
          status: brief.status,
          budget: brief.budget ?? "$2k - $5k",
          category: "Campaign",
          closesIn: "closes in 7 days",
          applicantsCount: 0,
          assignedText: "Not yet assigned",
          assignedAvatars: [],
          isLive: true,
        });
      });
    }

    // Apply status tab filter
    return list.filter((item) => {
      if (statusTab === "all") return true;
      if (statusTab === "active" && item.status === "ACTIVE") return true;
      if (statusTab === "draft" && item.status === "DRAFT") return true;
      if (statusTab === "in-review" && item.status === "IN_REVIEW") return true;
      if (statusTab === "completed" && item.status === "COMPLETED") return true;
      return false;
    });
  };

  const currentBriefsList = getCombinedCampaigns();

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !skillsList.includes(val)) {
        setSkillsList((prev) => [...prev, val]);
        setSkillInput("");
      }
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList((prev) => prev.filter((s) => s !== skill));
  };

  async function handleCreateCampaignSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    // Fallback: If no client brand is selected or exists, show warning
    const brandTarget = formBrandUserId || (activeClientBrands[0]?.brand?.userId);
    if (!brandTarget) {
      toast.error("You must select a co-managed brand client to create a brief on their behalf.");
      return;
    }

    try {
      await createCampaign({
        brandUserId: brandTarget,
        input: {
          name: formTitle.trim(),
          goals: formDescription.trim(),
          budget: formBudget.trim(),
          deliverables: skillsList,
        },
      }).unwrap();

      toast.success("Client Campaign brief published successfully!");
      setView("list");
      
      // Clear inputs
      setFormTitle("");
      setFormDescription("");
      setFormBudget("");
      setSkillsList([]);
    } catch {
      toast.error("Failed to create campaign brief on behalf of client.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      
      {/* --------------------------------------------------------------------
          SCREEN 3: CREATE NEW CAMPAIGN VIEW
          -------------------------------------------------------------------- */}
      {view === "create" ? (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Create Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">Create New Campaign</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Set up your brief and start sourcing top talent.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setView("list")} className="text-xs font-semibold">
              Cancel
            </Button>
          </div>

          <form onSubmit={handleCreateCampaignSubmit} className="space-y-5">
            {/* Section 1: Basic Information */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-[#476948] dark:text-[#a7d9b5] uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#476948] shrink-0" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="create-brand-select" className="text-xs font-bold text-muted-foreground uppercase">
                    Client / Brand
                  </Label>
                  <Select value={formBrandUserId} onValueChange={(val) => setFormBrandUserId(val || "")}>
                    <SelectTrigger id="create-brand-select" className="h-10 text-xs">
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeClientBrands.map((link) => (
                        <SelectItem key={link.id} value={link.brand?.userId ?? ""} className="text-xs">
                          {link.brand?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-niche-select" className="text-xs font-bold text-muted-foreground uppercase">
                    Category / Niche
                  </Label>
                  <Select value={formCategory} onValueChange={(val) => setFormCategory(val || "Production")}>
                    <SelectTrigger id="create-niche-select" className="h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Production" className="text-xs">Production</SelectItem>
                      <SelectItem value="Content Creation" className="text-xs">Content Creation</SelectItem>
                      <SelectItem value="Lifestyle" className="text-xs">Lifestyle</SelectItem>
                      <SelectItem value="Sponsorship" className="text-xs">Sponsorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-title-input" className="text-xs font-bold text-muted-foreground uppercase">
                  Campaign Title
                </Label>
                <Input
                  id="create-title-input"
                  required
                  placeholder="e.g. Lead Video Editor — Summer Launch"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            {/* Section 2: Campaign Details */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-[#476948] dark:text-[#a7d9b5] uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#476948] shrink-0" />
                Campaign Details
              </h2>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase">
                  Description
                </Label>
                {/* Visual rich text formatting editor toolbar */}
                <div className="border border-border rounded-lg overflow-hidden bg-card focus-within:ring-1 focus-within:ring-[#476948]">
                  <div className="flex items-center gap-1 border-b border-border/80 bg-muted/40 p-2 text-muted-foreground">
                    <button type="button" className="p-1 hover:bg-muted rounded text-xs font-bold font-mono">B</button>
                    <button type="button" className="p-1 hover:bg-muted rounded text-xs italic font-serif">I</button>
                    <button type="button" className="p-1 hover:bg-muted rounded text-xs font-mono">UL</button>
                    <button type="button" className="p-1 hover:bg-muted rounded text-xs font-mono">OL</button>
                    <button type="button" className="p-1 hover:bg-muted rounded text-xs font-mono">LINK</button>
                  </div>
                  <Textarea
                    required
                    placeholder="Describe the role, project requirements, and deliverables..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={6}
                    className="border-0 focus-visible:ring-0 shadow-none text-sm resize-none rounded-none p-3"
                  />
                </div>
              </div>

              {/* Skills Tags input */}
              <div className="space-y-1.5">
                <Label htmlFor="skills-input" className="text-xs font-bold text-muted-foreground uppercase">
                  Skills Required
                </Label>
                <div className="flex flex-wrap gap-1.5 border border-border rounded-lg p-2 bg-card min-h-10 items-center focus-within:ring-1 focus-within:ring-[#476948]">
                  {skillsList.map((skill) => (
                    <span key={skill} className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded text-xs font-medium border border-border">
                      {skill}
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-muted-foreground hover:text-destructive">
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    id="skills-input"
                    type="text"
                    placeholder="Press enter to add..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="flex-1 bg-transparent border-0 outline-none text-xs min-w-[120px] h-6 py-0 focus:ring-0 focus:border-0"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Press enter or comma to add a skill.</p>
              </div>
            </div>

            {/* Section 3: Budget & Timeline */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-[#476948] dark:text-[#a7d9b5] uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#476948] shrink-0" />
                Budget & Timeline
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="create-budget" className="text-xs font-bold text-muted-foreground uppercase">
                    Budget / Compensation
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="create-budget"
                      placeholder="e.g. 5,000.00"
                      value={formBudget}
                      onChange={(e) => setFormBudget(e.target.value)}
                      className="pl-9 h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-timeline" className="text-xs font-bold text-muted-foreground uppercase">
                    Deadline / Application Window
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="create-timeline"
                      placeholder="Aug 24, 2024 - Aug 31, 2024"
                      value={formDeadline}
                      onChange={(e) => setFormDeadline(e.target.value)}
                      className="pl-9 h-10 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Settings & Visibility */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#476948] dark:text-[#a7d9b5] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-[#476948] shrink-0" />
                  Settings & Visibility
                </h2>
                {/* Visual toggle */}
                <button
                  type="button"
                  onClick={() => setFormVisibility((v) => (v === "public" ? "private" : "public"))}
                  className={cn(
                    "relative inline-flex h-5.5 w-10.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#476948] focus:ring-offset-2",
                    formVisibility === "public" ? "bg-[#476948]" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                      formVisibility === "public" ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Public Opt */}
                <div
                  onClick={() => setFormVisibility("public")}
                  className={cn(
                    "flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-colors",
                    formVisibility === "public" ? "border-[#476948] bg-[#476948]/5" : "border-border hover:bg-muted/30"
                  )}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={formVisibility === "public"}
                    onChange={() => {}}
                    className="mt-1 accent-[#476948]"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">Public</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Open applications. Anyone in the network can see and apply to this campaign brief.
                    </p>
                  </div>
                </div>

                {/* Private Opt */}
                <div
                  onClick={() => setFormVisibility("private")}
                  className={cn(
                    "flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-colors",
                    formVisibility === "private" ? "border-[#476948] bg-[#476948]/5" : "border-border hover:bg-muted/30"
                  )}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={formVisibility === "private"}
                    onChange={() => {}}
                    className="mt-1 accent-[#476948]"
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">Private</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Invite-only. Only talent from your represented roster can view and apply to this brief.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  toast.info("Draft saved successfully!");
                  setView("list");
                }}
                className="text-xs font-semibold h-10"
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-[#476948] hover:bg-[#3d5a3e] text-white font-semibold text-xs h-10 px-5 rounded-xl flex items-center gap-1.5"
              >
                Publish Campaign
              </Button>
            </div>
          </form>
        </div>
      ) : (
        /* --------------------------------------------------------------------
            SCREEN 1: CAMPAIGNS LIST OVERVIEW
            -------------------------------------------------------------------- */
        <>
          {/* Pending invites block */}
          {pendingLinks && pendingLinks.items.length > 0 ? (
            <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm animate-pulse">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending co-management invites</p>
              {pendingLinks.items.map((link) => (
                <div key={link.id} className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarImage src={link.brand?.avatarUrl ?? undefined} />
                    <AvatarFallback>{initialsFromName(link.brand?.name ?? "?")}</AvatarFallback>
                  </Avatar>
                  <p className="flex-1 truncate text-sm font-semibold text-foreground">{link.brand?.name}</p>
                  <Button size="sm" onClick={() => acceptInvite(link.id)} className="bg-[#476948] text-white hover:bg-[#3d5a3e] text-xs h-8">
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => declineInvite(link.id)} className="text-xs h-8">
                    Decline
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          {/* List Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Client Campaigns</h1>
                <SectionHelp
                  title="Client Campaigns"
                  description="Campaigns you post and manage on behalf of brands you co-manage. Pick a client, publish a brief, and assign talent — the brand sees it as their own."
                />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage active briefs, applications, and talent assignments across your client campaigns.
              </p>
            </div>
            <Button
              onClick={() => setView("create")}
              className="self-start sm:self-auto bg-[#476948] hover:bg-[#3d5a3e] text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              + New Campaign
            </Button>
          </div>

          {/* Stats Cards Row — only stats genuinely computable from real data are shown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Clients</p>
              <h3 className="text-2xl font-bold font-mono text-foreground">{activeClientBrands.length}</h3>
            </div>
          </div>

          {/* Main List Layout & Right Sidebar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left 2 Columns: Feed Lists */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Tabs and Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-3">
                
                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 bg-muted/65 p-1 rounded-xl border border-border/40 text-xs">
                  {(["all", "active", "draft", "in-review", "completed"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStatusTab(tab)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-colors",
                        statusTab === tab
                          ? "bg-white text-foreground shadow-sm dark:bg-[#1f2937]"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Filters Trigger Dropdowns */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <Select value={selectedBrandUserId} onValueChange={(val) => setSelectedBrandUserId(val || "all")}>
                    <SelectTrigger className="h-8 text-[11px] font-semibold w-36">
                      <SelectValue placeholder="Client/Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs font-semibold">All Brands</SelectItem>
                      {activeClientBrands.map((link) => (
                        <SelectItem key={link.id} value={link.brand?.userId ?? ""} className="text-xs">
                          {link.brand?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold">
                    <Filter className="size-3.5" />
                    Filters
                  </Button>
                </div>

              </div>

              {/* Briefs Feed Cards */}
              {isLoadingLiveBriefs ? (
                <div className="space-y-3">
                  <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
                </div>
              ) : currentBriefsList.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                  {isAllSelected
                    ? "Select a client to view their campaigns."
                    : "No co-managed campaign briefs match these filters."}
                </p>
              ) : (
                <ul className="space-y-4">
                  {currentBriefsList.map((campaign) => (
                    <li key={campaign.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                      
                      {/* Logo and Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm" className="size-7 border border-border/80 bg-muted">
                            <AvatarFallback className="text-[10px] font-bold">{campaign.logoText}</AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{campaign.client}</span>
                        </div>
                        <Badge
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-wider rounded px-2 py-0.5",
                            campaign.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300"
                              : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                          )}
                        >
                          {campaign.status}
                        </Badge>
                      </div>

                      {/* Title */}
                      <Link href={`/campaigns/${campaign.id}`} className="block mt-2 group">
                        <h4 className="text-base font-bold text-foreground group-hover:underline group-hover:text-[#476948] transition-colors leading-snug">
                          {campaign.title}
                        </h4>
                      </Link>

                      {/* Brief Specs Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3.5 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <DollarSign className="size-3.5" />
                          {campaign.budget}
                        </span>
                        <span>•</span>
                        <span>{campaign.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {campaign.closesIn}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5" />
                          {campaign.applicantsCount} Applicants
                        </span>
                      </div>

                      {/* Assignee Details */}
                      <div className="border-t border-border/60 mt-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Assigned:</span>
                          {campaign.assignedAvatars.length > 0 ? (
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {campaign.assignedAvatars.map((src, i) => (
                                <Avatar key={i} size="sm" className="size-6 border-2 border-card">
                                  <AvatarFallback className="text-[8px] bg-muted/60">TR</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/80 italic">{campaign.assignedText}</span>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "text-xs font-semibold"
                            )}
                          >
                            View Applicants
                          </Link>
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className={cn(
                              buttonVariants({ size: "sm" }),
                              "bg-[#476948] hover:bg-[#3d5a3e] text-white text-xs font-semibold rounded-xl"
                            )}
                          >
                            Assign Talent
                          </Link>
                        </div>
                      </div>

                    </li>
                  ))}
                </ul>
              )}

            </div>

            {/* Right Sidebar Widget Columns */}
            <div className="space-y-5">
              
              {/* Widget 1: Client Overview */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                  Client Overview
                  <SectionHelp
                    title="Client Overview"
                    description="The brands you co-manage, with how many campaigns each has active right now. Select one from the filter above to see just their briefs."
                  />
                </h4>
                
                <ul className="space-y-3">
                  {activeClientBrands.length === 0 ? (
                    <li className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                      No clients yet.
                    </li>
                  ) : (
                    activeClientBrands.map((link) => (
                      <li key={link.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar size="sm" className="size-8">
                            <AvatarImage src={link.brand?.avatarUrl ?? undefined} />
                            <AvatarFallback>{initialsFromName(link.brand?.name ?? "?")}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{link.brand?.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">Co-managing</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                          Active Client
                        </Badge>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Widget 2: Deadlines This Week */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3.5">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                  Deadlines This Week
                  <SectionHelp
                    title="Deadlines This Week"
                    description="Application windows and deliverable due dates closing soon across your client campaigns — red means tomorrow."
                  />
                </h4>

                <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                  No deadlines this week.
                </p>
              </div>

              {/* Widget 3: Top Performing */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                  Top Performing
                  <SectionHelp
                    title="Top Performing"
                    description="Your client campaigns ranked by results — applicant volume, engagement, or completion rate, whichever's most notable for that brief."
                  />
                </h4>

                <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                  No campaign performance data yet.
                </p>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}

/* ==========================================================================
   STANDARD AGENCY CLIENTS VIEW (FALLBACK)
   ========================================================================== */
function StandardAgencyClientsPage() {
  const { data: pending } = useGetPendingAgencyInvitesQuery();
  const [accept] = useAcceptAgencyInviteMutation();
  const [decline] = useDeclineAgencyInviteMutation();
  const { data: clients, isLoading } = useGetClientBrandsQuery();
  const [selectedBrandUserId, setSelectedBrandUserId] = useState<string | undefined>(undefined);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div>
        <div className="flex items-center gap-1.5">
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Client Campaigns
          </h1>
          <SectionHelp
            title="Client Campaigns"
            description="Brands you co-manage. Pick one to view or create campaign briefs on their behalf — only brands that added you as a co-manager show up here."
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Brands you co-manage — view and create campaign briefs on their behalf.
        </p>
      </div>

      {pending && pending.items.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground">Pending co-management invites</p>
          {pending.items.map((link) => (
            <div key={link.id} className="flex items-center gap-3">
              <Avatar size="sm">
                <AvatarImage src={link.brand?.avatarUrl ?? undefined} />
                <AvatarFallback>{initialsFromName(link.brand?.name ?? "?")}</AvatarFallback>
              </Avatar>
              <p className="flex-1 truncate text-sm text-foreground">{link.brand?.name}</p>
              <Button size="sm" onClick={() => accept(link.id)}>
                Accept
              </Button>
              <Button size="sm" variant="ghost" onClick={() => decline(link.id)}>
                Decline
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !clients || clients.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No brand clients yet — accept an invite above, or ask a brand to invite you.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {clients.items.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => setSelectedBrandUserId(link.brand?.userId)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedBrandUserId === link.brand?.userId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {link.brand?.name}
            </button>
          ))}
        </div>
      )}

      {selectedBrandUserId ? <StandardClientCampaigns brandUserId={selectedBrandUserId} /> : null}
    </div>
  );
}

function StandardClientCampaigns({ brandUserId }: { brandUserId: string }) {
  const { data, isLoading } = useGetClientCampaignsQuery(brandUserId);
  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignOnBehalfMutation();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createCampaign({ brandUserId, input: { name } }).unwrap();
      setName("");
      setShowForm(false);
    } catch {
      toast.error("Couldn't create that campaign. Please try again.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Campaigns</h2>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          New campaign brief
        </Button>
      </div>

      {showForm ? (
        <form onSubmit={handleCreate} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Campaign name"
            required
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={isCreating}>
            {isCreating ? "Creating…" : "Create"}
          </Button>
        </form>
      ) : null}

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No campaigns for this client yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {data.items.map((campaign) => (
            <li key={campaign.id}>
              <Link
                href={`/campaigns/${campaign.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/50"
              >
                <span className="truncate text-sm font-medium text-foreground">{campaign.name}</span>
                <Badge variant="outline">{campaign.status}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
