"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Inbox,
  Briefcase,
  Kanban,
  Globe,
  UserPlus,
  X,
  Search,
  Filter,
  Settings,
  GripVertical,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { useGetOwnProfileQuery, type ProfileMeResponse } from "@/lib/redux/endpoints/profile-api";
import {
  useGetMyRosterQuery,
  useInviteToRosterMutation,
  useRemoveFromRosterMutation,
  useUpdateTalentStatusMutation,
} from "@/lib/redux/endpoints/roster-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useGetRosterApplicationsQuery } from "@/lib/redux/endpoints/applications-api";
import type { RosterEntryDto, TalentStatus } from "@/lib/types/roster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initialsFromName } from "@/lib/format";
import { SectionHelp } from "@/components/shared/section-help";
import { TalentSectionTabs } from "@/components/roster/talent-section-tabs";
import { cn } from "@/lib/utils";

type RosterTab = "view" | "applications" | "pipeline" | "catalog";

const TALENT_STATUS_LABELS: Record<TalentStatus, string> = {
  AVAILABLE: "Available",
  IN_DEAL: "In deal",
  BOOKED: "Booked",
};

// Styling for status dropdowns based on state
const TALENT_STATUS_STYLES: Record<TalentStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900/50",
  IN_DEAL: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
  BOOKED: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
};

export default function RosterPage() {
  const { data: session } = useGetSessionQuery();
  const role = session?.user?.role;
  const isAgency = role === "AGENCY" || role === "AGENCY_MANAGER";

  if (isAgency) {
    return <AgencyRosterView />;
  }

  return <StandardRosterView />;
}

/* ==========================================================================
   AGENCY ROSTER VIEW (Redesigned Tabbed Layout)
   ========================================================================== */
