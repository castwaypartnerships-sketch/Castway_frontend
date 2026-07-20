"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useAddCommentMutation, useGetCommentsQuery } from "@/lib/redux/endpoints/feed-api";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CommentSection({ postId }: { postId: string }) {
  const { data, isLoading } = useGetCommentsQuery(postId);
  const [addComment, { isLoading: isSubmitting }] = useAddCommentMutation();
  const [draft, setDraft] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    const content = draft;
    setDraft("");
    try {
      await addComment({ postId, content }).unwrap();
    } catch {
      toast.error("Couldn't post that comment. Please try again.");
      setDraft(content);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a comment…"
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isSubmitting || !draft.trim()}>
          Post
        </Button>
      </form>

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet — be the first to reply.</p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((comment) => (
            <li key={comment.id} className="flex items-start gap-3">
              <Avatar size="sm">
                <AvatarImage src={comment.author.avatarUrl ?? undefined} />
                <AvatarFallback>{initialsFromName(comment.author.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 rounded-xl bg-muted px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-foreground">{comment.author.name}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
