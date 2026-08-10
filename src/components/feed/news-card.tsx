import Link from "next/link";
import { Newspaper } from "lucide-react";

import type { FeedNewsItem } from "@/lib/types/feed";
import { formatRelativeTime } from "@/lib/format";

/**
 * Scraped external article, branded as a Castway pick rather than a raw
 * link-out — the whole card opens Castway's own `/news/[slug]` page; the
 * external `sourceUrl` is only ever surfaced behind that page's "Read more"
 * (see `app/(app)/news/[slug]/page.tsx`), never linked directly from here.
 */
export function NewsFeedCard({ item }: { item: FeedNewsItem }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="mx-auto block w-full max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#476948]/40 sm:p-6 dark:hover:border-[#a7d9b5]/40"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f4ea] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#2d4a35] uppercase dark:bg-[#1a261d] dark:text-[#daf0dd]">
          <Newspaper className="size-3" />
          Castway News
        </span>
        <time dateTime={item.createdAt} className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
          {formatRelativeTime(item.createdAt)}
        </time>
      </div>

      <h3 className="mt-3 text-lg font-semibold text-foreground">{item.title}</h3>
      {item.excerpt ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>
      ) : null}

      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">via {item.sourceName}</p>
    </Link>
  );
}