function AgencyRosterView() {
  const [activeTab, setActiveTab] = useState<RosterTab>("view");
  const { data: ownProfile } = useGetOwnProfileQuery();
  const { data: roster, isLoading } = useGetMyRosterQuery();
  const [invite, { isLoading: isInviting, error: inviteError }] = useInviteToRosterMutation();
  const [remove] = useRemoveFromRosterMutation();
  
  const [username, setUsername] = useState("");
  const [sent, setSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Roster stats calculation
  const totalTalent = roster?.items?.length ?? 0;
  const activeTalent = roster?.items?.filter((i) => i.status === "ACCEPTED").length ?? 0;
  const inactiveTalent = roster?.items?.filter((i) => i.status === "PENDING").length ?? 0;

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(false);
    try {
      await invite(username.trim()).unwrap();
      setUsername("");
      setSent(true);
      toast.success("Roster invitation sent!");
    } catch {
      toast.error("Failed to send roster invitation.");
    }
  }

  // Filter roster items based on search query
  const filteredRosterItems = roster?.items?.filter((item) => {
    const name = item.member?.name ?? "";
    const username = item.member?.username ?? "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) ?? [];

  // Title description text shifts slightly depending on tab
  const getSubTitleText = () => {
    switch (activeTab) {
      case "applications":
        return "Every application your roster members have sent, across all opportunities.";
      case "pipeline":
        return "Track your talent representation journey from initial outreach and invites to active campaigns and break periods.";
      case "catalog":
        return "Public catalog settings and showcase of represented talent. Filter and customize who appears in your external roster catalog.";
      default:
        return "Creators and freelancers you represent — they keep full control of their own profile and must accept your invite.";
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-6">
      <TalentSectionTabs />

      {/* Redesigned Header: Title + Switcher */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Roster</h1>
            <SectionHelp
              title="Roster"
              description="Your represented talent. Invite creators/freelancers to join your agency, track who's accepted, and see each person's status at a glance."
            />
          </div>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl leading-relaxed">
            {getSubTitleText()}
          </p>
        </div>

        {/* Top-Right Tab Switcher */}
        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] self-start shrink-0 sm:w-auto">
          <div className="flex w-max items-center gap-1.5 bg-muted/65 p-1 rounded-xl border border-border/40">
            <button
              onClick={() => setActiveTab("view")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0",
                activeTab === "view"
                  ? "bg-[#476948] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Inbox className="size-3.5" />
              Roster View
            </button>
            <button
              onClick={() => setActiveTab("applications")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0",
                activeTab === "applications"
                  ? "bg-[#476948] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Briefcase className="size-3.5" />
              Applications
            </button>
            <button
              onClick={() => setActiveTab("pipeline")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0",
                activeTab === "pipeline"
                  ? "bg-[#476948] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Kanban className="size-3.5" />
              Pipeline
            </button>
            <button
              onClick={() => setActiveTab("catalog")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0",
                activeTab === "catalog"
                  ? "bg-[#476948] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="size-3.5" />
              Public Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Render Tab Contents */}
      {activeTab === "view" && (
        <div className="space-y-6">
          {/* Invite Bar */}
          <form onSubmit={handleInvite} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Invite by username, e.g. maya-linde"
              required
              className="flex-1"
            />
            <Button type="submit" size="default" className="shrink-0 gap-1.5 bg-[#476948] text-white hover:bg-[#3d5a3e] font-semibold" disabled={isInviting}>
              <UserPlus className="size-4" />
              {isInviting ? "Inviting…" : "Invite"}
            </Button>
          </form>
          {sent ? <p className="text-sm text-success font-medium">Invite sent.</p> : null}
          {inviteError ? (
            <p className="text-sm text-destructive font-medium">
              {(inviteError as { data?: { error?: string } })?.data?.error ?? "Couldn't send that invite."}
            </p>
          ) : null}

          {/* Search bar & Stats Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roster members..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Total Talent <span className="font-mono text-foreground font-bold ml-1">{isLoading ? "—" : totalTalent}</span></span>
              <span>Active <span className="font-mono text-success font-bold ml-1">{isLoading ? "—" : activeTalent}</span></span>
              <span>Inactive <span className="font-mono text-foreground font-bold ml-1">{isLoading ? "—" : inactiveTalent}</span></span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
              <div className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
            </div>
          ) : filteredRosterItems.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              {searchQuery ? "No matching roster members found." : "No one on your roster yet."}
            </p>
          ) : (
            <ul className="space-y-3">
              {filteredRosterItems.map((entry) => (
                <RosterItemRow key={entry.id} entry={entry} onRemove={() => remove(entry.id)} />
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === "applications" && (
        <ApplicationsTabView />
      )}

      {activeTab === "pipeline" && (
        <PipelineTabView roster={roster?.items ?? []} />
      )}

      {activeTab === "catalog" && (
        <CatalogTabView ownProfile={ownProfile} roster={roster?.items ?? []} />
      )}

    </div>
  );
}

/* ==========================================================================
   SUB-TAB: Roster Item Row
   ========================================================================== */
function RosterItemRow({ entry, onRemove }: { entry: RosterEntryDto; onRemove: () => void }) {
  const [updateTalentStatus] = useUpdateTalentStatusMutation();
  const member = entry.member;
  if (!member) return null;

  return (
    <li className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
        <Avatar size="lg">
          <AvatarImage src={member.avatarUrl ?? undefined} />
          <AvatarFallback>{initialsFromName(member.name)}</AvatarFallback>
        </Avatar>
        <Link href={`/profile/${member.username}`} className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground hover:underline">{member.name}</p>
          <p className="truncate text-xs text-muted-foreground">@{member.username}</p>
        </Link>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-3 shrink-0">
        {/* Status Badge */}
        <Badge
          className={cn(
            "font-semibold uppercase tracking-wider text-[10px] rounded px-2.5 py-0.5 border",
            entry.status === "ACCEPTED"
              ? "bg-[#476948]/10 text-[#476948] border-[#476948]/20"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          {entry.status === "ACCEPTED" ? "On Roster" : "Invite Pending"}
        </Badge>

        {/* Availability Dropdown */}
        {entry.status === "ACCEPTED" && (
          <Select
            value={entry.talentStatus}
            onValueChange={(value) => updateTalentStatus({ id: entry.id, talentStatus: value as TalentStatus })}
          >
            <SelectTrigger
              className={cn("w-32 text-xs font-semibold h-7 border rounded-lg", TALENT_STATUS_STYLES[entry.talentStatus])}
              aria-label="Talent status"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TALENT_STATUS_LABELS) as TalentStatus[]).map((status) => (
                <SelectItem key={status} value={status} className="text-xs font-medium">
                  {TALENT_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Remove Button */}
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" aria-label="Remove from roster" onClick={onRemove}>
          <X className="size-4" />
        </Button>
      </div>
    </li>
  );
}

/* ==========================================================================
   SUB-TAB: Applications Tab View (real roster-member applications)
   ========================================================================== */
const APPLICATION_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-primary/10 text-primary border-primary/20",
  ACCEPTED: "bg-[#476948]/10 text-[#476948] border-[#476948]/20 dark:text-[#a7d9b5] dark:border-[#a7d9b5]/30",
  REJECTED: "bg-muted text-muted-foreground border-border",
  WITHDRAWN: "bg-muted text-muted-foreground border-border",
  COMPLETED: "bg-[#476948]/10 text-[#476948] border-[#476948]/20 dark:text-[#a7d9b5] dark:border-[#a7d9b5]/30",
};

function ApplicationsTabView() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useGetRosterApplicationsQuery();

  const applications = data?.items ?? [];
  const filteredApps = applications.filter(
    (app) =>
      app.applicant.name.toLowerCase().includes(search.toLowerCase()) ||
      app.opportunity.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Roster Applications</h2>
        <SectionHelp
          title="Roster Applications"
          description="Every application your roster members have sent to opportunities, across the whole platform."
        />
      </div>
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applications..."
              className="pl-9"
            />
          </div>
        </div>
        <p className="text-xs font-semibold text-muted-foreground">
          Showing {filteredApps.length} application{filteredApps.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
          <div className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
        </div>
      ) : filteredApps.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          {search ? "No matching applications found." : "No applications from your roster yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredApps.map((app) => (
            <li key={app.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Avatar size="lg">
                  <AvatarImage src={app.applicant.avatarUrl ?? undefined} />
                  <AvatarFallback>{initialsFromName(app.applicant.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <Link
                    href={`/opportunities/${app.opportunity.id}`}
                    className="text-sm font-bold text-foreground hover:underline"
                  >
                    {app.opportunity.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {app.applicant.name}
                    {app.opportunity.budget ? ` • ${app.opportunity.budget}` : ""}
                  </p>
                </div>
              </div>

              <Badge
                className={cn(
                  "font-semibold uppercase tracking-wider text-[10px] rounded px-2.5 py-0.5 border shrink-0",
                  APPLICATION_STATUS_STYLES[app.status] ?? APPLICATION_STATUS_STYLES.PENDING
                )}
              >
                {app.status}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ==========================================================================
   SUB-TAB: Pipeline Tab View (Kanban Board)
   ========================================================================== */
interface PipelineCard {
  name: string;
  initials: string;
  niche: string;
  subText?: string;
  isDealSubtext?: boolean;
}

function PipelineTabView({ roster }: { roster: RosterEntryDto[] }) {
  const [pipelineSearch, setPipelineSearch] = useState("");

  // Map real Roster Entry DTOs to pipeline columns
  const invitedTalent = roster.filter((entry) => entry.status === "PENDING" && entry.member);
  const acceptedTalent = roster.filter((entry) => entry.status === "ACCEPTED" && entry.talentStatus === "AVAILABLE" && entry.member);
  const activeCampaignTalent = roster.filter((entry) => entry.status === "ACCEPTED" && entry.talentStatus === "IN_DEAL" && entry.member);
  const onBreakTalent = roster.filter((entry) => entry.status === "ACCEPTED" && entry.talentStatus === "BOOKED" && entry.member);

  // Map real roster entries into pipeline cards for a given column
  const getColumnData = (realList: RosterEntryDto[]): PipelineCard[] => {
    return realList.map((entry) => {
      const name = entry.member!.name;
      return {
        name,
        initials: initialsFromName(name),
        niche: "Represented Creator",
        subText: entry.talentStatus === "IN_DEAL" ? "Active Campaign" : undefined,
        isDealSubtext: entry.talentStatus === "IN_DEAL",
      };
    });
  };

  const invitedItems = getColumnData(invitedTalent).filter((i) =>
    i.name.toLowerCase().includes(pipelineSearch.toLowerCase())
  );
  const acceptedItems = getColumnData(acceptedTalent).filter((i) =>
    i.name.toLowerCase().includes(pipelineSearch.toLowerCase())
  );
  const activeItems = getColumnData(activeCampaignTalent).filter((i) =>
    i.name.toLowerCase().includes(pipelineSearch.toLowerCase())
  );
  const breakItems = getColumnData(onBreakTalent).filter((i) =>
    i.name.toLowerCase().includes(pipelineSearch.toLowerCase())
  );

  const activeTalentCount = activeItems.length + acceptedItems.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pipeline</h2>
        <SectionHelp
          title="Pipeline"
          description="Your roster's talent, grouped by stage — Invited, Accepted, Active on Campaign, and On Break. Scan the columns to see who's ready for a brief."
        />
      </div>
      {/* Search and counters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 max-w-sm flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={pipelineSearch}
              onChange={(e) => setPipelineSearch(e.target.value)}
              placeholder="Search pipeline..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="default" className="flex items-center gap-1.5 text-xs font-semibold">
            <Filter className="size-3.5" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">{activeTalentCount} Active Talent</span>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
            <Settings className="size-4" />
          </Button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        
        {/* Column 1: Invited */}
        <div className="bg-muted/30 rounded-2xl border border-border/80 p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-foreground">Invited <span className="text-muted-foreground font-medium ml-1">({invitedItems.length})</span></p>
            <button onClick={() => toast.info("Search Roster View to send invites.")} className="text-muted-foreground hover:text-foreground">
              <Plus className="size-4.5" />
            </button>
          </div>
          <div className="space-y-2">
            {invitedItems.length === 0 ? (
              <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">No pending invites.</p>
            ) : (
              invitedItems.map((item, idx) => <PipelineKanbanCard key={idx} item={item} />)
            )}
          </div>
        </div>

        {/* Column 2: Accepted */}
        <div className="bg-muted/30 rounded-2xl border border-border/80 p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-foreground">Accepted <span className="text-muted-foreground font-medium ml-1">({acceptedItems.length})</span></p>
            <button onClick={() => toast.info("Drag creators to change statuses")} className="text-muted-foreground hover:text-foreground">
              <Plus className="size-4.5" />
            </button>
          </div>
          <div className="space-y-2">
            {acceptedItems.length === 0 ? (
              <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">No one here yet.</p>
            ) : (
              acceptedItems.map((item, idx) => <PipelineKanbanCard key={idx} item={item} />)
            )}
          </div>
        </div>

        {/* Column 3: Active on Campaign */}
        <div className="bg-muted/30 rounded-2xl border border-border/80 p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-foreground font-mono">Active on Campaign <span className="text-muted-foreground font-medium ml-1">({activeItems.length})</span></p>
            <button onClick={() => toast.info("Drag creators to change statuses")} className="text-muted-foreground hover:text-foreground">
              <Plus className="size-4.5" />
            </button>
          </div>
          <div className="space-y-2">
            {activeItems.length === 0 ? (
              <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">No one here yet.</p>
            ) : (
              activeItems.map((item, idx) => <PipelineKanbanCard key={idx} item={item} />)
            )}
          </div>
        </div>

        {/* Column 4: On Break */}
        <div className="bg-muted/30 rounded-2xl border border-border/80 p-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-foreground">On Break <span className="text-muted-foreground font-medium ml-1">({breakItems.length})</span></p>
            <button onClick={() => toast.info("Drag creators to change statuses")} className="text-muted-foreground hover:text-foreground">
              <Plus className="size-4.5" />
            </button>
          </div>
          <div className="space-y-2">
            {breakItems.length === 0 ? (
              <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">No one here yet.</p>
            ) : (
              breakItems.map((item, idx) => <PipelineKanbanCard key={idx} item={item} />)
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function PipelineKanbanCard({ item }: { item: PipelineCard }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm flex items-start gap-2.5 hover:shadow-md transition-shadow">
      <GripVertical className="size-4 text-muted-foreground/35 shrink-0 mt-1 cursor-grab" />
      <Avatar size="sm" className="size-8 shrink-0">
        <AvatarFallback className="text-[10px]">{item.initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
        <p className="text-[10px] text-muted-foreground/80 truncate mt-0.5">{item.niche}</p>
        {item.subText && (
          <p
            className={cn(
              "text-[9px] font-semibold mt-1",
              item.isDealSubtext
                ? "text-[#476948] dark:text-[#a7d9b5]"
                : "text-muted-foreground/75"
            )}
          >
            {item.subText}
          </p>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   SUB-TAB: Catalog Tab View (Creator Showcase grid)
   ========================================================================== */
function CatalogTabView({ ownProfile, roster }: { ownProfile: ProfileMeResponse | undefined; roster: RosterEntryDto[] }) {
  const [catalogQuery, setCatalogQuery] = useState("");

  // Only accepted members who've opted in to public listing appear here —
  // this is exactly what the public catalog page shows (opt-in is the
  // member's own choice, per roster.service.ts setPubliclyListed).
  const catalogEntries = roster.filter((r) => r.status === "ACCEPTED" && r.publiclyListed && r.member);

  const catalogItems = catalogEntries.filter((entry) =>
    entry.member!.name.toLowerCase().includes(catalogQuery.toLowerCase()) ||
    entry.member!.username.toLowerCase().includes(catalogQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Public Catalog</h2>
        <SectionHelp
          title="Public Catalog"
          description="A shareable, public-facing page listing your roster members who've opted to be shown. Brands browsing your agency see exactly this."
        />
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={catalogQuery}
              onChange={(e) => setCatalogQuery(e.target.value)}
              placeholder="Search creators by name or handle..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-3 shrink-0 text-xs font-semibold text-muted-foreground">
          <span>{catalogItems.length} Creators Listed</span>
          {ownProfile?.profile?.username && (
            <Link
              href={`/agency/${ownProfile.profile.username}/roster`}
              className="flex items-center gap-1 hover:text-foreground text-[11px] font-bold underline"
            >
              Public Catalog Link
            </Link>
          )}
        </div>
      </div>

      {/* Creators Grid */}
      {catalogItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No creators match the selection.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {catalogItems.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm text-center flex flex-col items-center justify-between hover:shadow-md transition-shadow">

              <div className="flex flex-col items-center space-y-3">
                <Avatar size="lg" className="size-16">
                  <AvatarImage src={entry.member!.avatarUrl ?? undefined} />
                  <AvatarFallback>{initialsFromName(entry.member!.name)}</AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="text-sm font-bold text-foreground">{entry.member!.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">@{entry.member!.username}</p>
                </div>
              </div>

              <div className="w-full pt-4">
                <Link
                  href={`/profile/${entry.member!.username}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full text-xs font-semibold text-[#476948] border-[#476948] hover:bg-[#476948]/5 dark:text-[#a7d9b5] dark:border-[#a7d9b5]"
                  )}
                >
                  View Profile
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   STANDARD ROSTER VIEW (FALLBACK FOR OTHER ROLES)
   ========================================================================== */
function StandardRosterView() {
  const { data: ownProfile } = useGetOwnProfileQuery();
  const { data, isLoading } = useGetMyRosterQuery();
  const [invite, { isLoading: isInviting, error: inviteError }] = useInviteToRosterMutation();
  const [remove] = useRemoveFromRosterMutation();
  const [username, setUsername] = useState("");
  const [sent, setSent] = useState(false);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(false);
    try {
      await invite(username.trim()).unwrap();
      setUsername("");
      setSent(true);
    } catch {
      // surfaced via inviteError below
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Roster</h1>
          <p className="text-sm text-muted-foreground">
            Creators and freelancers you represent — they keep full control of their own profile and must
            accept your invite.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/roster/inbox"
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Inbox className="size-3.5" />
            Roster Inbox
          </Link>
          <Link
            href="/roster/applications"
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Briefcase className="size-3.5" />
            Applications
          </Link>
          <Link
            href="/roster/pipeline"
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Kanban className="size-3.5" />
            Pipeline
          </Link>
          {ownProfile?.profile?.username ? (
            <Link
              href={`/agency/${ownProfile.profile.username}/roster`}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              Public catalog
            </Link>
          ) : null}
        </div>
      </div>

      <form onSubmit={handleInvite} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Invite by username, e.g. maya-linde"
          required
        />
        <Button type="submit" size="sm" className="shrink-0 gap-1.5" disabled={isInviting}>
          <UserPlus className="size-4" />
          {isInviting ? "Inviting…" : "Invite"}
        </Button>
      </form>
      {sent ? <p className="text-sm text-success">Invite sent.</p> : null}
      {inviteError ? (
        <p className="text-sm text-destructive">
          {(inviteError as { data?: { error?: string } })?.data?.error ?? "Couldn't send that invite."}
        </p>
      ) : null}

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No one on your roster yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((entry) => (
            <StandardRosterRow key={entry.id} entry={entry} onRemove={() => remove(entry.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function StandardRosterRow({ entry, onRemove }: { entry: RosterEntryDto; onRemove: () => void }) {
  const [updateTalentStatus] = useUpdateTalentStatusMutation();
  const member = entry.member;
  if (!member) return null;

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Avatar size="lg">
        <AvatarImage src={member.avatarUrl ?? undefined} />
        <AvatarFallback>{initialsFromName(member.name)}</AvatarFallback>
      </Avatar>
      <Link href={`/profile/${member.username}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
        <p className="truncate text-xs text-muted-foreground">@{member.username}</p>
      </Link>
      <Badge variant={entry.status === "ACCEPTED" ? "default" : "outline"}>
        {entry.status === "ACCEPTED" ? "On roster" : "Invite pending"}
      </Badge>
      {entry.status === "ACCEPTED" ? (
        <Select
          value={entry.talentStatus}
          onValueChange={(value) => updateTalentStatus({ id: entry.id, talentStatus: value as TalentStatus })}
        >
          <SelectTrigger className="w-32" aria-label="Talent status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TALENT_STATUS_LABELS) as TalentStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {TALENT_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      <Button variant="ghost" size="icon-sm" aria-label="Remove from roster" onClick={onRemove}>
        <X className="size-3.5" />
      </Button>
    </li>
  );
}
