/** Shape returned by every paginated list endpoint in this app (`/feed`,
 * `/feed/:id/comments`, `/opportunities`). */
interface PaginatedPage<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

/**
 * RTK Query `merge` for infinite-scroll pagination: appends a newly-fetched
 * page's items onto the cached list, de-duped by id.
 *
 * The de-dupe matters because a mutation elsewhere (e.g. creating a post)
 * invalidates the list's tag, which re-fetches whatever page the component
 * is currently subscribed to — not just page 1. Without the id check, that
 * re-fetch would re-append a page already sitting in the cache.
 *
 * Appending is correct for oldest-first lists (e.g. comments, ordered by
 * `createdAt: "asc"`), where page 1 is the back of the list. For
 * newest-first lists use `mergeNewestFirstPage` instead.
 *
 * Pair with `serializeQueryArgs` that ignores `page` (so every page for the
 * same filters lands in one cache entry) and `forceRefetch` keyed on `page`
 * changing.
 */
export function mergePaginatedPage<T extends { id: string }>(
  currentCache: PaginatedPage<T>,
  newPage: PaginatedPage<T>,
): void {
  const seenIds = new Set(currentCache.items.map((item) => item.id));
  currentCache.items.push(...newPage.items.filter((item) => !seenIds.has(item.id)));
  currentCache.page = newPage.page;
  currentCache.pageSize = newPage.pageSize;
  currentCache.total = newPage.total;
}

/**
 * Same recipe as `mergePaginatedPage`, for newest-first lists (e.g. the
 * feed, ordered by `createdAt: "desc"`). Page 1 IS the front of the list, so
 * any unseen item surfaced by a page-1 refetch (e.g. a post the user just
 * created, via tag invalidation) must be unshifted to the front — appending
 * it, like the oldest-first recipe does, would bury it at the end of the
 * already-cached pages below instead of showing it where the user expects
 * their new post to appear.
 */
export function mergeNewestFirstPage<T extends { id: string }>(
  currentCache: PaginatedPage<T>,
  newPage: PaginatedPage<T>,
): void {
  const seenIds = new Set(currentCache.items.map((item) => item.id));
  const unseenItems = newPage.items.filter((item) => !seenIds.has(item.id));
  if (newPage.page === 1) {
    currentCache.items.unshift(...unseenItems);
  } else {
    currentCache.items.push(...unseenItems);
  }
  currentCache.page = newPage.page;
  currentCache.pageSize = newPage.pageSize;
  currentCache.total = newPage.total;
}

export function forceRefetchOnPageChange({
  currentArg,
  previousArg,
}: {
  currentArg?: { page?: number } | void;
  previousArg?: { page?: number } | void;
}): boolean {
  return currentArg?.page !== previousArg?.page;
}
