"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Bookmark, CalendarDays, DollarSign, Heart, MessageCircle } from "lucide-react";

import type { FeedItem } from "@/lib/types/feed";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import { useToggleLikeMutation, useToggleSavePostMutation } from "@/lib/redux/endpoints/feed-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/feed/category-badge";
import { CommentDialog } from "@/components/feed/comment-dialog";
import { SharePostMenu } from "@/components/feed/share-post-menu";
import { useApplyFlow } from "@/components/opportunities/use-apply-flow";
import { ApplyComposer } from "@/components/opportunities/apply-composer";
import { cn } from "@/lib/utils";

export function PostCard({ item }: { item: FeedItem }) {
  const [toggleLike] = useToggleLikeMutation();
  const [toggleSave] = useToggleSavePostMutation();
  const [liked, setLiked] = useState(item.viewerHasLiked);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [saved, setSaved] = useState(item.viewerHasSaved);
  const [commentsOpen, setCommentsOpen] = useState(false);
  // Called even when there's no linked Opportunity (hook rules — can't call
  // conditionally); the trigger button below only renders when
  // `item.proposal.opportunityId` is actually present, so `handleApply`
  // never fires against the empty-string placeholder.
  const applyFlow = useApplyFlow(
    item.proposal?.opportunityId ?? "",
    item.proposal?.viewerHasApplied ?? false,
    item.author.userId,
  );
  const { canApply, isFreelancer, composing, setComposing, isApplying, hasApplied, handleApply } = applyFlow;

  async function handleToggleLike() {
    // Guards against a rapid double-click firing two overlapping requests —
    // the backend now tolerates that safely too, but this avoids the
    // pointless second round trip in the common case.
    if (isTogglingLike) return;
    setIsTogglingLike(true);

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));

    try {
      await toggleLike(item.id).unwrap();
    } catch {
      // Roll back on failure (e.g. not signed in, network error).
      setLiked(!nextLiked);
      setLikeCount((prev) => (nextLiked ? prev - 1 : prev + 1));
    } finally {
      setIsTogglingLike(false);
    }
  }

  async function handleToggleSave() {
    const nextSaved = !saved;
    setSaved(nextSaved);

    try {
      await toggleSave(item.id).unwrap();
    } catch {
      setSaved(!nextSaved);
    }
  }

  return (
    <article className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 [content-visibility:auto] [contain-intrinsic-size:auto_420px] break-words overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/profile/${item.author.username}`} className="flex min-w-0 flex-1 items-start gap-3">
          <Avatar size="lg" className="shrink-0">
            <AvatarImage src={item.author.avatarUrl ?? undefined} />
            <AvatarFallback>{initialsFromName(item.author.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-foreground hover:underline">{item.author.name}</p>
              {item.author.verified ? (
                <BadgeCheck className="shrink-0 size-4 text-[#476948] dark:text-[#a7d9b5]" aria-label="Verified" />
              ) : null}
              <CategoryBadge category={item.category} className="ml-1 shrink-0" />
            </div>
            <p className="truncate text-sm text-muted-foreground">{item.author.role}</p>
          </div>
        </Link>
        <time
          dateTime={item.createdAt}
          className="shrink-0 text-xs whitespace-nowrap text-muted-foreground"
        >
          {formatRelativeTime(item.createdAt)}
        </time>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-[#476948] hover:underline dark:text-[#a7d9b5]">
        <Link href={`/home/${item.id}`}>{item.title}</Link>
      </h3>
      <div
        // `item.description` is sanitized server-side before persisting (see
        // `backend/src/lib/sanitize-post-content.ts`) — only ever the fixed
        // set of rich-text tags the post editor can produce.
        className="prose-post mt-2 text-sm leading-relaxed text-muted-foreground [&_a]:text-[#476948] [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 dark:[&_a]:text-[#a7d9b5]"
        dangerouslySetInnerHTML={{ __html: item.description }}
      />

      {item.imageUrl ? (
        <div className="relative mt-4 aspect-video w-full max-h-[400px] overflow-hidden rounded-xl bg-muted">
          <Image
            src={item.imageUrl}
            alt=""
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 640px, 100vw"
          />
        </div>
      ) : null}

      {item.proposal ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-background text-[#476948] dark:text-[#a7d9b5]">
              <DollarSign className="size-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Allocated Budget
              </p>
              <p className="text-sm font-medium text-foreground">{item.proposal.budgetLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-background text-[#476948] dark:text-[#a7d9b5]">
              <CalendarDays className="size-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                Applications Close
              </p>
              <p className="text-sm font-medium text-foreground">
                {item.proposal.deadlineLabel === "Rolling"
                  ? "Rolling"
                  : new Date(item.proposal.deadlineLabel).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      // The composer's date picker sends the chosen calendar day as UTC
                      // midnight (`new Date(deadline).toISOString()` on a date-only
                      // string) — it represents a day, not an instant, so it must be
                      // read back in UTC too, or it rolls back a day for any viewer
                      // west of UTC.
                      timeZone: "UTC",
                    })}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {item.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
            >
              #{tag.replace(/\s+/g, "")}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleLike}
            disabled={isTogglingLike}
            aria-pressed={liked}
            className={cn("gap-1.5", liked && "text-destructive")}
          >
            <Heart className={cn("size-4", liked && "fill-destructive")} />
            {likeCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setCommentsOpen(true)}
          >
            <MessageCircle className="size-4" />
            {item.commentCount}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleToggleSave}
            aria-pressed={saved}
            aria-label={saved ? "Remove from saved" : "Save post"}
          >
            <Bookmark className={cn("size-4", saved && "fill-foreground")} />
          </Button>
          <SharePostMenu postId={item.id} title={item.title} />
        </div>
        {item.proposal?.opportunityId && canApply && !composing ? (
          <Button
            size="sm"
            disabled={isApplying || hasApplied}
            className="bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
            onClick={() => {
              if (isFreelancer) setComposing(true);
              else void handleApply();
            }}
          >
            {hasApplied ? "Applied" : isApplying ? "Applying…" : "Apply Proposal"}
          </Button>
        ) : null}
      </div>

      {composing ? <ApplyComposer flow={applyFlow} /> : null}

      <CommentDialog postId={item.id} open={commentsOpen} onOpenChange={setCommentsOpen} />
    </article>
  );
}
