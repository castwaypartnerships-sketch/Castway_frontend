"use client";

import { useGetSavedPostsQuery } from "@/lib/redux/endpoints/feed-api";
import { useGetSavedOpportunitiesQuery } from "@/lib/redux/endpoints/opportunities-api";
import { PostCard } from "@/components/feed/post-card";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SavedBoardPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <h1 className="text-lg font-semibold text-foreground">Saved Board</h1>
      <p className="text-sm text-muted-foreground">Posts and opportunities you&apos;ve bookmarked.</p>

      <Tabs defaultValue="posts" className="mt-6">
        <TabsList>
          <TabsTrigger value="posts">Saved Posts</TabsTrigger>
          <TabsTrigger value="opportunities">Saved Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-5">
          <SavedPostsTab />
        </TabsContent>
        <TabsContent value="opportunities" className="mt-5">
          <SavedOpportunitiesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SavedPostsTab() {
  const { data, isLoading } = useGetSavedPostsQuery();

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  if (!data || data.items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No saved posts yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {data.items.map((item) => (
        <PostCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function SavedOpportunitiesTab() {
  const { data, isLoading } = useGetSavedOpportunitiesQuery();

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  if (!data || data.items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No saved opportunities yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {data.items.map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} initiallySaved />
      ))}
    </div>
  );
}
