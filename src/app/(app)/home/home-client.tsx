"use client";

import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { FeedView } from "@/app/(app)/home/feed-view";
import { ProfileCompletionCard } from "@/components/feed/profile-completion-card";
import { SuggestedConnectionsCard } from "@/components/feed/suggested-connections-card";
import { TrendingSkillsCard } from "@/components/shared/trending-skills-card";
import { NewOpportunitiesCard } from "@/components/shared/new-opportunities-card";
import { AgencyHomeView } from "@/components/feed/agency-home-view";

export function HomeClient() {
  const { data: session, isLoading } = useGetSessionQuery();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const role = session?.user?.role;
  // AGENCY_MANAGER deliberately excluded — it's a narrow sub-account scope
  // with no dashboard/roster/managers data of its own (see nav-items.ts and
  // dashboard.service.ts), so AgencyHomeView's owner-only widgets (Company
  // Profile completion, Your Team, campaign creation) don't apply to it.
  const isAgency = role === "AGENCY";

  if (isAgency) {
    return <AgencyHomeView />;
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[1fr_320px]">
      <FeedView />

      <aside className="hidden space-y-5 lg:block lg:sticky lg:top-6 lg:self-start">
        <ProfileCompletionCard />
        <SuggestedConnectionsCard />
        <TrendingSkillsCard />
        <NewOpportunitiesCard />
      </aside>
    </div>
  );
}
