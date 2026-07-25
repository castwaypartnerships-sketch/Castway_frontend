"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import {
  useCreateBrandTeamMemberMutation,
  useGetBrandTeamQuery,
  useRemoveBrandTeamMemberMutation,
} from "@/lib/redux/endpoints/brand-team-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Brand team seats — owner-provisioned (no self-serve signup), so the temp
 * password is shown exactly once here and never again; the owner is expected
 * to hand it to the teammate out-of-band. Every teammate shares the whole
 * Brand account (same campaigns/opportunities/profile/feed/messaging as the
 * owner), so this page is reachable by both `BRAND` and `BRAND_TEAM_MEMBER`
 * — only add/remove are gated to the true owner login. */
export default function BrandTeamPage() {
  const { data: session } = useGetSessionQuery();
  const isOwner = session?.user?.role === "BRAND";

  const { data: members, isLoading } = useGetBrandTeamQuery();
  const [createMember, { isLoading: isCreating }] = useCreateBrandTeamMemberMutation();
  const [removeMember] = useRemoveBrandTeamMemberMutation();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [justCreated, setJustCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const result = await createMember({ email, username, name }).unwrap();
      setJustCreated({ email, tempPassword: result.tempPassword });
      setEmail("");
      setUsername("");
      setName("");
      setShowForm(false);
    } catch {
      toast.error("Couldn't create that teammate account. Please try again.");
    }
  }

  async function handleRemove(memberUserId: string) {
    try {
      await removeMember(memberUserId).unwrap();
    } catch {
      toast.error("Couldn't remove that teammate. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground">
            Teammates share this whole account — same campaigns, opportunities, profile, feed, and messages.
          </p>
        </div>
        {isOwner ? (
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            New teammate
          </Button>
        ) : null}
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

      {showForm && isOwner ? (
        <form onSubmit={handleCreate} className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="space-y-1.5">
            <Label htmlFor="team-email">Email</Label>
            <Input id="team-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-username">Username</Label>
            <Input id="team-username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-name">Name</Label>
            <Input id="team-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="submit" size="sm" disabled={isCreating}>
            {isCreating ? "Creating…" : "Create teammate"}
          </Button>
        </form>
      ) : null}

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !members || members.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No teammates yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {members.items.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{member.name ?? member.email}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              {isOwner ? (
                <Button size="sm" variant="ghost" onClick={() => handleRemove(member.id)}>
                  Remove
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
