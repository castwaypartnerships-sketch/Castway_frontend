"use client";

import { useState, type FormEvent, useRef } from "react";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Mail,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Shield,
  HelpCircle,
  MoreVertical,
  RefreshCw,
  X,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import {
  useAssignManagerToRosterEntryMutation,
  useCreateManagerMutation,
  useGetManagersQuery,
  useGetMyRosterQuery,
  useUnassignManagerFromRosterEntryMutation,
} from "@/lib/redux/endpoints/roster-api";
import type { ManagerDto } from "@/lib/redux/endpoints/roster-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initialsFromName } from "@/lib/format";
import { cn } from "@/lib/utils";

// Import visual placeholders/mocks
import {
  MOCK_ACTIVITIES,
  MOCK_PENDING_INVITES,
  MOCK_CAPACITY,
  DISPLAY_ROLE_MAP,
  type PendingInvite,
} from "@/lib/mocks/team-data";

export default function TeamPage() {
  const { data: session } = useGetSessionQuery();
  const role = session?.user?.role;
  const isAgency = role === "AGENCY" || role === "AGENCY_MANAGER";

  if (isAgency) {
    return <AgencyTeamView />;
  }

  return <StandardTeamView />;
}

/* ==========================================================================
   AGENCY TEAM VIEW (Redesigned Layout)
   ========================================================================== */
