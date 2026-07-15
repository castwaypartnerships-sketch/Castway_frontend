import type { Metadata } from "next";

import { ProfileCompletionCard } from "@/components/feed/profile-completion-card";
import { SuggestedConnectionsCard } from "@/components/feed/suggested-connections-card";
import { FeedView } from "@/app/(app)/feed/feed-view";

export const metadata: Metadata = {
  title: "Feed",
};

export default function FeedPage() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[1fr_320px]">
      <FeedView />

      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        <ProfileCompletionCard />
        <SuggestedConnectionsCard />
      </aside>
    </div>
  );
}
