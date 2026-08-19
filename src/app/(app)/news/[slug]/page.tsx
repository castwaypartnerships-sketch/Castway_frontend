"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Newspaper } from "lucide-react";

import { useGetNewsArticleQuery } from "@/lib/redux/endpoints/news-api";
import { formatRelativeTime } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NewsArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: article, isLoading } = useGetNewsArticleQuery(slug);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
      <Link
        href="/home"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Feed
      </Link>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !article ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Article not found.
        </p>
      ) : (
        <article className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f4ea] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[#2d4a35] uppercase dark:bg-[#1a261d] dark:text-[#daf0dd]">
              <Newspaper className="size-3" />
              Castway
            </span>
            <time dateTime={article.publishedAt} className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
              {formatRelativeTime(article.publishedAt)}
            </time>
          </div>

          <h1 className="mt-4 text-2xl font-bold text-foreground">{article.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">via {article.sourceName}</p>

          {article.excerpt ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{article.excerpt}</p>
          ) : null}

          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-6 gap-1.5 bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]",
            )}
          >
            Read more on {article.sourceName}
            <ArrowUpRight className="size-4" />
          </a>
        </article>
      )}
    </div>
  );
}
