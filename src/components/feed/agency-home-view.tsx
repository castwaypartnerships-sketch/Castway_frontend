"use client";

import { useState } from "react";
import Link from "next/link";
import { Megaphone, Target, Volume2, Users, Image as ImageIcon, Check } from "lucide-react";

import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import { useGetMyRosterQuery } from "@/lib/redux/endpoints/roster-api";
import { useGetTeamMembersQuery } from "@/lib/redux/endpoints/team-api";
import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";
import { useGetRosterApplicationsQuery } from "@/lib/redux/endpoints/applications-api";
import { useGetClientBrandsQuery } from "@/lib/redux/endpoints/brand-agency-api";
import { useComposer } from "@/components/feed/composer-context";
import { FeedView } from "@/app/(app)/home/feed-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CircularProgress } from "@/components/ui/circular-progress";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeTime, initialsFromName } from "@/lib/format";

type FeedTab = "for-you" | "roster" | "campaigns" | "apps" | "team";

export function AgencyHomeView() {
  const [activeTab, setActiveTab] = useState<FeedTab>("for-you");
  const { openComposer } = useComposer();

  // Fetch backend queries
  const { data: ownProfile, isLoading: isProfileLoading } = useGetOwnProfileQuery();
  const { data: roster, isLoading: isRosterLoading } = useGetMyRosterQuery();
  const { data: managers, isLoading: isManagersLoading } = useGetTeamMembersQuery();
  const { data: dashboard, isLoading: isDashboardLoading } = useGetDashboardQuery();
  const { data: rosterApplications } = useGetRosterApplicationsQuery();
  const { data: clientBrands } = useGetClientBrandsQuery();

  if (isProfileLoading || isRosterLoading || isManagersLoading || isDashboardLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  // Fallback defaults or calculated dynamic values
  const agencyName = ownProfile?.profile?.name ?? "Talent Agency";
  const avatarUrl = ownProfile?.profile?.avatarUrl;
  const isVerified = ownProfile?.isVerified ?? false;

  // Stats values — real counts only; a genuine 0 (e.g. a brand-new agency
  // with no roster yet) must render as 0, not a fabricated round number.
  const activeTalentCount = roster?.items?.filter((i) => i.status === "ACCEPTED").length ?? 0;
  const openCampaignsCount = dashboard && "activeOpportunitiesCount" in dashboard ? dashboard.activeOpportunitiesCount : 0;
  const newAppsCount = dashboard && "totalApplicantsCount" in dashboard ? dashboard.totalApplicantsCount : 0;
  const teamMembersCount = managers?.items?.length ?? 0;
  const profileStrengthPercent = ownProfile?.completion?.percent ?? 0;
  const acceptedClientBrands = (clientBrands?.items ?? []).filter((link) => link.status === "ACCEPTED" && link.brand);
  const recentApplications = rosterApplications?.items ?? [];

  // Profile Checklist calculations
  const hasLogo = Boolean(avatarUrl);
  const hasTeam = Boolean(managers?.items && managers.items.length > 0);
  const hasCaseStudies = Boolean(ownProfile?.profile?.caseStudies && ownProfile.profile.caseStudies.length > 0);
  const hasVerification = isVerified;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[1fr_320px]">
      
      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* Top Greeting Header */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {greeting}, {agencyName}!
        </h1>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          {/* Active Talent */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Talent</p>
            <div className="mt-2">
              <span className="font-mono text-2xl font-bold text-foreground">{activeTalentCount}</span>
            </div>
          </div>

          {/* Open Campaigns */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Open Campaigns</p>
            <div className="mt-2">
              <span className="font-mono text-2xl font-bold text-foreground">{openCampaignsCount}</span>
            </div>
          </div>

          {/* New Apps */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Apps</p>
            <div className="mt-2">
              <span className="font-mono text-2xl font-bold text-foreground">{newAppsCount}</span>
            </div>
          </div>

          {/* Team Members */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Members</p>
            <div className="mt-2">
              <span className="font-mono text-2xl font-bold text-foreground">{teamMembersCount}</span>
            </div>
          </div>

          {/* Profile Strength */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile Strength</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold text-foreground">{profileStrengthPercent}%</span>
            </div>
          </div>
        </div>

        {/* Post/Campaign Creation Bar */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback>{initialsFromName(agencyName)}</AvatarFallback>
            </Avatar>
            <button
              onClick={openComposer}
              className="flex-1 text-left rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Post a campaign or opportunity...
            </button>
            <button
              onClick={openComposer}
              className={cn(
                buttonVariants({ size: "default" }),
                "bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d] font-semibold"
              )}
            >
              + New Campaign
            </button>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
            <button
              onClick={openComposer}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Megaphone className="size-3.5 text-[#476948] dark:text-[#a7d9b5]" />
              Campaign
            </button>
            <button
              onClick={openComposer}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Target className="size-3.5 text-[#476948] dark:text-[#a7d9b5]" />
              Opportunity
            </button>
            <button
              onClick={openComposer}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Volume2 className="size-3.5 text-[#476948] dark:text-[#a7d9b5]" />
              Announcement
            </button>
            <button
              onClick={openComposer}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Users className="size-3.5 text-[#476948] dark:text-[#a7d9b5]" />
              Hiring Talent
            </button>
            <button
              onClick={openComposer}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <ImageIcon className="size-3.5 text-[#476948] dark:text-[#a7d9b5]" />
              Media
            </button>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="flex items-center justify-between border-b border-border/80 pb-1">
          <div className="flex gap-6">
            {(
              [
                { id: "for-you", label: "For You" },
                { id: "roster", label: "Roster Activity" },
                { id: "campaigns", label: "Campaigns" },
                { id: "apps", label: "Applications" },
                { id: "team", label: "Team Updates" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3 text-sm font-semibold border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-[#476948] text-foreground dark:border-[#a7d9b5]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/45 transition-colors">
            <span>Filter</span>
          </button>
        </div>

        {/* Dynamic Feed List */}
        <div className="space-y-5">
          {/* Real post feed — same data every other role sees on Home, previously
              missing entirely for agencies since this view replaced <FeedView />
              outright instead of including it. */}
          {activeTab === "for-you" && <FeedView />}

          {/* Campaigns (client campaign management is per-client — see
              /campaigns/clients — there's no single feed of "all clients'
              campaigns" to summarize here, so this links out instead of
              fabricating a campaign that doesn't exist). */}
          {(activeTab === "for-you" || activeTab === "campaigns") && (
            <article className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-foreground">Client campaigns</h3>
              {acceptedClientBrands.length === 0 ? (
                <p className="text-xs text-muted-foreground">No linked clients yet.</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {acceptedClientBrands.length} linked {acceptedClientBrands.length === 1 ? "client" : "clients"}.
                </p>
              )}
              <Link
                href="/campaigns/clients"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs font-semibold")}
              >
                Manage campaigns
              </Link>
            </article>
          )}

          {/* Roster Activity — no per-talent activity feed exists yet, so
              this links to the real roster instead of fabricating a post. */}
          {(activeTab === "for-you" || activeTab === "roster") && (
            <article className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-foreground">Roster</h3>
              <p className="text-xs text-muted-foreground">
                {activeTalentCount} active {activeTalentCount === 1 ? "talent" : "talent members"}.
              </p>
              <Link
                href="/roster"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs font-semibold")}
              >
                View roster
              </Link>
            </article>
          )}

          {/* Applications — real most-recent roster application. */}
          {(activeTab === "for-you" || activeTab === "apps") &&
            (recentApplications.length === 0 ? (
              <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-xs text-muted-foreground">No applications yet.</p>
              </article>
            ) : (
              <article className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage src={recentApplications[0].applicant.avatarUrl ?? undefined} />
                    <AvatarFallback>{initialsFromName(recentApplications[0].applicant.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-bold">{recentApplications[0].applicant.name}</span> applied to{" "}
                      <span className="font-bold">{recentApplications[0].opportunity.title}</span>
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      {formatRelativeTime(recentApplications[0].createdAt)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/opportunities/${recentApplications[0].opportunityId}`}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d] font-semibold text-xs whitespace-nowrap self-end sm:self-auto"
                  )}
                >
                  Review Application
                </Link>
              </article>
            ))}

          {/* Team Updates — no shortlist activity feed exists yet. */}
          {(activeTab === "for-you" || activeTab === "team") && (
            <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-xs text-muted-foreground">No recent team activity.</p>
            </article>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        
        {/* Complete Company Profile widget */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <CircularProgress percent={profileStrengthPercent} size={56} strokeWidth={5}>
              <span className="text-sm font-bold text-foreground">{profileStrengthPercent}%</span>
            </CircularProgress>
            <div>
              <h3 className="text-sm font-bold text-foreground">Complete your Company Profile</h3>
              <p className="text-[11px] text-muted-foreground font-medium leading-tight mt-1">
                Verified agency profiles get 2x more client invitations.
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 pt-1">
            <li className="flex items-center gap-2.5 text-xs font-medium text-foreground">
              <span className={cn("flex size-4 items-center justify-center rounded-full border", hasLogo ? "bg-success border-success text-white" : "border-muted-foreground/35")}>
                {hasLogo && <Check className="size-2.5 stroke-[3]" />}
              </span>
              <span className={cn(hasLogo && "text-muted-foreground line-through")}>Upload company logo</span>
            </li>
            <li className="flex items-center gap-2.5 text-xs font-medium text-foreground">
              <span className={cn("flex size-4 items-center justify-center rounded-full border", hasTeam ? "bg-success border-success text-white" : "border-muted-foreground/35")}>
                {hasTeam && <Check className="size-2.5 stroke-[3]" />}
              </span>
              <span className={cn(hasTeam && "text-muted-foreground line-through")}>Add team members</span>
            </li>
            <li className="flex items-center gap-2.5 text-xs font-medium text-foreground">
              <span className={cn("flex size-4 items-center justify-center rounded-full border", hasCaseStudies ? "bg-success border-success text-white" : "border-muted-foreground/35")}>
                {hasCaseStudies && <Check className="size-2.5 stroke-[3]" />}
              </span>
              <span className={cn(hasCaseStudies && "text-muted-foreground line-through")}>Add case studies</span>
            </li>
            <li className="flex items-center gap-2.5 text-xs font-medium text-foreground">
              <span className={cn("flex size-4 items-center justify-center rounded-full border", hasVerification ? "bg-success border-success text-white" : "border-muted-foreground/35")}>
                {hasVerification && <Check className="size-2.5 stroke-[3]" />}
              </span>
              <span className={cn(hasVerification && "text-muted-foreground line-through")}>Verify company registration</span>
            </li>
          </ul>

          <Link
            href="/profile/edit"
            className={cn(
              buttonVariants({ size: "sm" }),
              "w-full bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d] font-semibold text-xs mt-2"
            )}
          >
            Improve Profile
          </Link>
        </section>

        {/* Your Team block */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Team</h4>
            <Link href="/settings" className="text-[10px] font-bold text-muted-foreground hover:text-foreground">
              MANAGE
            </Link>
          </div>

          <div className="space-y-3">
            {managers && managers.items.length > 0 ? (
              <>
                {managers.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback className="text-[10px]">{initialsFromName(item.name || "?")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-foreground">{item.name || item.email}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Team Member</p>
                    </div>
                  </div>
                ))}
                {managers.items.length > 2 && (
                  <div className="flex items-center gap-2 pl-1.5 pt-1">
                    <div className="flex -space-x-1.5">
                      {managers.items.slice(2, 4).map((item) => (
                        <div
                          key={item.id}
                          className="size-5 rounded-full border border-card bg-muted flex items-center justify-center text-[7px] text-muted-foreground"
                        >
                          {initialsFromName(item.name || "?").charAt(0)}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      +{managers.items.length - 2} more members
                    </span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No team members yet.</p>
            )}
          </div>
        </section>

        {/* Top Roster Talent block */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Roster Talent</h4>
            <Link href="/roster" className="text-[10px] font-bold text-muted-foreground hover:text-foreground">
              VIEW ROSTER
            </Link>
          </div>

          <div className="space-y-3">
            {roster && roster.items.length > 0 ? (
              roster.items.slice(0, 2).map((item) => {
                const name = item.member?.name || "Roster Member";
                return (
                  <div key={item.id} className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar size="sm">
                        <AvatarImage src={item.member?.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-[10px]">{initialsFromName(name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-foreground">{name}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">No roster talent yet.</p>
            )}
          </div>
        </section>

        {/* Recent Applicants block */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent Applicants</h4>
          {recentApplications.length === 0 ? (
            <p className="text-[10px] text-muted-foreground font-medium leading-tight">No applications yet.</p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {recentApplications.slice(0, 3).map((application) => (
                    <Avatar key={application.id} className="size-6 border-2 border-card">
                      <AvatarImage src={application.applicant.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-[8px]">
                        {initialsFromName(application.applicant.name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {recentApplications.length > 3 && (
                    <div className="size-6 rounded-full border border-card bg-muted flex items-center justify-center text-[7px] text-muted-foreground font-bold">
                      +{recentApplications.length - 3}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium leading-tight">
                {recentApplications.length} talent {recentApplications.length === 1 ? "application" : "applications"} to review.
              </p>
            </>
          )}
        </section>
      </aside>
    </div>
  );
}
