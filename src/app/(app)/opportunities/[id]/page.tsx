"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useGetOpportunityQuery } from "@/lib/redux/endpoints/opportunities-api";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: opportunity, isLoading } = useGetOpportunityQuery(id);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
      <Link
        href="/opportunities"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Opportunities
      </Link>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !opportunity ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Opportunity not found.
        </p>
      ) : (
        <OpportunityCard opportunity={opportunity} />
      )}
    </div>
  );
}
