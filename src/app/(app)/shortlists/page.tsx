"use client";

import Link from "next/link";

import { useGetMyShortlistsQuery } from "@/lib/redux/endpoints/campaigns-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime, initialsFromName } from "@/lib/format";

export default function ShortlistsPage() {
  const { data, isLoading, isError } = useGetMyShortlistsQuery();

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-6 py-6">
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Shortlists</h1>
        <p className="text-sm text-muted-foreground">
          Campaigns brands and agencies have shortlisted you for.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-2xl border border-dashed border-destructive/40 py-16 text-center text-sm text-destructive">
          Couldn&apos;t load your shortlists.
        </p>
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No one has shortlisted you yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map(({ campaign, brand, shortlistedAt }) => (
            <li key={campaign.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                {brand ? (
                  <Link href={`/profile/${brand.username}`} className="shrink-0">
                    <Avatar>
                      <AvatarImage src={brand.avatarUrl ?? undefined} />
                      <AvatarFallback>{initialsFromName(brand.name)}</AvatarFallback>
                    </Avatar>
                  </Link>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{campaign.name}</p>
                  {brand ? (
                    <Link
                      href={`/profile/${brand.username}`}
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {brand.name}
                    </Link>
                  ) : (
                    <p className="text-xs text-muted-foreground">Unknown brand</p>
                  )}
                  {campaign.goals ? (
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{campaign.goals}</p>
                  ) : null}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {campaign.budget ? `${campaign.budget} · ` : ""}
                    Shortlisted {formatRelativeTime(shortlistedAt)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
