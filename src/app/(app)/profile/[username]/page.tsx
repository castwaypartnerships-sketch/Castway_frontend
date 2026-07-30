"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Camera,
  Eye,
  FileCheck,
  GraduationCap,
  Globe,
  ImageIcon,
  MapPin,
  Pencil,
  Plus,
  Share2,
  ShieldCheck,
  Star,
  Users,
  Video,
} from "lucide-react";

import { useGetPublicProfileQuery } from "@/lib/redux/endpoints/search-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useSendConnectionRequestMutation } from "@/lib/redux/endpoints/connections-api";
import { useStartConversationMutation } from "@/lib/redux/endpoints/messages-api";
import { useEndorseSkillMutation } from "@/lib/redux/endpoints/endorsements-api";
import { useGetRepresentingAgenciesQuery, useSetPubliclyListedMutation } from "@/lib/redux/endpoints/roster-api";
import { useToggleFollowMutation } from "@/lib/redux/endpoints/follow-api";
import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";
import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import { useGetMyApplicationsQuery } from "@/lib/redux/endpoints/applications-api";
import { useGetReviewsForUserQuery } from "@/lib/redux/endpoints/reviews-api";
import type { DateRange, Education, Experience } from "@/lib/types/profile";
import type { RosterEntryDto } from "@/lib/types/roster";
import { canApplyToOpportunity } from "@/lib/rbac";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrustBadge } from "@/components/profile/trust-badge";
import { ResponseTimeBadge } from "@/components/profile/response-time-badge";
import { ProfileCompletionCard } from "@/components/feed/profile-completion-card";
import { SuggestedConnectionsCard } from "@/components/feed/suggested-connections-card";
import { Switch } from "@/components/ui/switch";
import { initialsFromName, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

function formatMonthYear(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

const TAB_TRIGGER_CLASS =
  "rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-muted-foreground shadow-sm data-active:border-transparent data-active:bg-[#1c3322] data-active:text-white data-active:shadow-sm dark:data-active:bg-[#25422d]";

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const { data, isLoading, isError } = useGetPublicProfileQuery(username);
  const { data: session } = useGetSessionQuery();
  const [sendRequest, { isLoading: isConnecting, isSuccess: connected }] =
    useSendConnectionRequestMutation();
  const [startConversation, { isLoading: isMessaging }] = useStartConversationMutation();
  const [endorseSkill, { isLoading: isEndorsing }] = useEndorseSkillMutation();
  const [toggleFollow, { isLoading: isTogglingFollow }] = useToggleFollowMutation();
  const { data: representingAgencies } = useGetRepresentingAgenciesQuery(data?.profile.userId ?? "", {
    skip: !data,
  });

  const isOwnProfile = session?.user?.id === data?.profile.userId;
  const { data: dashboard } = useGetDashboardQuery(undefined, { skip: !isOwnProfile });
  const { data: ownProfile } = useGetOwnProfileQuery(undefined, { skip: !isOwnProfile });
  const canApply = canApplyToOpportunity(session?.user?.role);
  const { data: myApplications } = useGetMyApplicationsQuery(undefined, { skip: !isOwnProfile || !canApply });
  const { data: reviewsData } = useGetReviewsForUserQuery(data?.profile.userId ?? "", { skip: !data });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-6 py-6">
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-muted" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-6">
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          This profile doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const {
    profile,
    isVerified,
    trustScore,
    reviewSummary,
    responseTime,
    openOpportunities,
    availability,
    endorsementCounts,
    followerCount,
    followingCount,
    viewerIsFollowing,
    managedByAgency,
  } = data;

  async function handleMessage() {
    const conversation = await startConversation(profile.userId).unwrap();
    router.push(`/messages?conversationId=${conversation.id}`);
  }

  async function handleShareProfile() {
    const url = `${window.location.origin}/profile/${profile.username}`;
    await navigator.clipboard.writeText(url);
    toast.success("Profile link copied to clipboard");
  }

  const stats: { icon: typeof Users; label: string; value: string | number }[] = [
    { icon: Users, label: "Connections", value: followerCount.toLocaleString() },
  ];
  if (isOwnProfile) {
    if (dashboard) stats.push({ icon: Eye, label: "Portfolio Views", value: dashboard.profileViewsCount.toLocaleString() });
    if (canApply && myApplications) {
      stats.push({ icon: FileCheck, label: "Applications", value: myApplications.items.length });
    }
    if (ownProfile) stats.push({ icon: ShieldCheck, label: "Profile Strength", value: `${ownProfile.completion.percent}%` });
  } else {
    stats.push({ icon: Users, label: "Following", value: followingCount.toLocaleString() });
    stats.push({ icon: Star, label: "Reviews", value: reviewSummary.reviewCount });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-6 py-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div
          className="relative flex h-[200px] items-start justify-end bg-gradient-to-r from-[#1c3322] to-[#111827] p-5"
          style={
            profile.coverImageUrl
              ? { backgroundImage: `url(${profile.coverImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {isOwnProfile ? (
            <Link
              href="/portfolio"
              className="flex items-center gap-1.5 rounded-md border border-white/60 bg-white/20 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm"
            >
              <Pencil className="size-3.5" />
              Edit Cover
            </Link>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 px-8 pb-7">
          <div className="flex items-end justify-between">
            <div className="relative -mt-[60px] size-[120px] shrink-0 rounded-full border-4 border-card">
              <Avatar className="size-full">
                <AvatarImage src={profile.avatarUrl ?? undefined} />
                <AvatarFallback className="text-2xl">{initialsFromName(profile.name)}</AvatarFallback>
              </Avatar>
              {isOwnProfile ? (
                <Link
                  href="/portfolio"
                  aria-label="Edit avatar"
                  className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-2 border-card bg-[#476948] text-white dark:bg-[#1c3322]"
                >
                  <Camera className="size-3.5" />
                </Link>
              ) : null}
            </div>
            <div className="flex gap-2 pt-4">
              <Link
                href={`/media-kit/${profile.username}`}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5")}
              >
                <ImageIcon className="size-4" />
                Media Kit
              </Link>
              <button
                type="button"
                onClick={handleShareProfile}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5")}
              >
                <Share2 className="size-4" />
                Share Profile
              </button>
              {isOwnProfile ? (
                <Link
                  href="/portfolio"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "gap-1.5 bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]",
                  )}
                >
                  <Pencil className="size-4" />
                  Edit Profile
                </Link>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant={viewerIsFollowing ? "outline" : "default"}
                    disabled={isTogglingFollow}
                    className={!viewerIsFollowing ? "bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]" : undefined}
                    onClick={() => toggleFollow({ userId: profile.userId, username: profile.username })}
                  >
                    {viewerIsFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button
                    size="sm"
                    variant={connected ? "outline" : "default"}
                    disabled={isConnecting || connected}
                    className={!connected ? "bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]" : undefined}
                    onClick={() => sendRequest(profile.userId)}
                  >
                    {connected ? "Requested" : isConnecting ? "Requesting…" : "Connect"}
                  </Button>
                  <Button size="sm" variant="outline" disabled={isMessaging} onClick={handleMessage}>
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{profile.name}</h1>
              {isVerified ? <BadgeCheck className="size-5 text-[#476948] dark:text-[#a7d9b5]" /> : null}
              {profile.availableForWork ? (
                <span className="rounded-full bg-[#e6f4ea] px-2.5 py-1 text-xs font-semibold text-[#2d4a35] dark:bg-[#1a261d] dark:text-[#daf0dd]">
                  Open to Work
                </span>
              ) : null}
            </div>
            {profile.headline ? <p className="text-base text-muted-foreground">{profile.headline}</p> : null}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">@{profile.username}</span>
              </span>
              {profile.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {profile.location}
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Joined {formatMonthYear(profile.createdAt)}
              </span>
            </div>
            {managedByAgency ? (
              <p className="text-xs text-muted-foreground">
                Managed by{" "}
                <Link href={`/profile/${managedByAgency.username}`} className="font-medium text-foreground hover:underline">
                  {managedByAgency.name}
                </Link>
              </p>
            ) : null}
            {representingAgencies && representingAgencies.items.length > 0 ? (
              <div className="space-y-1">
                <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                  Represented by{" "}
                  {representingAgencies.items.map((entry, i) => (
                    <span key={entry.id}>
                      {i > 0 ? ", " : ""}
                      <Link
                        href={`/profile/${entry.agency?.username}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {entry.agency?.name}
                      </Link>
                    </span>
                  ))}
                </p>
                {isOwnProfile ? (
                  <div className="space-y-1">
                    {representingAgencies.items.map((entry) => (
                      <PublicListingToggle key={entry.id} entry={entry} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-1 items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#e6f4ea] dark:bg-[#1a261d]">
              <stat.icon className="size-5 text-[#2d4a35] dark:text-[#daf0dd]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TrustBadge isVerified={isVerified} trustScore={trustScore} reviewSummary={reviewSummary} />
        <ResponseTimeBadge responseTime={responseTime} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-auto flex-wrap gap-2 rounded-none bg-transparent p-0">
          <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="portfolio" className={TAB_TRIGGER_CLASS}>
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="experience" className={TAB_TRIGGER_CLASS}>
            Experience
          </TabsTrigger>
          <TabsTrigger value="reviews" className={TAB_TRIGGER_CLASS}>
            Reviews
          </TabsTrigger>
          {profile.rateCardItems.length > 0 || profile.minRate || profile.maxRate ? (
            <TabsTrigger value="rates" className={TAB_TRIGGER_CLASS}>
              Rates
            </TabsTrigger>
          ) : null}
          {profile.caseStudies.length > 0 ? (
            <TabsTrigger value="case-studies" className={TAB_TRIGGER_CLASS}>
              Case Studies
            </TabsTrigger>
          ) : null}
          {openOpportunities.length > 0 ? (
            <TabsTrigger value="opportunities" className={TAB_TRIGGER_CLASS}>
              Opportunities
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-heading text-lg font-bold text-foreground">About</h2>
                {profile.bio ? (
                  <p className="mt-3 text-sm text-muted-foreground">{profile.bio}</p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No bio added yet.</p>
                )}
              </section>

              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-heading text-lg font-bold text-foreground">Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => {
                    const count = endorsementCounts[skill] ?? 0;
                    return (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#a3d1c1] bg-[#e6f4ea] px-3 py-1.5 text-xs font-medium text-[#2d4a35] dark:border-[#25422d] dark:bg-[#1a261d] dark:text-[#daf0dd]"
                      >
                        {skill}
                        {count > 0 ? <span className="opacity-70">· {count}</span> : null}
                        {!isOwnProfile ? (
                          <button
                            type="button"
                            aria-label={`Endorse ${skill}`}
                            disabled={isEndorsing}
                            onClick={() => endorseSkill({ userId: profile.userId, username: profile.username, skill })}
                            className="flex size-4 items-center justify-center rounded-full hover:bg-black/10"
                          >
                            <Plus className="size-3" />
                          </button>
                        ) : null}
                      </span>
                    );
                  })}
                  {isOwnProfile ? (
                    <Link
                      href="/portfolio"
                      className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent"
                    >
                      + Add Skill
                    </Link>
                  ) : null}
                  {profile.skills.length === 0 && !isOwnProfile ? (
                    <p className="text-sm text-muted-foreground">No skills listed yet.</p>
                  ) : null}
                </div>
              </section>

              {profile.subSpecializations.length > 0 ? (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="font-heading text-lg font-bold text-foreground">Niches &amp; Categories</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.subSpecializations.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-[#a3d1c1] bg-[#e6f4ea] px-3 py-1.5 text-xs font-medium text-[#2d4a35] dark:border-[#25422d] dark:bg-[#1a261d] dark:text-[#daf0dd]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) ? (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="font-heading text-lg font-bold text-foreground">Social Links</h2>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {profile.socialLinks.instagram ? (
                      <SocialLinkCard href={profile.socialLinks.instagram} icon={Camera} label="Instagram" />
                    ) : null}
                    {profile.socialLinks.youtube ? (
                      <SocialLinkCard href={profile.socialLinks.youtube} icon={Video} label="YouTube" />
                    ) : null}
                    {profile.socialLinks.linkedin ? (
                      <SocialLinkCard href={profile.socialLinks.linkedin} icon={Briefcase} label="LinkedIn" />
                    ) : null}
                    {profile.socialLinks.website ? (
                      <SocialLinkCard href={profile.socialLinks.website} icon={Globe} label="Website" />
                    ) : null}
                  </div>
                </section>
              ) : null}

              {profile.availableForWork ? (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-bold text-foreground">Availability</h2>
                    <Badge variant={availability.isAvailableNow ? "default" : "outline"} className={availability.isAvailableNow ? "bg-[#476948] dark:bg-[#1c3322]" : undefined}>
                      {availability.isAvailableNow
                        ? "Available now"
                        : availability.nextAvailableDate
                          ? `Booked until ${new Date(availability.nextAvailableDate).toLocaleDateString()}`
                          : "Available now"}
                    </Badge>
                  </div>
                  <AvailabilityCalendar ranges={profile.unavailableRanges} />
                </section>
              ) : null}
            </div>

            <div className="space-y-5">
              {isOwnProfile ? <ProfileCompletionCard /> : null}
              <SuggestedConnectionsCard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-5">
          {profile.portfolioItems.length > 0 || isOwnProfile ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {profile.portfolioItems.map((item) => (
                <a
                  key={item.id}
                  href={item.link ?? undefined}
                  target={item.link ? "_blank" : undefined}
                  rel={item.link ? "noreferrer" : undefined}
                  className="group overflow-hidden rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div
                    role="img"
                    aria-label={item.title}
                    className="aspect-video w-full rounded-lg bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  />
                  <div className="mt-3 space-y-2">
                    <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                    {item.metrics && item.metrics.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.metrics.map((metric) => (
                          <span
                            key={metric.label}
                            className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {metric.value} {metric.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </a>
              ))}
              {isOwnProfile ? (
                <Link
                  href="/portfolio"
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#a3d1c1] bg-[#e6f4ea] p-4 text-center dark:border-[#25422d] dark:bg-[#1a261d]"
                >
                  <div className="flex size-11 items-center justify-center rounded-full border border-[#a3d1c1] bg-card dark:border-[#25422d]">
                    <Plus className="size-5 text-[#476948] dark:text-[#a7d9b5]" />
                  </div>
                  <p className="text-sm font-bold text-[#476948] dark:text-[#a7d9b5]">+ Add Project</p>
                  <p className="text-xs text-muted-foreground">Showcase your latest work to potential partners</p>
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No portfolio items yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="experience" className="mt-5 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-foreground">Work History &amp; Timeline</h2>
              {isOwnProfile ? (
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#a3d1c1] bg-[#e6f4ea] px-3 py-1.5 text-xs font-semibold text-[#2d4a35] dark:border-[#25422d] dark:bg-[#1a261d] dark:text-[#daf0dd]"
                >
                  <Plus className="size-3.5" />
                  Add Experience
                </Link>
              ) : null}
            </div>
            <ExperienceTimeline entries={profile.experience} />
            {profile.experience.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No experience added yet.</p>
            ) : null}
          </div>
          <EducationList entries={profile.education} />
        </TabsContent>

        <TabsContent value="reviews" className="mt-5 space-y-4">
          {!reviewsData || reviewsData.items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No reviews yet.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
                  <Star className="size-5 fill-[#fbbf24] text-[#fbbf24]" />
                  {reviewsData.summary.averageRating?.toFixed(1) ?? "—"}
                </div>
                <p className="text-sm text-muted-foreground">
                  {reviewsData.summary.reviewCount} review{reviewsData.summary.reviewCount === 1 ? "" : "s"}
                </p>
              </div>
              <ul className="space-y-3">
                {reviewsData.items.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/profile/${review.reviewer.username}`} className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarImage src={review.reviewer.avatarUrl ?? undefined} />
                          <AvatarFallback>{initialsFromName(review.reviewer.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-foreground hover:underline">{review.reviewer.name}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "size-3.5",
                              i < review.rating ? "fill-[#fbbf24] text-[#fbbf24]" : "text-muted-foreground/30",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment ? <p className="mt-3 text-sm text-foreground">{review.comment}</p> : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </TabsContent>

        {profile.rateCardItems.length > 0 || profile.minRate || profile.maxRate ? (
          <TabsContent value="rates" className="mt-5 space-y-3">
            {profile.minRate || profile.maxRate ? (
              <p className="text-sm text-muted-foreground">
                Typical range:{" "}
                <span className="font-medium text-foreground">
                  {profile.minRate ? `$${profile.minRate}` : "Up to"}
                  {profile.minRate && profile.maxRate ? " – " : ""}
                  {profile.maxRate ? `$${profile.maxRate}` : "+"}
                </span>
              </p>
            ) : null}
            <ul className="space-y-2">
              {profile.rateCardItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <span className="text-sm text-foreground">{item.deliverableType}</span>
                  <span className="text-sm font-medium text-foreground">{item.price}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
        ) : null}

        {profile.caseStudies.length > 0 ? (
          <TabsContent value="case-studies" className="mt-5 space-y-3">
            {profile.caseStudies.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <div className="mt-2 space-y-2 text-sm text-foreground">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Brief</p>
                    <p>{item.brief}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Action</p>
                    <p>{item.action}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Result</p>
                    <p>{item.result}</p>
                  </div>
                </div>
                {item.metrics.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.metrics.map((metric) => (
                      <span
                        key={metric.label}
                        className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {metric.value} {metric.label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </TabsContent>
        ) : null}

        {openOpportunities.length > 0 ? (
          <TabsContent value="opportunities" className="mt-5 space-y-3">
            {openOpportunities.map((opportunity) => (
              <Link
                key={opportunity.id}
                href={`/opportunities/${opportunity.id}`}
                className="block rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-sm font-medium text-foreground">{opportunity.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{opportunity.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {opportunity.category ? <Badge variant="outline">{opportunity.category}</Badge> : null}
                  {opportunity.budget ? (
                    <span className="text-xs font-medium text-[#476948] dark:text-[#a7d9b5]">{opportunity.budget}</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}

function SocialLinkCard({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Camera;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex w-[220px] items-center gap-3 rounded-lg bg-muted/50 p-3 hover:bg-muted"
    >
      <div className="flex size-8 items-center justify-center rounded-md border border-border bg-card">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold text-foreground">{href.replace(/^https?:\/\//, "")}</p>
      </div>
    </a>
  );
}

/** Availability calendar viewer display — shared CREATOR + FREELANCER, not
 * role-gated: the underlying toggle/data has always been symmetric
 * TALENT_ROLES infrastructure, so restricting only the display to one role
 * would be an inconsistency rather than correct scoping. */
function AvailabilityCalendar({ ranges }: { ranges: DateRange[] }) {
  const upcoming = ranges
    .filter((range) => new Date(range.end) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (upcoming.length === 0) return null;

  return (
    <ul className="mt-3 space-y-1.5">
      {upcoming.map((range) => (
        <li key={range.id} className="text-xs text-muted-foreground">
          Booked {new Date(range.start).toLocaleDateString()} – {new Date(range.end).toLocaleDateString()}
          {range.note ? ` · ${range.note}` : ""}
        </li>
      ))}
    </ul>
  );
}

/** Roster-as-a-Catalog opt-in — shown only to the represented member
 * viewing their own profile, one toggle per representing agency (each
 * `RosterEntry` is scoped to a single agency, so listing is per-agency too). */
function PublicListingToggle({ entry }: { entry: RosterEntryDto }) {
  const [setPubliclyListed, { isLoading }] = useSetPubliclyListedMutation();

  return (
    <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <Switch
        checked={entry.publiclyListed}
        disabled={isLoading}
        onCheckedChange={(checked) => setPubliclyListed({ id: entry.id, publiclyListed: checked })}
      />
      Show in {entry.agency?.name ?? "their"} public roster
    </label>
  );
}

function ExperienceTimeline({ entries }: { entries: Experience[] }) {
  if (entries.length === 0) return null;
  return (
    <ul className="mt-6 space-y-6">
      {entries.map((entry, index) => (
        <li key={entry.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="size-2.5 shrink-0 rounded-full bg-[#476948] dark:bg-[#1c3322]" />
            {index < entries.length - 1 ? <div className="mt-1 w-px flex-1 bg-border" /> : null}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-sm font-bold text-foreground">{entry.title}</p>
            <p className="text-xs text-muted-foreground">
              {entry.company} · {formatMonthYear(entry.startDate)}
              {" – "}
              {entry.current ? "Present" : entry.endDate ? formatMonthYear(entry.endDate) : "Present"}
            </p>
            {entry.description ? (
              <p className="mt-1.5 text-sm text-muted-foreground">{entry.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function EducationList({ entries }: { entries: Education[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="flex items-center gap-1.5 font-heading text-lg font-bold text-foreground">
        <GraduationCap className="size-4" />
        Education
      </h2>
      <ul className="mt-4 space-y-3">
        {entries.map((entry) => (
          <li key={entry.id}>
            <p className="text-sm font-semibold text-foreground">{entry.school}</p>
            {entry.degree || entry.fieldOfStudy ? (
              <p className="text-xs text-muted-foreground">
                {[entry.degree, entry.fieldOfStudy].filter(Boolean).join(", ")}
              </p>
            ) : null}
            {entry.startDate ? (
              <p className="text-xs text-muted-foreground">
                {formatMonthYear(entry.startDate)}
                {entry.endDate ? ` – ${formatMonthYear(entry.endDate)}` : ""}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
