"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CornerDownRight } from "lucide-react";

import {
  useAddCommentMutation,
  useGetCommentsQuery,
  useGetRepliesQuery,
} from "@/lib/redux/endpoints/feed-api";
import type { FeedComment } from "@/lib/types/feed";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function CommentForm({
  onSubmit,
  placeholder,
  autoFocus,
}: {
  onSubmit: (content: string) => Promise<void>;
  placeholder: string;
  autoFocus?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    const content = draft;
    setDraft("");
    setIsSubmitting(true);
    try {
      await onSubmit(content);
    } catch {
      toast.error("Couldn't post that. Please try again.");
      setDraft(content);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={isSubmitting || !draft.trim()}>
        Post
      </Button>
    </form>
  );
}

function CommentRow({ comment }: { comment: FeedComment }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar size="sm">
        <AvatarImage src={comment.author.avatarUrl ?? undefined} />
        <AvatarFallback>{initialsFromName(comment.author.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 rounded-xl bg-muted px-3 py-2">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-foreground">{comment.author.name}</p>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-foreground">{comment.content}</p>
      </div>
    </div>
  );
}

function RepliesThread({ parentCommentId }: { parentCommentId: string }) {
  const { data, isLoading } = useGetRepliesQuery(parentCommentId);

  if (isLoading) {
    return <div className="ml-11 h-10 animate-pulse rounded-xl bg-muted" />;
  }
  if (!data || data.items.length === 0) return null;

  return (
    <ul className="ml-11 space-y-3">
      {data.items.map((reply) => (
        <li key={reply.id}>
          <CommentRow comment={reply} />
        </li>
      ))}
    </ul>
  );
}

function TopLevelComment({ postId, comment }: { postId: string; comment: FeedComment }) {
  const [addComment] = useAddCommentMutation();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  async function handleReply(content: string) {
    await addComment({ postId, content, parentCommentId: comment.id }).unwrap();
    setIsReplying(false);
    setShowReplies(true);
  }

  return (
    <li className="space-y-2">
      <CommentRow comment={comment} />

      <div className="ml-11 flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => setIsReplying((v) => !v)}
          className="font-medium text-muted-foreground hover:text-foreground"
        >
          Reply
        </button>
        {comment.replyCount > 0 ? (
          <button
            type="button"
            onClick={() => setShowReplies((v) => !v)}
            className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
          >
            <CornerDownRight className="size-3" />
            {showReplies
              ? "Hide replies"
              : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
          </button>
        ) : null}
      </div>

      {isReplying ? (
        <div className="ml-11">
          <CommentForm onSubmit={handleReply} placeholder={`Reply to ${comment.author.name}…`} autoFocus />
        </div>
      ) : null}

      {showReplies ? <RepliesThread parentCommentId={comment.id} /> : null}
    </li>
  );
}

export function CommentSection({ postId }: { postId: string }) {
  const { data, isLoading } = useGetCommentsQuery(postId);
  const [addComment] = useAddCommentMutation();

  async function handleAddComment(content: string) {
    await addComment({ postId, content }).unwrap();
  }

  return (
    <div className="space-y-4">
      <CommentForm onSubmit={handleAddComment} placeholder="Write a comment…" />

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-xl bg-muted" />
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet — be the first to reply.</p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((comment) => (
            <TopLevelComment key={comment.id} postId={postId} comment={comment} />
          ))}
        </ul>
      )}
    </div>
  );
}
