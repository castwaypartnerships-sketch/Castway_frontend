"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus, SearchIcon } from "lucide-react";

import { useGetOpportunitiesQuery } from "@/lib/redux/endpoints/opportunities-api";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { OPPORTUNITY_TYPE_OPTIONS } from "@/components/opportunities/opportunity-form";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { canPostOpportunity, canApplyToOpportunity } from "@/lib/rbac";
import { PROFILE_CATEGORY_OPTIONS } from "@/lib/categories";
import type { OpportunityType } from "@/lib/types/opportunity";

// Only statuses safe to expose on a public browse — DRAFT is owner-only and
// the backend's search() has no ownership check, so it's never offered here.
const BROWSE_STATUS_OPTIONS: { value: "OPEN" | "CLOSED" | "ARCHIVED"; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function OpportunitiesPage() {
  const { data: session } = useGetSessionQuery();

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            Open hiring posts, collaborations, and brand deals from the network.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canApplyToOpportunity(session?.user?.role) ? (
            <Link
              href="/applications"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5")}
            >
              <ClipboardList className="size-4" />
              My Applications
            </Link>
          ) : null}
          {canPostOpportunity(session?.user?.role) ? (
            <>
              <Link
                href="/opportunities/mine"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5")}
              >
                <ClipboardList className="size-4" />
                My Opportunities
              </Link>
              <Link href="/opportunities/new" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
                <Plus className="size-4" />
                Post Opportunity
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <BrowseTab />
    </div>
  );
}

function BrowseTab() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<OpportunityType | "">("");
  const [status, setStatus] = useState<"OPEN" | "CLOSED" | "ARCHIVED">("OPEN");
  const [category, setCategory] = useState("");
  const [skills, setSkills] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError } = useGetOpportunitiesQuery({
    query: query.trim() || undefined,
    type: type || undefined,
    status,
    category: category.trim() || undefined,
    skills: skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    isRemote: isRemote || undefined,
    page,
  });

  const hasMore = data ? data.items.length < data.total : false;
  const sentinelRef = useInfiniteScroll(hasMore, isFetching, () => setPage((p) => p + 1));

  function updateFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => updateFilter(setQuery)(e.target.value)}
            placeholder="Search by title or description…"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="opp-type">Type</Label>
            <Select
              items={{
                __any__: "Any type",
                ...Object.fromEntries(OPPORTUNITY_TYPE_OPTIONS.map((o) => [o.value, o.label])),
              }}
              value={type || "__any__"}
              onValueChange={updateFilter((value: string | null) =>
                setType(!value || value === "__any__" ? "" : (value as OpportunityType)),
              )}
            >
              <SelectTrigger id="opp-type" className="w-full">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__">Any type</SelectItem>
                {OPPORTUNITY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opp-category">Category</Label>
            <Select
              items={{ __any__: "Any category", ...Object.fromEntries(PROFILE_CATEGORY_OPTIONS.map((o) => [o, o])) }}
              value={category || "__any__"}
              onValueChange={updateFilter((value: string | null) =>
                setCategory(!value || value === "__any__" ? "" : value),
              )}
            >
              <SelectTrigger id="opp-category" className="w-full">
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__">Any category</SelectItem>
                {PROFILE_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opp-status">Status</Label>
            <Select
              items={Object.fromEntries(BROWSE_STATUS_OPTIONS.map((o) => [o.value, o.label]))}
              value={status}
              onValueChange={updateFilter((value: string | null) =>
                setStatus((value as "OPEN" | "CLOSED" | "ARCHIVED" | null) ?? "OPEN"),
              )}
            >
              <SelectTrigger id="opp-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BROWSE_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="opp-skills">Skills (comma-separated)</Label>
            <Input
              id="opp-skills"
              value={skills}
              onChange={(e) => updateFilter(setSkills)(e.target.value)}
              placeholder="e.g. Video Editing, Copywriting"
            />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Switch id="opp-remote" checked={isRemote} onCheckedChange={updateFilter(setIsRemote)} />
          <Label htmlFor="opp-remote">Remote only</Label>
        </div>
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
          No open opportunities match those filters yet.
        </p>
      ) : (
        <div className="space-y-5">
          {data.items.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
          {hasMore ? (
            <div ref={sentinelRef}>
              {isFetching ? (
                <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
