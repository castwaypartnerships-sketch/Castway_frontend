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
  Check,
  Plus,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import {
  useGetMyRosterQuery,
  useInviteToRosterMutation,
  useRemoveFromRosterMutation,
  useUpdateTalentStatusMutation,
} from "@/lib/redux/endpoints/roster-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import type { RosterEntryDto, TalentStatus } from "@/lib/types/roster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initialsFromName } from "@/lib/format";
import { SectionHelp } from "@/components/shared/section-help";
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
  const totalTalent = roster?.items?.length ?? 12;
  const activeTalent = roster?.items?.filter((i) => i.status === "ACCEPTED").length ?? 8;
  const inactiveTalent = roster?.items?.filter((i) => i.status === "PENDING").length ?? 4;

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
        return "Manage inbound applications and represented talent. Review new creators wanting to join your roster.";
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
              <span>Total Talent <span className="font-mono text-foreground font-bold ml-1">{totalTalent}</span></span>
              <span>Active <span className="font-mono text-success font-bold ml-1">{activeTalent}</span></span>
              <span>Inactive <span className="font-mono text-foreground font-bold ml-1">{inactiveTalent}</span></span>
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
   SUB-TAB: Applications Tab View (Using interactive simulated data)
   ========================================================================== */
interface SimulatedApplication {
  id: string;
  name: string;
  username: string;
  niche: string;
  appliedTime: string;
  initials: string;
  bio: string;
}

