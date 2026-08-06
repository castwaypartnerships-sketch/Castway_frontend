"use client";

import { useState, type FormEvent, useRef } from "react";
import { toast } from "sonner";
import {
  UserPlus,
  Mail,
  AlertCircle,
  Shield,
  HelpCircle,
  MoreVertical,
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
import type { RosterEntryDto } from "@/lib/types/roster";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initialsFromName } from "@/lib/format";
import { SectionHelp } from "@/components/shared/section-help";

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
  const [newManagerName, setNewManagerName] = useState("");
  const [newManagerUsername, setNewManagerUsername] = useState("");
  const [justCreated, setJustCreated] = useState<{ email: string; tempPassword: string } | null>(null);

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

  const members = managers?.items ?? [];
  const totalTeamCount = members.length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Team</h1>
            <SectionHelp
              title="Team"
              description="Staff seats for your agency account — invite talent managers who can act on your roster's behalf (apply, message) without owning the account."
            />
          </div>
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
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1.5 max-w-xs">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Team Members</p>
            <h3 className="text-3xl font-bold font-mono text-foreground">{isLoadingManagers ? "—" : totalTeamCount}</h3>
          </div>

          {/* Team Members List Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Team Members</h2>
            </div>

            {isLoadingManagers ? (
              <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
            ) : (
              <ul className="space-y-3">
                {members.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                    No managers yet.
                  </p>
                ) : (
                  members.map((manager) => (
                    <TeamMemberRow key={manager.id} manager={manager} rosterEntries={acceptedMembers} />
                  ))
                )}
              </ul>
            )}
          </div>

        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="space-y-5">

          {/* Permissions Guide Card (Dark Green background) */}
          <div className="rounded-2xl bg-[#476948] text-white p-5 shadow-sm space-y-4 dark:bg-[#1a2f1f] dark:border dark:border-border/60">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold">About Managers</h4>
                <SectionHelp
                  variant="dark"
                  title="About Managers"
                  description="What a talent manager sub-account can and can't do on your agency's behalf."
                />
              </div>
              <Shield className="size-4 opacity-80" />
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-white/90 leading-relaxed">
                Managers get their own login, provisioned by you with a temporary password. They can only act
                (apply, message) on behalf of roster members you explicitly assign to them — never your full
                roster, and never billing or account settings.
              </p>
            </div>
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
function TeamMemberRow({ manager, rosterEntries }: { manager: ManagerDto; rosterEntries: RosterEntryDto[] }) {
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
    if (checked) assign({ managerId: manager.id, entryId });
    else unassign({ managerId: manager.id, entryId });
  }

  const displayName = manager.name ?? manager.email;

  return (
    <li className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col space-y-3">
      <div className="flex items-center justify-between gap-3">

        {/* Avatar + Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar size="lg">
            <AvatarFallback>{initialsFromName(displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
              {manager.username ? (
                <p className="text-xs text-muted-foreground/80 truncate">@{manager.username}</p>
              ) : null}
              <Badge className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40">
                Manager
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">
              {manager.email}
            </p>
          </div>
        </div>

        {/* Action trigger dropdown using DropdownMenu component */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 p-0 hover:bg-muted shrink-0" aria-label="Open member actions menu">
                <MoreVertical className="size-4 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setExpanded((v) => !v)}
              className="text-xs font-semibold"
            >
              {expanded ? "Hide Roster Access" : "Manage Roster Access"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
                      id={`assign-${manager.id}-${entry.id}`}
                      checked={assignedEntryIds.has(entry.id)}
                      onCheckedChange={(checked) => toggle(entry.id, checked === true)}
                    />
                    <Label htmlFor={`assign-${manager.id}-${entry.id}`} className="text-xs text-foreground cursor-pointer font-medium">
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
