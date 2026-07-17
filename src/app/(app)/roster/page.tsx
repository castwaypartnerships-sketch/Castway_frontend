"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { UserPlus, X } from "lucide-react";

import {
  useGetMyRosterQuery,
  useInviteToRosterMutation,
  useRemoveFromRosterMutation,
} from "@/lib/redux/endpoints/roster-api";
import type { RosterEntryDto } from "@/lib/types/roster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialsFromName } from "@/lib/format";

export default function RosterPage() {
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
      <div>
        <h1 className="text-lg font-semibold text-foreground">Roster</h1>
        <p className="text-sm text-muted-foreground">
          Creators and freelancers you represent — they keep full control of their own profile and must
          accept your invite.
        </p>
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
            <RosterRow key={entry.id} entry={entry} onRemove={() => remove(entry.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RosterRow({ entry, onRemove }: { entry: RosterEntryDto; onRemove: () => void }) {
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
      <Button variant="ghost" size="icon-sm" aria-label="Remove from roster" onClick={onRemove}>
        <X className="size-3.5" />
      </Button>
    </li>
  );
}
