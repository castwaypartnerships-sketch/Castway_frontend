"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { UserPlus, X } from "lucide-react";

import {
  useGetMyAgencyLinksQuery,
  useInviteAgencyMutation,
  useRemoveAgencyLinkMutation,
} from "@/lib/redux/endpoints/brand-agency-api";
import type { BrandAgencyLinkDto } from "@/lib/types/brand-agency";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialsFromName } from "@/lib/format";

/** Co-Management for Brand Clients — the **brand** invites an agency here
 * (the reverse trust direction from Roster's agency-invites-member, since
 * the brand is granting access to its own data). */
export default function BrandAgenciesPage() {
  const { data, isLoading } = useGetMyAgencyLinksQuery();
  const [invite, { isLoading: isInviting, error: inviteError }] = useInviteAgencyMutation();
  const [remove] = useRemoveAgencyLinkMutation();
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
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Co-Managing Agencies
        </h1>
        <p className="text-sm text-muted-foreground">
          Invite an agency to manage your campaign briefs, contracts, and shortlists on your behalf.
        </p>
      </div>

      <form onSubmit={handleInvite} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Invite an agency by username"
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
          No co-managing agencies yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((link) => (
            <LinkRow key={link.id} link={link} onRemove={() => remove(link.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function LinkRow({ link, onRemove }: { link: BrandAgencyLinkDto; onRemove: () => void }) {
  const agency = link.agency;
  if (!agency) return null;

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Avatar size="lg">
        <AvatarImage src={agency.avatarUrl ?? undefined} />
        <AvatarFallback>{initialsFromName(agency.name)}</AvatarFallback>
      </Avatar>
      <Link href={`/profile/${agency.username}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{agency.name}</p>
        <p className="truncate text-xs text-muted-foreground">@{agency.username}</p>
      </Link>
      <Badge variant={link.status === "ACCEPTED" ? "default" : "outline"}>
        {link.status === "ACCEPTED" ? "Co-managing" : "Invite pending"}
      </Badge>
      <Button variant="ghost" size="icon-sm" aria-label="Remove" onClick={onRemove}>
        <X className="size-3.5" />
      </Button>
    </li>
  );
}
