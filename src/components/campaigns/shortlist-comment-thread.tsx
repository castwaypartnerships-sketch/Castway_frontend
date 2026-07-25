"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  useAddShortlistCommentMutation,
  useGetShortlistCommentsQuery,
} from "@/lib/redux/endpoints/campaigns-api";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Shortlist Team Collaboration — internal review thread on one shortlisted
 * creator, visible to the Brand owner and every teammate sharing that
 * account (see `Actor.resourceOwnerId`). Flat, no reply-threading — these
 * are internal notes, not a public discussion, so `CommentSection` (Feed)'s
 * reply machinery isn't reused here. */
export function ShortlistCommentThread({
  campaignId,
  creatorUserId,
}: {
  campaignId: string;
  creatorUserId: string;
}) {
  const { data, isLoading } = useGetShortlistCommentsQuery({ campaignId, creatorUserId });
  const [addComment] = useAddShortlistCommentMutation();
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    const content = draft;
    setDraft("");
    setIsSubmitting(true);
    try {
      await addComment({ campaignId, creatorUserId, content }).unwrap();
    } catch {
      toast.error("Couldn't post that comment. Please try again.");
      setDraft(content);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
      {isLoading ? (
        <div className="h-10 animate-pulse rounded-xl bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No internal notes yet — start the review.</p>
      ) : (
        <ul className="space-y-2.5">
          {data.items.map((comment) => (
            <li key={comment.id} className="flex items-start gap-2.5">
              <Avatar size="sm">
                <AvatarImage src={comment.author.avatarUrl ?? undefined} />
                <AvatarFallback>{initialsFromName(comment.author.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 rounded-xl bg-muted px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-foreground">{comment.author.name}</p>
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Leave a note for your team…"
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isSubmitting || !draft.trim()}>
          Post
        </Button>
      </form>
    </div>
  );
}