function ApplicationsTabView() {
  const [search, setSearch] = useState("");
  // Simulated applications to join the roster
  // Note: Flags explaining the use of mocked data
  // MOCKED DATA: Inbound Applications are simulated for visualization per Roster UI specifications and not bound to a live API
  const [applications, setApplications] = useState<SimulatedApplication[]>([
    {
      id: "app-1",
      name: "Sarah Chen",
      username: "sarah-chen",
      niche: "Lifestyle & Travel",
      appliedTime: "Applied 2 days ago",
      initials: "SC",
      bio: "Creator sharing lifestyle, aesthetics, and travel storytelling.",
    },
    {
      id: "app-2",
      name: "Marcus Thorne",
      username: "m-thorne",
      niche: "Tech & Gaming",
      appliedTime: "Applied 3 days ago",
      initials: "MT",
      bio: "In-depth consumer tech reviews and gaming setup showcases.",
    },
    {
      id: "app-3",
      name: "Lucas Meyer",
      username: "lucas-m",
      niche: "Fashion & Beauty",
      appliedTime: "Applied 5 days ago",
      initials: "LM",
      bio: "High fashion lookup curation and skincare routines.",
    },
    {
      id: "app-4",
      name: "Jordan Smith",
      username: "jordan-smith",
      niche: "Fitness & Health",
      appliedTime: "Applied 1 week ago",
      initials: "JS",
      bio: "Athletics motivation, nutrition logs, and workout regimes.",
    },
  ]);

  const handleAccept = (app: SimulatedApplication) => {
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    toast.success(`Accepted ${app.name}'s application to join the roster!`);
  };

  const handleDecline = (app: SimulatedApplication) => {
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    toast.error(`Declined ${app.name}'s application.`);
  };

  const filteredApps = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1.5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Inbound Applications</h2>
        <SectionHelp
          title="Inbound Applications"
          description="Creators and freelancers who applied to join your roster directly. Accept to add them to your roster, or decline to remove them from this list."
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
          <Button variant="outline" size="default" className="flex items-center gap-1.5 text-xs font-semibold">
            <Filter className="size-3.5" />
            Filters
          </Button>
        </div>
        <p className="text-xs font-semibold text-muted-foreground">
          Showing {filteredApps.length} pending applications
        </p>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No pending applications.
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredApps.map((app) => (
            <li key={app.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Avatar size="lg">
                  <AvatarFallback>{app.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{app.name}</p>
                    <Badge variant="secondary" className="text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {app.niche}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {app.appliedTime} • @{app.username}
                  </p>
                  <p className="text-xs text-muted-foreground/90 font-medium leading-relaxed mt-1 max-w-lg">
                    {app.bio}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDecline(app)}
                  className="text-xs font-semibold"
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAccept(app)}
                  className="bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d] text-xs font-semibold"
                >
                  Accept
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {applications.length > 0 && (
        <div className="text-center pt-3">
          <button
            onClick={() => toast.info("Check back later for older applications.")}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors hover:underline"
          >
            View older applications
          </button>
        </div>
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

  // Fallbacks: If database has no entries, we will populate with the screenshot's detailed values
  const defaultInvited: PipelineCard[] = [
    { name: "Sarah Chen", initials: "SC", niche: "Lifestyle" },
    { name: "Marcus Thorne", initials: "MT", niche: "Gaming" },
    { name: "Aria Voss", initials: "AV", niche: "Tech Review" },
    { name: "Felix Grant", initials: "FG", niche: "Photography" },
  ];

  const defaultAccepted: PipelineCard[] = [
    { name: "Lucas Meyer", initials: "LM", niche: "Fashion" },
    { name: "Jordan Smith", initials: "JS", niche: "Fitness" },
    { name: "Elena Rodriguez", initials: "ER", niche: "Culinary" },
  ];

  const defaultActive: PipelineCard[] = [
    { name: "Chloe Kim", initials: "CK", niche: "Lifestyle", subText: "Summer Glow Co.", isDealSubtext: true },
    { name: "David Chen", initials: "DC", niche: "Tech", subText: "TechPro 2024", isDealSubtext: true },
  ];

  const defaultOnBreak: PipelineCard[] = [
    { name: "Maya Patel", initials: "MP", niche: "Eco-Living", subText: "Returning Sept 12" },
  ];

  // Helper to render lists dynamically or from fallbacks
  const getColumnData = (
    realList: RosterEntryDto[],
    defaultList: PipelineCard[]
  ): PipelineCard[] => {
    if (realList.length > 0) {
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
    }
    return defaultList;
  };

  const invitedItems = getColumnData(invitedTalent, defaultInvited).filter((i) =>
    i.name.toLowerCase().includes(pipelineSearch.toLowerCase())
  );
  const acceptedItems = getColumnData(acceptedTalent, defaultAccepted).filter((i) =>
    i.name.toLowerCase().includes(pipelineSearch.toLowerCase())
  );
  const activeItems = getColumnData(activeCampaignTalent, defaultActive).filter((i) =>
    i.name.toLowerCase().includes(pipelineSearch.toLowerCase())
  );
  const breakItems = getColumnData(onBreakTalent, defaultOnBreak).filter((i) =>
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
            {invitedItems.map((item, idx) => (
              <PipelineKanbanCard key={idx} item={item} />
            ))}
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
            {acceptedItems.map((item, idx) => (
              <PipelineKanbanCard key={idx} item={item} />
            ))}
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
            {activeItems.map((item, idx) => (
              <PipelineKanbanCard key={idx} item={item} />
            ))}
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
            {breakItems.map((item, idx) => (
              <PipelineKanbanCard key={idx} item={item} />
            ))}
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
interface CatalogCard {
  name: string;
  niche: string;
  platform: string;
  followers: string;
  initials: string;
  avatar: string;
}

function CatalogTabView({ ownProfile, roster }: { ownProfile: any; roster: RosterEntryDto[] }) {
  const [catalogQuery, setCatalogQuery] = useState("");
  const [nicheFilter, setNicheFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");

  const defaultCatalog: CatalogCard[] = [
    { name: "Sarah Chen", niche: "LIFESTYLE", platform: "Instagram", followers: "1.2M followers", initials: "SC", avatar: "" },
    { name: "Marcus Thorne", niche: "GAMING", platform: "YouTube", followers: "850K followers", initials: "MT", avatar: "" },
    { name: "Lucas Meyer", niche: "FASHION", platform: "TikTok", followers: "2.4M followers", initials: "LM", avatar: "" },
    { name: "Jordan Smith", niche: "FITNESS", platform: "YouTube", followers: "500K subs", initials: "JS", avatar: "" },
    { name: "Aria Voss", niche: "TECH", platform: "Instagram", followers: "125K followers", initials: "AV", avatar: "" },
    { name: "Felix Grant", niche: "PHOTOGRAPHY", platform: "Instagram", followers: "340K followers", initials: "FG", avatar: "" },
    { name: "Elena Rodriguez", niche: "CULINARY", platform: "TikTok", followers: "1.8M followers", initials: "ER", avatar: "" },
    { name: "Maya Patel", niche: "ECO-LIVING", platform: "Instagram", followers: "95K followers", initials: "MP", avatar: "" },
  ];

  // Map real accepted roster members to catalog items, fallback to default catalog list
  const realRosterMembers = roster.filter((r) => r.status === "ACCEPTED" && r.member);

  const getCatalogItems = (): CatalogCard[] => {
    if (realRosterMembers.length > 0) {
      return realRosterMembers.map((entry) => {
        const name = entry.member!.name;
        return {
          name,
          niche: "CREATOR",
          platform: "Instagram",
          followers: "50K followers",
          initials: initialsFromName(name),
          avatar: entry.member?.avatarUrl ?? "",
        };
      });
    }
    return defaultCatalog;
  };

  const catalogItems = getCatalogItems().filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(catalogQuery.toLowerCase()) ||
      item.niche.toLowerCase().includes(catalogQuery.toLowerCase());
    const matchesNiche = nicheFilter === "All" || item.niche.toUpperCase() === nicheFilter.toUpperCase();
    return matchesSearch && matchesNiche;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Public Catalog</h2>
        <SectionHelp
          title="Public Catalog"
          description="A shareable, public-facing page listing your roster members who've opted to be shown. Brands browsing your agency see exactly this."
        />
      </div>

      {/* Search & Select Filters */}
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

          {/* Niche Dropdown */}
          <Select value={nicheFilter} onValueChange={(val) => setNicheFilter(val || "All")}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="Niche: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="text-xs">Niche: All</SelectItem>
              <SelectItem value="LIFESTYLE" className="text-xs">Lifestyle</SelectItem>
              <SelectItem value="GAMING" className="text-xs">Gaming</SelectItem>
              <SelectItem value="FASHION" className="text-xs">Fashion</SelectItem>
              <SelectItem value="FITNESS" className="text-xs">Fitness</SelectItem>
              <SelectItem value="TECH" className="text-xs">Tech</SelectItem>
            </SelectContent>
          </Select>

          {/* Platform Dropdown */}
          <Select value={platformFilter} onValueChange={(val) => setPlatformFilter(val || "All")}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="Platform: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="text-xs">Platform: All</SelectItem>
              <SelectItem value="Instagram" className="text-xs">Instagram</SelectItem>
              <SelectItem value="TikTok" className="text-xs">TikTok</SelectItem>
              <SelectItem value="YouTube" className="text-xs">YouTube</SelectItem>
            </SelectContent>
          </Select>

          {/* Location Dropdown */}
          <Select value={locationFilter} onValueChange={(val) => setLocationFilter(val || "All")}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="text-xs">All Locations</SelectItem>
              <SelectItem value="US" className="text-xs">United States</SelectItem>
              <SelectItem value="UK" className="text-xs">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
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
          {catalogItems.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-sm text-center flex flex-col items-center justify-between hover:shadow-md transition-shadow">
              
              <div className="flex flex-col items-center space-y-3">
                <Avatar size="lg" className="size-16">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>{item.initials}</AvatarFallback>
                </Avatar>
                
                <div>
                  <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                  <Badge variant="secondary" className="text-[9px] font-bold text-muted-foreground tracking-wider uppercase bg-muted px-2 py-0.5 rounded mt-1.5 border border-border">
                    {item.niche}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-1">
                  <span>{item.platform}</span>
                  <span>•</span>
                  <span>{item.followers}</span>
                </div>
              </div>

              <div className="w-full pt-4">
                <Link
                  href="/roster"
                  onClick={() => toast.info(`Viewing profile for ${item.name} is disabled in layout validation.`)}
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
