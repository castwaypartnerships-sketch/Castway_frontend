"use client";

import { useState } from "react";

import { useGetFeedQuery } from "@/lib/redux/endpoints/feed-api";
import { FeedFilterTabs, type FeedFilter } from "@/components/feed/filter-tabs";
import { PostCard } from "@/components/feed/post-card";

export function FeedView() {
  const [filter, setFilter] = useState<FeedFilter>("ALL");

  const { data, isLoading, isError } = useGetFeedQuery(
    filter === "ALL" ? undefined : { category: filter },
  );

  return (
    <div className="space-y-5">
      <FeedFilterTabs value={filter} onValueChange={setFilter} />

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
        </div>
      )}
    </div>
  );
}
