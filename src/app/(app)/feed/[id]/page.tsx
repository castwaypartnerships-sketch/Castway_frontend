"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useGetPostQuery } from "@/lib/redux/endpoints/feed-api";
import { PostCard } from "@/components/feed/post-card";
import { CommentSection } from "@/components/feed/comment-section";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: post, isLoading } = useGetPostQuery(id);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
      <Link
        href="/feed"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Feed
      </Link>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !post ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Post not found.
        </p>
      ) : (
        <>
          <PostCard item={post} />
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Comments</h2>
            <CommentSection postId={id} />
          </div>
        </>
      )}
    </div>
  );
}