function AgencyTeamView() {
  const { data: managers, isLoading: isLoadingManagers } = useGetManagersQuery();
  const { data: roster } = useGetMyRosterQuery();
  const [createManager, { isLoading: isCreating }] = useCreateManagerMutation();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [newManagerName, setNewManagerName] = useState("");
  const [newManagerUsername, setNewManagerUsername] = useState("");
  const [justCreated, setJustCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  // Local state for pending invites (to allow interactive resend/dismiss)
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(MOCK_PENDING_INVITES);

  // Form reference for "+ Invite Team Member" CTA scroll
  const inviteFormRef = useRef<HTMLFormElement>(null);

  const acceptedMembers = (roster?.items ?? []).filter((entry) => entry.status === "ACCEPTED" && entry.member);

  const handleScrollToInvite = () => {
    inviteFormRef.current?.scrollIntoView({ behavior: "smooth" });
    inviteFormRef.current?.querySelector("input")?.focus();
  };

  async function handleInviteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteEmail.trim()) return;

    // Split inviteEmail to get a name and username if they weren't input
    const emailParts = inviteEmail.split("@");
    const generatedUsername = newManagerUsername.trim() || emailParts[0] + "-" + Math.floor(Math.random() * 1000);
    const displayName = newManagerName.trim() || emailParts[0];

    try {
      const result = await createManager({
        email: inviteEmail.trim(),
        username: generatedUsername,
        name: displayName,
      }).unwrap();

      setJustCreated({ email: inviteEmail.trim(), tempPassword: result.tempPassword });
      setInviteEmail("");
      setNewManagerName("");
      setNewManagerUsername("");
      toast.success("Manager invited successfully!");
    } catch {
      toast.error("Couldn't invite manager. Please check inputs and try again.");
    }
  }

  const handleResendInvite = (app: PendingInvite) => {
    toast.success(`Resent invitation to ${app.name} (${app.email})!`);
  };

  const handleDismissInvite = (id: string) => {
    setPendingInvites((prev) => prev.filter((p) => p.id !== id));
    toast.info("Invitation cancelled.");
  };

  // Blending live backend managers with visual mockup items for full demonstration
  const getBlendedMembers = () => {
    const list: Array<{
      id: string;
      name: string;
      username: string;
      role: "Admin" | "Manager" | "Member";
      description: string;
      lastActive: string;
      isLive?: boolean;
      managerObj?: ManagerDto;
    }> = [];

    // 1. Add visual mock members first (if they aren't somehow matched with live managers)
    const mockMembersList = [
      {
        id: "mock-1",
        name: "Sarah Jenkins",
        username: "sjenkins",
        role: "Admin" as const,
        description: "Full access to billing, team, and campaigns",
        lastActive: "Active now",
      },
      {
        id: "mock-2",
        name: "Marcus Chen",
        username: "mchen",
        role: "Manager" as const,
        description: "Can manage roster and campaigns",
        lastActive: "Last active 2h ago",
      },
      {
        id: "mock-3",
        name: "Elena Rodriguez",
        username: "elena_r",
        role: "Member" as const,
        description: "View-only access to assigned campaigns",
        lastActive: "Last active 1d ago",
      },
    ];

    list.push(...mockMembersList);

    // 2. Add live backend managers
    if (managers?.items) {
      managers.items.forEach((m) => {
        // Prevent doubling if they share names
        if (list.some((existing) => existing.name === m.name || existing.username === m.username)) {
          return;
        }

        // Map live manager to a visual role/styling
        const mapping = m.name ? DISPLAY_ROLE_MAP[m.name] : null;
        list.push({
          id: m.id,
          name: m.name ?? m.email,
          username: m.username ?? m.email.split("@")[0],
          role: mapping?.role ?? "Manager",
          description: mapping?.description ?? "Access to assigned roster profiles",
          lastActive: mapping?.lastActive ?? "Active now",
          isLive: true,
          managerObj: m,
        });
      });
    }

    return list;
  };

  const blendedMembers = getBlendedMembers();
  const totalTeamCount = blendedMembers.length + pendingInvites.length;
  const adminCount = blendedMembers.filter((m) => m.role === "Admin").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage internal members who help run your agency&apos;s account.
          </p>
        </div>
        <Button
          onClick={handleScrollToInvite}
          className="self-start sm:self-auto bg-[#476948] hover:bg-[#3d5a3e] text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-sm flex items-center gap-1.5"
        >
          <UserPlus className="size-3.5" />
          + Invite Team Member
        </Button>
      </div>

      {/* Main Grid: Content (2 Columns) + Sidebar (1 Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Invite Form */}
          <form
            ref={inviteFormRef}
            onSubmit={handleInviteSubmit}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="space-y-1.5 md:col-span-1.5">
                <Label htmlFor="invite-input" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Invite by email or username
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="invite-input"
                    type="text"
                    required
                    placeholder="Enter email or username..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invite-role" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Role
                </Label>
                <Select value={inviteRole} onValueChange={(val) => setInviteRole(val || "Member")}>
                  <SelectTrigger id="invite-role" className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin" className="text-sm">Admin</SelectItem>
                    <SelectItem value="Manager" className="text-sm">Manager</SelectItem>
                    <SelectItem value="Member" className="text-sm">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isCreating}
                className="h-10 bg-[#476948] hover:bg-[#3d5a3e] text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <UserPlus className="size-4" />
                {isCreating ? "Inviting…" : "Invite"}
              </Button>
            </div>

            {/* Optional parameters for live API matching */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <Label htmlFor="invite-name" className="text-[10px] font-bold text-muted-foreground uppercase">
                  Full Name (Optional for API)
                </Label>
                <Input
                  id="invite-name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="invite-username" className="text-[10px] font-bold text-muted-foreground uppercase">
                  Username (Optional for API)
                </Label>
                <Input
                  id="invite-username"
                  type="text"
                  placeholder="e.g. johndoe"
                  value={newManagerUsername}
                  onChange={(e) => setNewManagerUsername(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </form>

          {/* Just Created Temp Password Banner */}
          {justCreated ? (
            <div className="rounded-2xl border border-success bg-success/5 p-4 space-y-2.5">
              <div className="flex items-start gap-2 text-success">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Account created for {justCreated.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Share this temporary password now — it won&apos;t be shown again.
                  </p>
                </div>
              </div>
              <code className="block rounded-lg bg-muted border border-border p-3 text-sm font-mono select-all">
                {justCreated.tempPassword}
              </code>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setJustCreated(null)}>
                Dismiss Banner
              </Button>
            </div>
          ) : null}

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stat 1: Total Team */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1.5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Team Members</p>
              <h3 className="text-3xl font-bold font-mono text-foreground">{totalTeamCount}</h3>
              <p className="flex items-center gap-1 text-[11px] font-bold text-success">
                <TrendingUp className="size-3.5" />
                +20% vs last month
              </p>
            </div>

            {/* Stat 2: Pending Invites */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1.5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Invites</p>
              <h3 className="text-3xl font-bold font-mono text-foreground">{pendingInvites.length}</h3>
              <p className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-500">
                <AlertCircle className="size-3.5" />
                Needs attention
              </p>
            </div>

            {/* Stat 3: Admins */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1.5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Admins</p>
              <h3 className="text-3xl font-bold font-mono text-foreground">{adminCount}</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Fully authorized users</p>
            </div>
          </div>

          {/* Team Members List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Team Members</h2>
              <button onClick={() => toast.info("Viewing all members.")} className="text-xs font-bold text-[#476948] dark:text-[#a7d9b5] hover:underline uppercase tracking-wider">
                View All
              </button>
            </div>

            {isLoadingManagers ? (
              <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
            ) : (
              <ul className="space-y-3">
                {/* 1. Blended Active/Live Members */}
                {blendedMembers.map((member) => (
                  <TeamMemberRow key={member.id} member={member} rosterEntries={acceptedMembers} />
                ))}

                {/* 2. Pending Invite Rows */}
                {pendingInvites.map((invite) => (
                  <li
                    key={invite.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 opacity-80"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" className="border-2 border-dashed border-border bg-muted">
                        <AvatarFallback className="bg-transparent text-muted-foreground/60">
                          {initialsFromName(invite.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-muted-foreground">{invite.name}</p>
                          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-dashed text-muted-foreground">
                            INVITE PENDING
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground/80 mt-0.5">
                          Invited as {invite.role} • Sent {invite.sentDaysAgo} days ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleResendInvite(invite)}
                        className="text-xs font-semibold flex items-center gap-1 h-7 text-[#476948] border-[#476948] hover:bg-[#476948]/5 dark:text-[#a7d9b5]"
                      >
                        <RefreshCw className="size-3" />
                        Resend
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => handleDismissInvite(invite.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Team Activity Section */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold text-foreground">Recent Team Activity</h3>
              <button
                onClick={() => toast.success("Activity log exported successfully!")}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline uppercase tracking-wider"
              >
                Export Log
              </button>
            </div>

            <ul className="space-y-3 pt-1">
              {MOCK_ACTIVITIES.map((act) => (
                <li key={act.id} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-[#476948] shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-foreground leading-normal">
                      <span className="font-bold">{act.memberName}</span> {act.action}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">{act.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="space-y-5">
          
          {/* Permissions Guide Card (Dark Green background) */}
          <div className="rounded-2xl bg-[#476948] text-white p-5 shadow-sm space-y-4 dark:bg-[#1a2f1f] dark:border dark:border-border/60">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <h4 className="text-sm font-bold">Permissions Guide</h4>
              <Shield className="size-4 opacity-80" />
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <p className="font-bold tracking-wider text-[10px] uppercase text-green-300">ADMIN</p>
                <p className="text-white/90 leading-relaxed">
                  Full control. Can manage billing, export data, and delete the account.
                </p>
              </div>
              <div className="space-y-1 border-t border-white/10 pt-2.5">
                <p className="font-bold tracking-wider text-[10px] uppercase text-green-300">MANAGER</p>
                <p className="text-white/90 leading-relaxed">
                  Can manage rosters, start campaigns, and invite Members.
                </p>
              </div>
              <div className="space-y-1 border-t border-white/10 pt-2.5">
                <p className="font-bold tracking-wider text-[10px] uppercase text-green-300">MEMBER</p>
                <p className="text-white/90 leading-relaxed">
                  Standard access. Can view assigned campaigns and message creators.
                </p>
              </div>
            </div>
          </div>

          {/* Invite Reminder widget */}
          {pendingInvites.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex items-start gap-3">
              <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0 mt-0.5">
                <AlertCircle className="size-4" />
              </div>
              <div className="space-y-1.5 min-w-0">
                <h5 className="text-xs font-bold text-foreground">Invite Reminder</h5>
                <p className="text-xs text-muted-foreground leading-normal">
                  1 invite pending for 3 days. Marco Diaz hasn&apos;t joined yet.
                </p>
                <button
                  onClick={() => toast.success("Invitation reminder email re-queued!")}
                  className="text-[10px] font-bold text-[#476948] dark:text-[#a7d9b5] hover:underline uppercase tracking-wider flex items-center gap-1"
                >
                  Resend Invitation <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          )}

          {/* Team Capacity Progress widget */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Team Capacity</span>
              <span className="font-mono text-foreground">{MOCK_CAPACITY.usagePercent}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-[#476948] rounded-full"
                style={{ width: `${MOCK_CAPACITY.usagePercent}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              You have <span className="font-bold text-foreground">{MOCK_CAPACITY.slotsRemaining} slots remaining</span> on your current agency plan.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Billing dashboard navigation is disabled.")}
              className="w-full text-xs font-semibold"
            >
              View Billing Details
            </Button>
          </div>

          {/* Support help widget */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center gap-3">
            <div className="size-8 rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center justify-center text-green-700 dark:text-green-500 shrink-0">
              <HelpCircle className="size-4.5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-foreground">Need help?</h5>
              <button
                onClick={() => toast.success("Agency support chat opened!")}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:underline text-left mt-0.5"
              >
                Contact Agency Support
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

/* ==========================================================================
   SUB-COMPONENT: Team Member Row
   ========================================================================== */
interface BlendedMember {
  id: string;
  name: string;
  username: string;
  role: "Admin" | "Manager" | "Member";
  description: string;
  lastActive: string;
  isLive?: boolean;
  managerObj?: ManagerDto;
}

function TeamMemberRow({ member, rosterEntries }: { member: BlendedMember; rosterEntries: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const [assignedEntryIds, setAssignedEntryIds] = useState<Set<string>>(new Set());
  const [assign] = useAssignManagerToRosterEntryMutation();
  const [unassign] = useUnassignManagerFromRosterEntryMutation();

  function toggle(entryId: string, checked: boolean) {
    setAssignedEntryIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(entryId);
      else next.delete(entryId);
      return next;
    });

    if (member.isLive && member.managerObj) {
      if (checked) assign({ managerId: member.id, entryId });
      else unassign({ managerId: member.id, entryId });
    } else {
      toast.info(`Updated simulated permissions for ${member.name}`);
    }
  }

  // Get style class for member role tags
  const getRoleTagStyle = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900/40";
      case "Manager":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <li className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col space-y-3">
      <div className="flex items-center justify-between gap-3">
        
        {/* Avatar + Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar size="lg">
            <AvatarFallback>{initialsFromName(member.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-foreground truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground/80 truncate">@{member.username}</p>
              <Badge className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded", getRoleTagStyle(member.role))}>
                {member.role}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">
              {member.description}
            </p>
          </div>
        </div>

        {/* Status indicator on the right */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {member.lastActive === "Active now" ? (
              <>
                <span className="size-2 rounded-full bg-success shrink-0" />
                <span className="text-success font-medium">Active now</span>
              </>
            ) : (
              <span>{member.lastActive}</span>
            )}
          </div>

          {/* Action trigger dropdown using DropdownMenu component */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 p-0 hover:bg-muted" aria-label="Open member actions menu">
                <MoreVertical className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setExpanded((v) => !v)}
                className="text-xs font-semibold"
              >
                {expanded ? "Hide Roster Access" : "Manage Roster Access"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info(`Editing permissions for ${member.name}`)} className="text-xs">
                Edit Permissions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.error(`Removing ${member.name} is disabled in layout validation.`)} className="text-xs text-destructive focus:bg-destructive/10 focus:text-destructive">
                Remove Team Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>

      {/* Roster Assignment Sub-panel */}
      {expanded && (
        <div className="mt-2 border-t border-border pt-3 space-y-2.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Assign Roster Access
          </p>
          {rosterEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No accepted roster members to assign.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rosterEntries.map((entry) =>
                entry.member ? (
                  <li key={entry.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`assign-${member.id}-${entry.id}`}
                      checked={assignedEntryIds.has(entry.id)}
                      onCheckedChange={(checked) => toggle(entry.id, checked === true)}
                    />
                    <Label htmlFor={`assign-${member.id}-${entry.id}`} className="text-xs text-foreground cursor-pointer font-medium">
                      {entry.member.name}
                    </Label>
                  </li>
                ) : null
              )}
            </ul>
          )}
        </div>
      )}

    </li>
  );
}

/* ==========================================================================
   STANDARD TEAM VIEW (FALLBACK FOR OTHER ROLES)
   ========================================================================== */
function StandardTeamView() {
  const { data: managers, isLoading } = useGetManagersQuery();
  const { data: roster } = useGetMyRosterQuery();
  const [createManager, { isLoading: isCreating }] = useCreateManagerMutation();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [justCreated, setJustCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  const acceptedMembers = (roster?.items ?? []).filter((entry) => entry.status === "ACCEPTED" && entry.member);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await createManager({ email, username, name }).unwrap();
      setJustCreated({ email, tempPassword: result.tempPassword });
      setEmail("");
      setUsername("");
      setName("");
      setShowForm(false);
    } catch {
      toast.error("Couldn't create that manager account. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground">
            Talent managers — each can act on behalf of only the roster members you assign them.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          New manager
        </Button>
      </div>

      {justCreated ? (
        <div className="rounded-2xl border border-primary bg-card p-4">
          <p className="text-sm font-medium text-foreground">
            Account created for {justCreated.email}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Share this temporary password now — it won&apos;t be shown again.
          </p>
          <code className="mt-2 block rounded-lg bg-muted p-2 text-sm">{justCreated.tempPassword}</code>
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => setJustCreated(null)}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {showForm ? (
        <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="space-y-1.5">
            <Label htmlFor="manager-email">Email</Label>
            <Input id="manager-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manager-username">Username</Label>
            <Input id="manager-username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="manager-name">Name</Label>
            <Input id="manager-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" size="sm" disabled={isCreating}>
            {isCreating ? "Creating…" : "Create manager"}
          </Button>
        </form>
      ) : null}

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !managers || managers.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No managers yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {managers.items.map((manager) => (
            <StandardManagerCard key={manager.id} manager={manager} rosterEntries={acceptedMembers} />
          ))}
        </ul>
      )}
    </div>
  );
}

function StandardManagerCard({
  manager,
  rosterEntries,
}: {
  manager: ManagerDto;
  rosterEntries: { id: string; member: { userId: string; name: string } | null }[];
}) {
  const [assign] = useAssignManagerToRosterEntryMutation();
  const [unassign] = useUnassignManagerFromRosterEntryMutation();
  const [expanded, setExpanded] = useState(false);
  const [assignedEntryIds, setAssignedEntryIds] = useState<Set<string>>(new Set());

  function toggle(entryId: string, checked: boolean) {
    setAssignedEntryIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(entryId);
      else next.delete(entryId);
      return next;
    });
    if (checked) assign({ managerId: manager.id, entryId });
    else unassign({ managerId: manager.id, entryId });
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{manager.name ?? manager.email}</p>
          <p className="text-xs text-muted-foreground">{manager.email}</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Hide roster access" : "Manage roster access"}
        </Button>
      </div>
      {expanded ? (
        <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
          {rosterEntries.map((entry) =>
            entry.member ? (
              <li key={entry.id} className="flex items-center gap-2">
                <Checkbox
                  id={`assign-${manager.id}-${entry.id}`}
                  checked={assignedEntryIds.has(entry.id)}
                  onCheckedChange={(checked) => toggle(entry.id, checked === true)}
                />
                <Label htmlFor={`assign-${manager.id}-${entry.id}`} className="text-sm font-normal">
                  {entry.member.name}
                </Label>
              </li>
            ) : null,
          )}
        </ul>
      ) : null}
    </li>
  );
}
