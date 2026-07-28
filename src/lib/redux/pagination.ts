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

export function forceRefetchOnPageChange({
  currentArg,
  previousArg,
}: {
  currentArg?: { page?: number } | void;
  previousArg?: { page?: number } | void;
}): boolean {
  return currentArg?.page !== previousArg?.page;
}
