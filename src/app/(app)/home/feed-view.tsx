"use client";

import { useState } from "react";

import { useGetFeedQuery } from "@/lib/redux/endpoints/feed-api";
import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import { initialsFromName } from "@/lib/format";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { FeedFilterTabs, type FeedFilter } from "@/components/feed/filter-tabs";
import { FeedStatsRow } from "@/components/feed/feed-stats-row";
import { useComposer } from "@/components/feed/composer-context";
import { PostCard } from "@/components/feed/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function FeedView() {
  const [filter, setFilter] = useState<FeedFilter>("ALL");
  const [page, setPage] = useState(1);
  const { data: profileData } = useGetOwnProfileQuery();
  const { openComposer } = useComposer();

  const { data, isLoading, isFetching, isError } = useGetFeedQuery({
    category: filter === "ALL" ? undefined : filter,
    page,
  });

  const hasMore = data ? data.items.length < data.total : false;
  const sentinelRef = useInfiniteScroll(hasMore, isFetching, () => setPage((p) => p + 1));

  function handleFilterChange(next: FeedFilter) {
    setFilter(next);
    setPage(1);
  }

  const displayName = profileData?.profile?.name ?? "";
  const firstName = displayName.trim().split(/\s+/)[0];
  const greeting = getTimeOfDayGreeting();

  return (
    <div className="space-y-5">
      {firstName ? (
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, {firstName}!
        </h1>
      ) : null}

      <FeedStatsRow />

      <button
        type="button"
        onClick={openComposer}
        className="flex w-full items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm"
      >
        <Avatar size="lg">
          <AvatarImage src={profileData?.profile?.avatarUrl ?? undefined} />
          <AvatarFallback>{initialsFromName(displayName || "?")}</AvatarFallback>
        </Avatar>
        <span className="flex-1 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Share something with the Castway community...
        </span>
      </button>

      <FeedFilterTabs value={filter} onValueChange={handleFilterChange} />

      {isLoading ? (
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-2xl border border-dashed border-destructive/40 py-16 text-center text-sm text-destructive">
          Couldn&apos;t load the feed. Is the backend running?
        </p>
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No posts in this category yet.
        </p>
      ) : (
        <div className="space-y-5">
          {data.items.map((item) => (
            <PostCard key={item.id} item={item} />
          ))}
          {hasMore ? (
            <div ref={sentinelRef}>
              {isFetching ? (
                <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
