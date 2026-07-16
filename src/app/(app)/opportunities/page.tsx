"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { useGetOpportunitiesQuery } from "@/lib/redux/endpoints/opportunities-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isHiringRole } from "@/lib/rbac";

export default function OpportunitiesPage() {
  const { data, isLoading, isError } = useGetOpportunitiesQuery();
  const { data: session } = useGetSessionQuery();

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            Open hiring posts, collaborations, and brand deals from the network.
          </p>
        </div>
        {isHiringRole(session?.user?.role) ? (
          <Link href="/opportunities/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
            <Plus className="size-4" />
            Post Opportunity
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-2xl border border-dashed border-destructive/40 py-16 text-center text-sm text-destructive">
          Couldn&apos;t load opportunities.
        </p>
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No open opportunities yet. Be the first to post one.
        </p>
      ) : (
        <div className="space-y-5">
          {data.items.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      )}
    </div>
  );
}
