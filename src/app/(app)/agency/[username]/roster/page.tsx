"use client";

import { use } from "react";
import Link from "next/link";

import { useGetPublicRosterCatalogQuery } from "@/lib/redux/endpoints/roster-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsFromName } from "@/lib/format";

/** Roster-as-a-Catalog — a public, no-auth showcase of an agency's opted-in
 * roster members. Kept as its own route rather than a tab on `/profile/[username]`
 * since it has a fundamentally different data shape (a list of *other*
 * profiles, not the agency's own profile fields). */
export default function AgencyRosterCatalogPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { data, isLoading, isError } = useGetPublicRosterCatalogQuery(username);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Represented Talent
        </h1>
        <p className="text-sm text-muted-foreground">
          Creators and freelancers represented by{" "}
          <Link href={`/profile/${username}`} className="font-medium text-foreground hover:underline">
            @{username}
          </Link>
          .
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
          <div className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
        </div>
      ) : isError || !data ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Couldn&apos;t load this roster.
        </p>
      ) : data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No publicly listed talent yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((entry) =>
            entry.member ? (
              <li key={entry.id}>
                <Link
                  href={`/profile/${entry.member.username}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  <Avatar size="lg">
                    <AvatarImage src={entry.member.avatarUrl ?? undefined} />
                    <AvatarFallback>{initialsFromName(entry.member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{entry.member.name}</p>
                    <p className="truncate text-xs text-muted-foreground">@{entry.member.username}</p>
                  </div>
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </div>
  );
}
