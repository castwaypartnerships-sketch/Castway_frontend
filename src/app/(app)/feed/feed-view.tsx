"use client";

import { useEffect, useRef, useState } from "react";

import { useGetFeedQuery } from "@/lib/redux/endpoints/feed-api";
import { FeedFilterTabs, type FeedFilter } from "@/components/feed/filter-tabs";
import { CreatePostDialog } from "@/components/feed/create-post-dialog";
import { PostCard } from "@/components/feed/post-card";

export function FeedView() {
  const [filter, setFilter] = useState<FeedFilter>("ALL");
  const [composerOpen, setComposerOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError } = useGetFeedQuery({
    category: filter === "ALL" ? undefined : filter,
    page,
  });

  const hasMore = data ? data.items.length < data.total : false;
  const sentinelRef = useRef<HTMLDivElement>(null);

  function handleFilterChange(next: FeedFilter) {
    setFilter(next);
    setPage(1);
  }

  // Advances `page` once the sentinel at the bottom of the list scrolls into
  // view. Re-created whenever `hasMore`/`isFetching` change so it never
  // fires while a page is already in flight or after the last page loads.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  return (
    <div className="space-y-5">
      <FeedFilterTabs value={filter} onValueChange={handleFilterChange} onNewProposal={() => setComposerOpen(true)} />
      <CreatePostDialog open={composerOpen} onOpenChange={setComposerOpen} />

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
