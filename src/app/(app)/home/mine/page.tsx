"use client";

import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { FeedItem, PostStatus } from "@/lib/types/feed";
import {
  useArchivePostMutation,
  useDeletePostMutation,
  useGetMyPostsQuery,
  usePublishPostMutation,
  useUnarchivePostMutation,
} from "@/lib/redux/endpoints/feed-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/format";

const STATUS_LABEL: Record<PostStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
  DELETED: "Deleted",
};

const STATUS_VARIANT: Record<PostStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  SCHEDULED: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "secondary",
  DELETED: "destructive",
};

export default function MyPostsPage() {
  const { data, isLoading } = useGetMyPostsQuery();
  const [publish] = usePublishPostMutation();
  const [archive] = useArchivePostMutation();
  const [unarchive] = useUnarchivePostMutation();
  const [deletePost] = useDeletePostMutation();

  async function handlePublish(post: FeedItem) {
    try {
      await publish(post.id).unwrap();
      toast.success("Post published");
    } catch {
      toast.error("Couldn't publish that post. Please try again.");
    }
  }

  async function handleArchive(post: FeedItem) {
    try {
      await archive(post.id).unwrap();
      toast.success("Post archived");
    } catch {
      toast.error("Couldn't archive that post. Please try again.");
    }
  }

  async function handleUnarchive(post: FeedItem) {
    try {
      await unarchive(post.id).unwrap();
      toast.success("Post restored");
    } catch {
      toast.error("Couldn't restore that post. Please try again.");
    }
  }

  async function handleDelete(post: FeedItem) {
    if (!confirm("Delete this post? This can't be undone.")) return;
    try {
      await deletePost(post.id).unwrap();
      toast.success("Post deleted");
    } catch {
      toast.error("Couldn't delete that post. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-6 py-6">
      <div>
        <Link href="/home" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Back to Feed
        </Link>
        <h1 className="mt-2 font-heading text-lg font-semibold tracking-tight text-foreground">My Posts</h1>
        <p className="text-sm text-muted-foreground">
          Manage your drafts and published posts, including archiving or deleting them.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          You haven&apos;t posted anything yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/home/${post.id}`} className="truncate text-sm font-medium text-foreground hover:underline">
                    {post.title}
                  </Link>
                  <Badge variant={STATUS_VARIANT[post.status]}>{STATUS_LABEL[post.status]}</Badge>
                  {post.visibility === "CONNECTIONS_ONLY" ? (
                    <Badge variant="outline">Connections only</Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {post.status === "SCHEDULED" && post.scheduledFor
                    ? `Scheduled for ${new Date(post.scheduledFor).toLocaleString()}`
                    : formatRelativeTime(post.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {post.status === "DRAFT" || post.status === "SCHEDULED" ? (
                  <Button size="sm" onClick={() => handlePublish(post)}>
                    {post.status === "SCHEDULED" ? "Publish now" : "Publish"}
                  </Button>
                ) : null}
                {post.status === "PUBLISHED" ? (
                  <Button variant="outline" size="sm" onClick={() => handleArchive(post)}>
                    Archive
                  </Button>
                ) : null}
                {post.status === "ARCHIVED" ? (
                  <Button variant="outline" size="sm" onClick={() => handleUnarchive(post)}>
                    Restore
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete"
                  className="text-destructive"
                  onClick={() => handleDelete(post)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
