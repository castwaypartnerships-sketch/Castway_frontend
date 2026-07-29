"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus, SearchIcon } from "lucide-react";

import { useGetOpportunitiesQuery } from "@/lib/redux/endpoints/opportunities-api";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import { useGetMyApplicationsQuery, useWithdrawApplicationMutation } from "@/lib/redux/endpoints/applications-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { OPPORTUNITY_TYPE_OPTIONS } from "@/components/opportunities/opportunity-form";
import { ApplicationStatusBadge } from "@/components/home/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/format";
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
  const showMyApplications = canApplyToOpportunity(session?.user?.role);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Opportunities</h1>
          <p className="text-sm text-muted-foreground">
            Open hiring posts, collaborations, and brand deals from the network.
          </p>
        </div>
        {canPostOpportunity(session?.user?.role) ? (
          <div className="flex items-center gap-2">
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
          </div>
        ) : null}
      </div>

      {showMyApplications ? (
        <Tabs defaultValue="browse">
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="mine">My Applications</TabsTrigger>
          </TabsList>
          <TabsContent value="browse" className="mt-5">
            <BrowseTab />
          </TabsContent>
          <TabsContent value="mine" className="mt-5">
            <MyApplicationsTab />
          </TabsContent>
        </Tabs>
      ) : (
        <BrowseTab />
      )}
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

function MyApplicationsTab() {
  const { data, isLoading } = useGetMyApplicationsQuery();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  if (!data || data.items.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        You haven&apos;t applied to anything yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {data.items.map((application) => (
        <li
          key={application.id}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{application.opportunity.title}</p>
            <p className="text-xs text-muted-foreground">
              Applied {formatRelativeTime(application.createdAt)}
              {application.opportunity.budget ? ` · ${application.opportunity.budget}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ApplicationStatusBadge status={application.status} />
            {application.status === "PENDING" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isWithdrawing}
                onClick={() => withdraw(application.id)}
              >
                Withdraw
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
