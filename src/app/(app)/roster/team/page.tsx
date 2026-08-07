"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, HelpCircle, Mail, MoreVertical, Shield } from "lucide-react";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import {
  useAssignManagerToRosterEntryMutation,
  useGetMyRosterQuery,
  useUnassignManagerFromRosterEntryMutation,
} from "@/lib/redux/endpoints/roster-api";
import {
  useGetTeamInvitesQuery,
  useGetTeamMembersQuery,
  useRemoveTeamMemberMutation,
  useRevokeTeamInviteMutation,
  useUpdateTeamMemberPermissionsMutation,
} from "@/lib/redux/endpoints/team-api";
import type { TeamMemberDto } from "@/lib/redux/endpoints/team-api";
import type { RosterEntryDto } from "@/lib/types/roster";
import { PERMISSION_CATEGORIES, type Permission } from "@/lib/permissions";
import { InviteTeamMemberDialog } from "@/components/team/invite-team-member-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import { SectionHelp } from "@/components/shared/section-help";
import { cn } from "@/lib/utils";

export default function TeamPage() {
  const { data: session } = useGetSessionQuery();
  const role = session?.user?.role;
  const isAgency = role === "AGENCY" || role === "AGENCY_MANAGER";

  if (isAgency) {
    return <AgencyTeamView />;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center text-sm text-muted-foreground">
      Team management is only available for agency accounts.
    </div>
  );
}

/* ==========================================================================
   AGENCY TEAM VIEW
   ========================================================================== */
