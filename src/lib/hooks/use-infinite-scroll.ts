"use client";

import { useEffect, useRef } from "react";

/**
 * Returns a ref to attach to a sentinel element at the bottom of a list.
 * Once that sentinel scrolls into view, calls `onLoadMore` — the standard
 * infinite-scroll pattern shared by the feed and opportunities lists.
 *
 * Re-creates the observer whenever `hasMore`/`isFetching` change so it never
 * fires while a page is already in flight or after the last page loads.
 */
export function useInfiniteScroll(hasMore: boolean, isFetching: boolean, onLoadMore: () => void) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // `onLoadMore` intentionally omitted: callers pass an inline closure
    // (e.g. `() => setPage((p) => p + 1)`) that's a new reference every
    // render, but the effect only needs to re-run on `hasMore`/`isFetching`
    // transitions — it reads the current `onLoadMore` via closure when the
    // observer actually fires, not when the effect re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isFetching]);

  return sentinelRef;
}
