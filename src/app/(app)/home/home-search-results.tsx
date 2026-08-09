"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

import { useSearchProfilesQuery, type SearchProfileItem } from "@/lib/redux/endpoints/search-api";
import { useGetOpportunitiesQuery } from "@/lib/redux/endpoints/opportunities-api";
import { useSearchPostsQuery } from "@/lib/redux/endpoints/feed-api";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { PostCard } from "@/components/feed/post-card";
import { AccountRoleBadge } from "@/components/shared/account-role-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initialsFromName } from "@/lib/format";

/** Replaces the Home feed entirely when the topbar search bar has an active
 * query — the fix for "search redirects to Discover instead of showing
 * results": no navigation to a separate page, results render right here. */
export function HomeSearchResults({ query }: { query: string }) {
  const router = useRouter();

  const { data: profileResults, isFetching: isFetchingProfiles } = useSearchProfilesQuery({ query });
  const { data: opportunityResults, isFetching: isFetchingOpportunities } = useGetOpportunitiesQuery({ query });
  const { data: postResults, isFetching: isFetchingPosts } = useSearchPostsQuery({ query });

  const isLoading = isFetchingProfiles || isFetchingOpportunities || isFetchingPosts;
  const totalResults =
    (profileResults?.total ?? 0) + (opportunityResults?.total ?? 0) + (postResults?.total ?? 0);

  function clearSearch() {
    router.push("/home");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Search results for &quot;{query}&quot;</h1>
          {!isLoading ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {totalResults === 0 ? "No matches found." : `${totalResults} result${totalResults === 1 ? "" : "s"}`}
            </p>
          ) : null}
        </div>
        <Button variant="outline" size="sm" onClick={clearSearch} className="shrink-0 gap-1.5">
          <X className="size-3.5" />
          Clear search
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Profiles</h2>
        {isFetchingProfiles ? (
          <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
        ) : !profileResults || profileResults.items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            No profiles match &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {profileResults.items.slice(0, 4).map((profile) => (
              <SearchProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Opportunities</h2>
        {isFetchingOpportunities ? (
          <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
        ) : !opportunityResults || opportunityResults.items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            No opportunities match &quot;{query}&quot;.
          </p>
        ) : (
          <div className="space-y-4">
            {opportunityResults.items.slice(0, 3).map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Posts</h2>
        {isFetchingPosts ? (
          <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
        ) : !postResults || postResults.items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
            No posts match &quot;{query}&quot;.
          </p>
        ) : (
          <div className="space-y-4">
            {postResults.items.slice(0, 5).map((post) => (
              <PostCard key={post.id} item={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SearchProfileCard({ profile }: { profile: SearchProfileItem }) {
  return (
    <Link
      href={`/profile/${profile.username}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#476948]/40"
    >
      <Avatar size="lg" className="size-11 shrink-0">
        <AvatarImage src={profile.avatarUrl ?? undefined} />
        <AvatarFallback>{initialsFromName(profile.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground">{profile.name}</p>
        <AccountRoleBadge role={profile.accountRole} />
      </div>
    </Link>
  );
}
