"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";

import {
  useCreateManagedTalentMutation,
  useGetManagedTalentQuery,
  useReleaseManagedTalentMutation,
  useUpdateManagedTalentProfileMutation,
} from "@/lib/redux/endpoints/managed-talent-api";
import type { Profile } from "@/lib/types/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** Managed-talent sub-accounts — a second, deliberately separate ownership
 * model from Roster's invite/accept flow (`/roster/team`, `/roster`): the
 * Agency directly creates and controls these accounts, so (like a talent
 * manager seat) the temp password is shown exactly once here. */
export default function ManagedTalentPage() {
  const { data, isLoading } = useGetManagedTalentQuery();
  const [createTalent, { isLoading: isCreating }] = useCreateManagedTalentMutation();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"CREATOR" | "FREELANCER">("CREATOR");
  const [justCreated, setJustCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await createTalent({ email, username, name, role }).unwrap();
      setJustCreated({ email, tempPassword: result.tempPassword });
      setEmail("");
      setUsername("");
      setName("");
      setShowForm(false);
    } catch {
      toast.error("Couldn't create that talent account. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Managed Talent</h1>
          <p className="text-sm text-muted-foreground">
            Talent profiles you create and control directly — distinct from your{" "}
            <Link href="/roster" className="underline">
              Roster
            </Link>
            , which represents independently-owned accounts.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          New talent
        </Button>
      </div>

      {justCreated ? (
        <div className="rounded-2xl border border-primary bg-card p-4">
          <p className="text-sm font-medium text-foreground">Account created for {justCreated.email}</p>
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
            <Label htmlFor="talent-email">Email</Label>
            <Input id="talent-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="talent-username">Username</Label>
            <Input id="talent-username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="talent-name">Name</Label>
            <Input id="talent-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="talent-role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole((value as "CREATOR" | "FREELANCER") ?? "CREATOR")}>
              <SelectTrigger id="talent-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREATOR">Creator</SelectItem>
                <SelectItem value="FREELANCER">Freelancer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="sm" disabled={isCreating}>
            {isCreating ? "Creating…" : "Create talent account"}
          </Button>
        </form>
      ) : null}

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No managed talent yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((profile) => (
            <ManagedTalentCard key={profile.userId} profile={profile} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ManagedTalentCard({ profile }: { profile: Profile }) {
  const [updateProfile, { isLoading: isSaving }] = useUpdateManagedTalentProfileMutation();
  const [release, { isLoading: isReleasing }] = useReleaseManagedTalentMutation();
  const [expanded, setExpanded] = useState(false);
  const [bio, setBio] = useState(profile.bio ?? "");

  async function handleSaveBio() {
    try {
      await updateProfile({ talentUserId: profile.userId, input: { bio } }).unwrap();
      toast.success("Saved");
    } catch {
      toast.error("Couldn't save that change. Please try again.");
    }
  }

  async function handleRelease() {
    if (!confirm(`Release ${profile.name}? They'll keep their account, independently, from now on.`)) return;
    try {
      await release(profile.userId).unwrap();
      toast.success(`Released ${profile.name}`);
    } catch {
      toast.error("Couldn't release that account. Please try again.");
    }
  }

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/profile/${profile.username}`} className="text-sm font-medium text-foreground hover:underline">
            {profile.name}
          </Link>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Hide" : "Edit"}
          </Button>
          <Button size="sm" variant="outline" className="text-destructive" disabled={isReleasing} onClick={handleRelease}>
            Release
          </Button>
        </div>
      </div>
      {expanded ? (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <Label htmlFor={`bio-${profile.userId}`}>Bio</Label>
          <Textarea id={`bio-${profile.userId}`} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          <Button size="sm" disabled={isSaving} onClick={handleSaveBio}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>
      ) : null}
    </li>
  );
}