function AgencyTeamView() {
  const { data: members, isLoading: isLoadingMembers } = useGetTeamMembersQuery();
  const { data: invites, isLoading: isLoadingInvites } = useGetTeamInvitesQuery();
  const { data: roster } = useGetMyRosterQuery();
  const [revokeInvite] = useRevokeTeamInviteMutation();

  const acceptedRoster = (roster?.items ?? []).filter((entry) => entry.status === "ACCEPTED" && entry.member);
  const memberItems = members?.items ?? [];
  const inviteItems = invites?.items ?? [];

  async function handleRevoke(id: string) {
    try {
      await revokeInvite(id).unwrap();
      toast.success("Invite revoked");
    } catch {
      toast.error("Couldn't revoke that invite. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Team</h1>
            <SectionHelp
              title="Team"
              description="Staff seats for your agency account — invite teammates with exactly the permissions they need, scoped by category (Talent, Campaigns, Finance, Team, Reports, Settings)."
            />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage internal members who help run your agency&apos;s account.
          </p>
        </div>
        <InviteTeamMemberDialog />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="max-w-xs space-y-1.5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Total Team Members</p>
            <h3 className="font-mono text-3xl font-bold text-foreground">
              {isLoadingMembers ? "—" : memberItems.length}
            </h3>
          </div>

          {inviteItems.length > 0 ? (
            <div className="space-y-3">
              <h2 className="border-b border-border/40 pb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Pending Invites
              </h2>
              <ul className="space-y-2">
                {inviteItems.map((invite) => (
                  <li
                    key={invite.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-card p-3"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Mail className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{invite.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {invite.roleLabel} · sent {formatRelativeTime(invite.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="shrink-0 text-xs" onClick={() => handleRevoke(invite.id)}>
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Team Members</h2>
            </div>

            {isLoadingMembers || isLoadingInvites ? (
              <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
            ) : memberItems.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                No team members yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {memberItems.map((member) => (
                  <TeamMemberRow key={member.id} member={member} rosterEntries={acceptedRoster} />
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-4 rounded-2xl bg-[#476948] p-5 text-white shadow-sm dark:border dark:border-border/60 dark:bg-[#1a2f1f]">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold">About Team Permissions</h4>
                <SectionHelp
                  variant="dark"
                  title="About Team Permissions"
                  description="What each permission category actually gates."
                />
              </div>
              <Shield className="size-4 opacity-80" />
            </div>
            <p className="text-xs leading-relaxed text-white/90">
              Each teammate gets exactly the permissions you grant at invite time — nothing more. Only Talent, Team,
              and Settings actions are enforced today; Campaigns/Finance/Reports permissions are saved for when those
              features ship.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-500">
              <HelpCircle className="size-4.5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-foreground">Need help?</h5>
              <button
                onClick={() => toast.success("Agency support chat opened!")}
                className="mt-0.5 text-left text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:underline"
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
function TeamMemberRow({ member, rosterEntries }: { member: TeamMemberDto; rosterEntries: RosterEntryDto[] }) {
  const [panel, setPanel] = useState<"none" | "roster" | "permissions">("none");
  const [assignedEntryIds, setAssignedEntryIds] = useState<Set<string>>(new Set());
  const [permissions, setPermissions] = useState<Set<Permission>>(new Set(member.permissions as Permission[]));
  const [assign] = useAssignManagerToRosterEntryMutation();
  const [unassign] = useUnassignManagerFromRosterEntryMutation();
  const [updatePermissions, { isLoading: isSavingPermissions }] = useUpdateTeamMemberPermissionsMutation();
  const [removeMember] = useRemoveTeamMemberMutation();

  function toggleRosterEntry(entryId: string, checked: boolean) {
    setAssignedEntryIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(entryId);
      else next.delete(entryId);
      return next;
    });
    if (checked) assign({ managerId: member.id, entryId });
    else unassign({ managerId: member.id, entryId });
  }

  function togglePermission(key: Permission, checked: boolean) {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  async function handleSavePermissions() {
    try {
      await updatePermissions({ memberId: member.id, permissions: [...permissions] }).unwrap();
      toast.success("Permissions updated");
      setPanel("none");
    } catch {
      toast.error("Couldn't save permissions. Please try again.");
    }
  }

  async function handleRemove() {
    try {
      await removeMember(member.id).unwrap();
      toast.success(`Removed ${displayName} from the team`);
    } catch {
      toast.error("Couldn't remove that member. Please try again.");
    }
  }

  const displayName = member.name ?? member.email;

  return (
    <li className="flex flex-col space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback>{initialsFromName(displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-bold text-foreground">{displayName}</p>
              {member.username ? <p className="truncate text-xs text-muted-foreground/80">@{member.username}</p> : null}
              <Badge className="rounded border border-blue-200 bg-blue-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-blue-800 uppercase dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300">
                {member.roleLabel ?? "Manager"}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-xs leading-relaxed text-muted-foreground">
              {member.email} · {member.permissions.length} permission{member.permissions.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="h-8 w-8 shrink-0 p-0 hover:bg-muted" aria-label="Open member actions menu">
                <MoreVertical className="size-4 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setPanel((p) => (p === "permissions" ? "none" : "permissions"))}
              className="text-xs font-semibold"
            >
              {panel === "permissions" ? "Hide Permissions" : "Edit Permissions"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setPanel((p) => (p === "roster" ? "none" : "roster"))}
              className="text-xs font-semibold"
            >
              {panel === "roster" ? "Hide Roster Access" : "Manage Roster Access"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRemove} className="text-xs font-semibold text-destructive">
              Remove from team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {panel === "permissions" ? (
        <div className="mt-2 space-y-2.5 border-t border-border pt-3">
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
            {PERMISSION_CATEGORIES.map((category) => (
              <div key={category.label}>
                <p className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-foreground">
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                  {category.label}
                </p>
                <ul className="space-y-1 py-1 pl-7">
                  {category.permissions.map((perm) => (
                    <li key={perm.key} className="flex items-center gap-2">
                      <Checkbox
                        id={`perm-${member.id}-${perm.key}`}
                        checked={permissions.has(perm.key)}
                        onCheckedChange={(checked) => togglePermission(perm.key, checked === true)}
                      />
                      <Label htmlFor={`perm-${member.id}-${perm.key}`} className="cursor-pointer text-xs font-normal text-foreground">
                        {perm.label}
                      </Label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Button size="sm" disabled={isSavingPermissions} onClick={handleSavePermissions} className="text-xs">
            {isSavingPermissions ? "Saving…" : "Save permissions"}
          </Button>
        </div>
      ) : null}

      {panel === "roster" ? (
        <div className="mt-2 space-y-2.5 border-t border-border pt-3">
          <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Assign Roster Access</p>
          {rosterEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No accepted roster members to assign.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {rosterEntries.map((entry) =>
                entry.member ? (
                  <li key={entry.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`assign-${member.id}-${entry.id}`}
                      checked={assignedEntryIds.has(entry.id)}
                      onCheckedChange={(checked) => toggleRosterEntry(entry.id, checked === true)}
                    />
                    <Label htmlFor={`assign-${member.id}-${entry.id}`} className={cn("cursor-pointer text-xs font-medium text-foreground")}>
                      {entry.member.name}
                    </Label>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </div>
      ) : null}
    </li>
  );
}
