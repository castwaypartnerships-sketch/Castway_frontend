"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  useAssignManagerToRosterEntryMutation,
  useCreateManagerMutation,
  useGetManagersQuery,
  useGetMyRosterQuery,
  useUnassignManagerFromRosterEntryMutation,
} from "@/lib/redux/endpoints/roster-api";
import type { ManagerDto } from "@/lib/redux/endpoints/roster-api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Talent manager sub-accounts — agency-provisioned (no self-serve signup),
 * so the temp password is shown exactly once here and never again; the
 * agency is expected to hand it to the manager out-of-band. */
export default function TeamPage() {
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
            <ManagerCard key={manager.id} manager={manager} rosterEntries={acceptedMembers} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ManagerCard({
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
