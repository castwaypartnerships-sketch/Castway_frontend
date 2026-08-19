"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Briefcase, Search as SearchIcon } from "lucide-react";

import type { Application, ApplicationStatus } from "@/lib/types/application";
import type { AppNotification } from "@/lib/types/notification";
import { useGetMyApplicationsQuery, useWithdrawApplicationMutation } from "@/lib/redux/endpoints/applications-api";
import { useGetNotificationsQuery } from "@/lib/redux/endpoints/notifications-api";
import { RoleGuard } from "@/components/auth/role-guard";
import { OPPORTUNITY_APPLICANT_ROLES } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileCompletionCard } from "@/components/feed/profile-completion-card";
import { TrendingSkillsCard } from "@/components/shared/trending-skills-card";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_META: Record<ApplicationStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-[#f3f4f6] text-[#6b7280] dark:bg-white/10 dark:text-white/70" },
  ACCEPTED: { label: "Accepted", className: "bg-[#e6f4ea] text-[#16a34a] dark:bg-[#1a261d] dark:text-[#daf0dd]" },
  REJECTED: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
  WITHDRAWN: { label: "Withdrawn", className: "bg-muted text-muted-foreground" },
  COMPLETED: { label: "Completed", className: "bg-[#e6f4ea] text-[#16a34a] dark:bg-[#1a261d] dark:text-[#daf0dd]" },
};

const OPPORTUNITY_TYPE_LABEL: Record<string, string> = {
  HIRING: "Hiring",
  COLLABORATION: "Collaboration",
  BRAND_DEAL: "Brand Deal",
  FREELANCE_GIG: "Freelance Gig",
  SPONSORSHIP: "Sponsorship",
  AMBASSADORSHIP: "Ambassadorship",
  UGC_CONTENT: "UGC / Content Creation",
  EVENT_APPEARANCE: "Event / Appearance",
};

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
] as const;

export default function MyApplicationsPage() {
  return (
    <RoleGuard allowed={OPPORTUNITY_APPLICANT_ROLES} redirectTo="/opportunities">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
        <div>
          <MyApplicationsView />
        </div>
        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <ProfileCompletionCard />
          <RecentApplicationActivityCard />
          <TrendingSkillsCard />
        </aside>
      </div>
    </RoleGuard>
  );
}

function MyApplicationsView() {
  const { data, isLoading, isError } = useGetMyApplicationsQuery();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawApplicationMutation();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof FILTER_TABS)[number]["value"]>("all");

  const items = useMemo(() => data?.items ?? [], [data]);
  const filtered = useMemo(() => {
    return items.filter((application) => {
      if (tab !== "all" && application.status !== tab) return false;
      if (query.trim() && !application.opportunity.title.toLowerCase().includes(query.trim().toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [items, tab, query]);

  const total = items.length;
  const accepted = items.filter((a) => a.status === "ACCEPTED").length;
  const pending = items.filter((a) => a.status === "PENDING").length;
  const decided = items.filter(
    (a) => a.status === "ACCEPTED" || a.status === "REJECTED" || a.status === "COMPLETED",
  ).length;
  const responseRate = total === 0 ? 0 : Math.round((decided / total) * 100);

  async function handleWithdraw(application: Application) {
    if (!confirm(`Withdraw your application for "${application.opportunity.title}"?`)) return;
    try {
      await withdraw(application.id).unwrap();
      toast.success("Application withdrawn");
    } catch {
      toast.error("Couldn't withdraw that application. Please try again.");
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">My Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track where you&apos;ve applied and the status of each opportunity.
          </p>
        </div>
        <div className="relative w-full max-w-[280px] shrink-0">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search applications…"
            className="pl-9"
          />
        </div>
      </div>

      {!isLoading && !isError ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap">
          {[
            { label: "Total Applications", value: total },
            { label: "Accepted", value: accepted },
            { label: "Pending Decision", value: pending },
            { label: "Response Rate", value: `${responseRate}%` },
          ].map((stat) => (
            <div key={stat.label} className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <Tabs value={tab} onValueChange={(v) => setTab(v as (typeof FILTER_TABS)[number]["value"])} className="mt-6">
        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsList className="h-auto flex w-max gap-2 rounded-none bg-transparent p-0">
            {FILTER_TABS.map((filterTab) => (
              <TabsTrigger
                key={filterTab.value}
                value={filterTab.value}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-none data-active:border-transparent data-active:bg-[#1c3322] data-active:text-white data-active:shadow-none dark:data-active:bg-[#25422d] shrink-0"
              >
                {filterTab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={tab} className="mt-5">
          {isLoading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState>Couldn&apos;t load your applications.</EmptyState>
          ) : filtered.length === 0 ? (
            <EmptyState>
              {items.length === 0 ? (
                <>
                  You haven&apos;t applied to anything yet.{" "}
                  <Link href="/opportunities" className="text-[#476948] underline dark:text-[#a7d9b5]">
                    Browse opportunities
                  </Link>
                </>
              ) : (
                "No applications match those filters."
              )}
            </EmptyState>
          ) : (
            <ul className="space-y-4">
              {filtered.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  isWithdrawing={isWithdrawing}
                  onWithdraw={() => handleWithdraw(application)}
                />
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function ApplicationCard({
  application,
  isWithdrawing,
  onWithdraw,
}: {
  application: Application;
  isWithdrawing: boolean;
  onWithdraw: () => void;
}) {
  const statusMeta = STATUS_META[application.status];

  return (
    <li className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ea] dark:bg-[#1a261d]">
            <Briefcase className="size-5 text-[#2d4a35] dark:text-[#daf0dd]" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/opportunities/${application.opportunity.id}`}
                className="font-semibold text-foreground hover:underline"
              >
                {application.opportunity.title}
              </Link>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                  statusMeta.className,
                )}
              >
                {statusMeta.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {OPPORTUNITY_TYPE_LABEL[application.opportunity.type] ?? application.opportunity.type} · Applied{" "}
              {formatRelativeTime(application.createdAt)}
            </p>
          </div>
        </div>
        {application.opportunity.budget ? (
          <p className="shrink-0 font-semibold text-foreground">{application.opportunity.budget}</p>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4">
        <Link
          href={`/opportunities/${application.opportunity.id}`}
          className="inline-flex items-center rounded-md border border-border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          View Details
        </Link>
        {application.status === "PENDING" ? (
          <Button variant="outline" size="sm" disabled={isWithdrawing} onClick={onWithdraw}>
            Withdraw
          </Button>
        ) : null}
      </div>
    </li>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

const ACTIVITY_TYPES = new Set(["OPPORTUNITY_APPLICATION", "APPLICATION_STATUS_CHANGE"]);

function isApplicationActivity(notification: AppNotification): boolean {
  return ACTIVITY_TYPES.has(notification.type);
}

function RecentApplicationActivityCard() {
  const { data, isLoading } = useGetNotificationsQuery();

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;

  const activity = (data?.items ?? []).filter(isApplicationActivity).slice(0, 5);
  if (activity.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      <ul className="mt-4 space-y-4">
        {activity.map((notification) => (
          <li key={notification.id} className="text-sm">
            <p className="font-medium text-foreground">{notification.message}</p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
