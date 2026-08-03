"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
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
  TrendingUp,
  Users,
  Video,
  AlertCircle,
  Compass,
  StarHalf,
  Award,
  FileText,
  Heart,
  MessageCircle,
  Rss,
} from "lucide-react";
import { FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa6";
import { motion } from "framer-motion";

import { useGetPublicProfileQuery } from "@/lib/redux/endpoints/search-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useSendConnectionRequestMutation } from "@/lib/redux/endpoints/connections-api";
import { useStartConversationMutation } from "@/lib/redux/endpoints/messages-api";
import { useEndorseSkillMutation } from "@/lib/redux/endpoints/endorsements-api";
import { useGetRepresentingAgenciesQuery, useSetPubliclyListedMutation, useGetMyRosterQuery } from "@/lib/redux/endpoints/roster-api";
import { useToggleFollowMutation } from "@/lib/redux/endpoints/follow-api";
import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";
import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import { useGetMyApplicationsQuery } from "@/lib/redux/endpoints/applications-api";
import { useGetReviewsForUserQuery } from "@/lib/redux/endpoints/reviews-api";
import { useGetClientCampaignsQuery } from "@/lib/redux/endpoints/campaigns-api";
import type { DateRange, Education, Experience, Profile } from "@/lib/types/profile";
import type { RosterEntryDto } from "@/lib/types/roster";
import { canApplyToOpportunity } from "@/lib/rbac";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ProfileCompletionCard } from "@/components/feed/profile-completion-card";
import { initialsFromName, formatRelativeTime } from "@/lib/format";
import { isImageUrl } from "@/lib/upload-image";
import { cn } from "@/lib/utils";

// Import visual placeholders
import {
  MOCK_PROFILE_STATS,
  MOCK_COMPANY_ABOUT,
  MOCK_SPECIALTIES,
  MOCK_INDUSTRIES_SERVED,
  MOCK_PROFILE_STRENGTH_ITEMS,
  MOCK_COMPANY_INFO,
  MOCK_SOCIAL_PRESENCE,
  MOCK_PUBLIC_ROSTER,
  MOCK_SIMILAR_AGENCIES,
  MOCK_CASE_STUDIES,
  MOCK_REVIEWS_SUMMARY,
  MOCK_REVIEWS_LIST,
} from "@/lib/mocks/profile-data";
import { MOCK_LISTED_CAMPAIGNS } from "@/lib/mocks/campaigns-data";

function formatMonthYear(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatRole(role?: string): string {
  if (!role) return "";
  const r = role.toUpperCase();
  if (r === "CREATOR") return "Creator";
  if (r === "FREELANCER") return "Freelancer";
  if (r === "BRAND" || r === "BRAND_TEAM_MEMBER") return "Brand";
  if (r === "AGENCY" || r === "AGENCY_MANAGER") return "Agency";
  return role;
}

const TAB_TRIGGER_CLASS =
  "rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-muted-foreground shadow-sm data-[state=active]:border-transparent data-[state=active]:bg-[#1c3322] data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#25422d]";

const NEW_TAB_TRIGGER_CLASS =
  "relative py-3.5 px-4 text-sm font-normal text-muted-foreground data-[state=active]:text-[#1F5F3F] data-[state=active]:font-medium bg-transparent border-0 shadow-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 select-none cursor-pointer data-active:bg-transparent data-active:border-transparent data-active:shadow-none dark:data-active:bg-transparent dark:data-active:border-transparent after:hidden";

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { data, isLoading, isError } = useGetPublicProfileQuery(username);
  const { data: session } = useGetSessionQuery();

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

  const isOwnProfile = session?.user?.id === data.profile.userId;
  const isOwnAgency = isOwnProfile && (session?.user?.role === "AGENCY" || session?.user?.role === "AGENCY_MANAGER");
  const isAgencyProfile = isOwnAgency || data.profile.agencySize !== null;

  if (isAgencyProfile) {
    return <AgencyProfileView profileData={data} isOwnProfile={isOwnProfile} />;
  }

  return <StandardProfileView profileData={data} isOwnProfile={isOwnProfile} />;
}

/* ==========================================================================
   AGENCY PROFILE DASHBOARD VIEW (Redesigned Layout with Tabs & Warnings)
   ========================================================================== */
function AgencyProfileView({
  profileData,
  isOwnProfile,
}: {
  profileData: NonNullable<ReturnType<typeof useGetPublicProfileQuery>["data"]>;
  isOwnProfile: boolean;
}) {
  const router = useRouter();
  const { profile, isVerified, role } = profileData;

  const { data: session } = useGetSessionQuery();
  const { data: roster } = useGetMyRosterQuery(undefined, { skip: !isOwnProfile });
  const [sendRequest, { isLoading: isConnecting, isSuccess: connected }] = useSendConnectionRequestMutation();
  const [startConversation, { isLoading: isMessaging }] = useStartConversationMutation();
  const [toggleFollow, { isLoading: isTogglingFollow }] = useToggleFollowMutation();

  const [activeTab, setActiveTab] = useState("overview");

  async function handleMessage() {
    const conversation = await startConversation(profile.userId).unwrap();
    router.push(`/messages?conversationId=${conversation.id}`);
  }

  async function handleShareProfile() {
    const url = `${window.location.origin}/profile/${profile.username}`;
    await navigator.clipboard.writeText(url);
    toast.success("Profile link copied to clipboard");
  }

  // --------------------------------------------------------------------------
  // Header Stats Selection
  // --------------------------------------------------------------------------
  const getHeaderStats = () => {
    // Roster count
    let rosterSizeText = MOCK_PROFILE_STATS[0].value;
    if (isOwnProfile && roster?.items) {
      const acceptedCount = roster.items.filter((r) => r.status === "ACCEPTED").length;
      rosterSizeText = `${acceptedCount} Talent`;
    }

    return [
      { label: "Roster Size", value: rosterSizeText },
      { label: "Active Campaigns", value: MOCK_PROFILE_STATS[1].value },
      { label: "Client Satisfaction", value: MOCK_PROFILE_STATS[2].value, showStars: true },
      { label: "Years on Castway", value: MOCK_PROFILE_STATS[3].value },
    ];
  };

  const headerStatsList = getHeaderStats();

  // --------------------------------------------------------------------------
  // specialties / industries checks
  // --------------------------------------------------------------------------
  const hasRealBio = !!profile.bio;
  const specialties = profile.skills.length > 0 ? profile.skills : MOCK_SPECIALTIES;
  const hasRealSpecialties = profile.skills.length > 0;

  const industries = profile.subSpecializations.length > 0 ? profile.subSpecializations : MOCK_INDUSTRIES_SERVED;
  const hasRealIndustries = profile.subSpecializations.length > 0;

  // --------------------------------------------------------------------------
  // Roster Tab Filtering (Separation Rule)
  // --------------------------------------------------------------------------
  const getPublicRosterItems = () => {
    if (isOwnProfile && roster?.items) {
      const acceptedPublic = roster.items.filter((r) => r.status === "ACCEPTED" && r.publiclyListed && r.member);
      return acceptedPublic.map((entry) => ({
        id: entry.id,
        name: entry.member!.name,
        niche: "Represented Talent",
        imageUrl: entry.member?.avatarUrl ?? "",
        followerStats: [
          { platform: "instagram" as const, count: "10K" },
        ],
      }));
    }
    return [];
  };

  const realPublicRoster = getPublicRosterItems();
  const showMockRoster = realPublicRoster.length === 0;
  const displayRoster = showMockRoster ? MOCK_PUBLIC_ROSTER : realPublicRoster;

  // --------------------------------------------------------------------------
  // Case Studies filtering
  // --------------------------------------------------------------------------
  const hasRealCaseStudies = profile.caseStudies && profile.caseStudies.length > 0;
  const displayCaseStudies = hasRealCaseStudies ? profile.caseStudies : MOCK_CASE_STUDIES;

  // --------------------------------------------------------------------------
  // Campaigns list checks
  // --------------------------------------------------------------------------
  const showMockCampaigns = true; // Wait: Profile campaign showcase is visual mockup for profile page
  const displayCampaigns = MOCK_LISTED_CAMPAIGNS;

  // --------------------------------------------------------------------------
  // Reviews filtering
  // --------------------------------------------------------------------------
  const { data: realReviews } = useGetReviewsForUserQuery(profile.userId);
  const hasRealReviews = realReviews && realReviews.items.length > 0;

  const getReviewsSummary = () => {
    if (hasRealReviews && realReviews) {
      const count = realReviews.summary.reviewCount;
      const avg = realReviews.summary.averageRating ?? 0;
      return {
        averageRating: avg,
        reviewCount: count,
        distribution: [
          { stars: 5, percentage: avg >= 4.5 ? 90 : 50 },
          { stars: 4, percentage: avg >= 3.5 ? 10 : 30 },
          { stars: 3, percentage: 0 },
          { stars: 2, percentage: 0 },
          { stars: 1, percentage: 0 },
        ],
      };
    }
    return MOCK_REVIEWS_SUMMARY;
  };

  const getReviewsList = () => {
    if (hasRealReviews && realReviews) {
      return realReviews.items.map((rev) => ({
        id: rev.id,
        name: rev.reviewer.name,
        avatarUrl: rev.reviewer.avatarUrl ?? undefined,
        rating: rev.rating,
        campaignTag: "COMPLETED CAMPAIGN",
        timeAgo: formatRelativeTime(rev.createdAt),
        comment: rev.comment ?? "",
        helpfulCount: 0,
      }));
    }
    return MOCK_REVIEWS_LIST;
  };

  const reviewsSummary = getReviewsSummary();
  const reviewsList = getReviewsList();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      {/* Banner / Cover and Profile Identity Block */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div
          className="relative flex h-[220px] items-start justify-end bg-gradient-to-r from-[#1c3322] to-[#111827] p-5"
          style={
            profile.coverImageUrl
              ? { backgroundImage: `url(${profile.coverImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {isOwnProfile ? (
            <Link
              href="/profile/edit"
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
                  href="/profile/edit"
                  aria-label="Edit avatar"
                  className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-2 border-card bg-[#476948] text-white dark:bg-[#1c3322]"
                >
                  <Camera className="size-3.5" />
                </Link>
              ) : null}
            </div>
            
            {/* Header Profile Controls */}
            <div className="flex flex-wrap gap-2 pt-4">
              <button
                type="button"
                onClick={handleShareProfile}
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5 text-xs font-semibold")}
              >
                <Share2 className="size-4" />
                Share Agency
              </button>

              {isOwnProfile ? (
                <Link
                  href="/profile/edit"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "gap-1.5 bg-[#476948] text-white hover:bg-[#3d5a3e] text-xs font-semibold rounded-xl"
                  )}
                >
                  <Pencil className="size-4" />
                  Edit Profile
                </Link>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant={profileData.viewerIsFollowing ? "outline" : "default"}
                    disabled={isTogglingFollow}
                    className={!profileData.viewerIsFollowing ? "bg-[#476948] text-white hover:bg-[#3d5a3e] rounded-xl text-xs font-semibold" : "rounded-xl text-xs font-semibold"}
                    onClick={() => toggleFollow({ userId: profile.userId, username: profile.username })}
                  >
                    {profileData.viewerIsFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button size="sm" variant="outline" disabled={isMessaging} onClick={handleMessage} className="rounded-xl text-xs font-semibold">
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground leading-none">{profile.name}</h1>
              {isVerified ? <BadgeCheck className="size-5 text-[#476948] dark:text-[#a7d9b5]" /> : null}
              {role && (
                <span className="rounded-full border border-[#1F5F3F]/35 bg-[#1F5F3F]/5 px-2.5 py-1 text-xs font-semibold text-[#1F5F3F] dark:border-[#25422d] dark:bg-[#1a261d] dark:text-[#daf0dd]">
                  {formatRole(role)}
                </span>
              )}
            </div>
            {profile.headline ? <p className="text-sm text-muted-foreground leading-normal">{profile.headline}</p> : null}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">@{profile.username}</span>
              {profile.location ? (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {profile.location}
                </span>
              ) : null}
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                Joined {formatMonthYear(profile.createdAt)}
              </span>
            </div>
            {profile.socialLinks && (profile.socialLinks.instagram || profile.socialLinks.youtube || profile.socialLinks.linkedin || profile.socialLinks.website) ? (
              <div className="flex items-center gap-4 pt-2.5" id="agency-social-links">
                {profile.socialLinks.instagram && (
                  <a
                    href={profile.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1F5F3F] transition-colors"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="size-5" />
                  </a>
                )}
                {profile.socialLinks.youtube && (
                  <a
                    href={profile.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1F5F3F] transition-colors"
                    aria-label="YouTube"
                  >
                    <FaYoutube className="size-5" />
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1F5F3F] transition-colors"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin className="size-5" />
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1F5F3F] transition-colors"
                    aria-label="Website"
                  >
                    <Globe className="size-5" />
                  </a>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Header Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {headerStatsList.map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xl font-bold font-mono text-foreground leading-none">{stat.value}</h3>
              {stat.showStars && (
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                  <Star className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                  <Star className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                  <Star className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                  <StarHalf className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tab Switcher and Content Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList variant="line" className="h-auto flex w-full justify-start border-b border-border/60 bg-transparent p-0 gap-1 rounded-none">
          <TabsTrigger value="overview" className={NEW_TAB_TRIGGER_CLASS}>
            <span>Overview</span>
            {activeTab === "overview" && (
              <motion.div
                layoutId="agency-underline"
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-[2px] bg-[#1F5F3F]"
                transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.25 }}
              />
            )}
          </TabsTrigger>
          <TabsTrigger value="roster" className={NEW_TAB_TRIGGER_CLASS}>
            <span>Roster (Public)</span>
            {activeTab === "roster" && (
              <motion.div
                layoutId="agency-underline"
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-[2px] bg-[#1F5F3F]"
                transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.25 }}
              />
            )}
          </TabsTrigger>
          <TabsTrigger value="case-studies" className={NEW_TAB_TRIGGER_CLASS}>
            <span>Case Studies</span>
            {activeTab === "case-studies" && (
              <motion.div
                layoutId="agency-underline"
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-[2px] bg-[#1F5F3F]"
                transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.25 }}
              />
            )}
          </TabsTrigger>
          <TabsTrigger value="campaigns" className={NEW_TAB_TRIGGER_CLASS}>
            <span>Campaigns</span>
            {activeTab === "campaigns" && (
              <motion.div
                layoutId="agency-underline"
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-[2px] bg-[#1F5F3F]"
                transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.25 }}
              />
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews" className={NEW_TAB_TRIGGER_CLASS}>
            <span>Reviews</span>
            {activeTab === "reviews" && (
              <motion.div
                layoutId="agency-underline"
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-[2px] bg-[#1F5F3F]"
                transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.25 }}
              />
            )}
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------------------------------------------
            TAB 1: OVERVIEW
            ------------------------------------------------------------------ */}
        <TabsContent value="overview" className="outline-none mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            
            {/* Left Content Area */}
            <div className="space-y-5">
              
              {/* About Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3 relative">
                {!hasRealBio && (
                  <Badge variant="outline" className="absolute top-4 right-4 text-[9px] font-bold text-amber-600 border-amber-300 bg-amber-50/50 uppercase tracking-wider">
                    Demo About — Add your bio
                  </Badge>
                )}
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">About Company</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {hasRealBio ? profile.bio : MOCK_COMPANY_ABOUT}
                </p>
              </div>

              {/* Specialties Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3.5 relative">
                {!hasRealSpecialties && (
                  <Badge variant="outline" className="absolute top-4 right-4 text-[9px] font-bold text-amber-600 border-amber-300 bg-amber-50/50 uppercase tracking-wider">
                    Demo Specialties — Add your skills
                  </Badge>
                )}
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((item: string) => (
                    <span
                      key={item}
                      className="rounded-lg border border-[#a3d1c1] bg-[#e6f4ea] px-3.5 py-1.5 text-xs font-semibold text-[#2d4a35] dark:border-[#25422d] dark:bg-[#1a261d] dark:text-[#daf0dd]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Industries Served */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3.5 relative">
                {!hasRealIndustries && (
                  <Badge variant="outline" className="absolute top-4 right-4 text-[9px] font-bold text-amber-600 border-amber-300 bg-amber-50/50 uppercase tracking-wider">
                    Demo Industries — Add your niches
                  </Badge>
                )}
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Industries Served</h2>
                <div className="flex flex-wrap gap-2">
                  {industries.map((item: string) => (
                    <span
                      key={item}
                      className="rounded-lg border border-border bg-muted/65 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Sidebar Area */}
            <div className="space-y-5">
              <ProfileStrengthWidget />
              <CompanyInfoWidget profile={profile} />
              <SocialPresenceWidget profile={profile} />
            </div>

          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------
            TAB 2: PUBLIC ROSTER
            ------------------------------------------------------------------ */}
        <TabsContent value="roster" className="outline-none mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            
            {/* Grid Area */}
            <div className="space-y-5">
              {showMockRoster ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs font-medium text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Demonstration Roster</span>
                    <p className="text-[11px] text-amber-700/90 dark:text-amber-400 mt-0.5">
                      No public roster members have opted in yet. Showcasing layout placeholders below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Full roster is private — only opted-in talent shown here.
                </div>
              )}

              {/* Roster Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayRoster.map((talent: any) => (
                  <div key={talent.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                    
                    {/* Visual Photo Block */}
                    <div className="aspect-[4/3] w-full rounded-xl bg-muted overflow-hidden relative border border-border/60">
                      {talent.isTopTier && (
                        <Badge className="absolute top-2.5 left-2.5 bg-yellow-400 text-yellow-950 hover:bg-yellow-400 border-0 text-[8px] font-bold tracking-widest uppercase">
                          Top Tier
                        </Badge>
                      )}
                      {talent.imageUrl ? (
                        <img src={talent.imageUrl} alt={talent.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="size-full flex items-center justify-center font-bold text-muted-foreground/60 text-lg uppercase bg-muted">
                          {initialsFromName(talent.name)}
                        </div>
                      )}
                    </div>

                    {/* Talent Bio Details */}
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-normal">{talent.name}</h4>
                      <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{talent.niche}</p>
                    </div>

                    {/* Social Stats indicators */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {talent.followerStats.map((stat: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                          {stat.platform}: {stat.count}
                        </Badge>
                      ))}
                    </div>

                    <Link
                      href={showMockRoster ? "#" : `/profile/${talent.name.toLowerCase().replace(" ", "")}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full text-xs font-semibold h-8.5 rounded-lg"
                      )}
                    >
                      View Profile
                    </Link>

                  </div>
                ))}
              </div>

            </div>

            {/* Sidebar widgets */}
            <div className="space-y-5">
              <ProfileStrengthWidget />
              <SimilarAgenciesWidget />
            </div>

          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------
            TAB 3: CASE STUDIES
            ------------------------------------------------------------------ */}
        <TabsContent value="case-studies" className="outline-none mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            
            {/* Grid Area */}
            <div className="space-y-5">
              
              {!hasRealCaseStudies && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs font-medium text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Demonstration Case Studies</span>
                    <p className="text-[11px] text-amber-700/90 dark:text-amber-400 mt-0.5">
                      No case studies published yet. Showcasing demo project items below.
                    </p>
                  </div>
                </div>
              )}

              {/* Case Studies Lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Add New Case Study CTA Trigger card */}
                {isOwnProfile && (
                  <button
                    onClick={() => toast.info("Case Studies management is disabled in layout validation.")}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#a3d1c1] bg-[#e6f4ea]/30 p-6 text-center hover:bg-[#e6f4ea]/50 transition-colors min-h-[320px] h-full"
                  >
                    <div className="flex size-11 items-center justify-center rounded-full border border-[#a3d1c1] bg-card shadow-sm">
                      <Plus className="size-5 text-[#476948]" />
                    </div>
                    <p className="text-xs font-bold text-[#476948] uppercase tracking-wider mt-1.5">Add New Case Study</p>
                    <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed mt-0.5">
                      Share your success stories and attract more brand partners.
                    </p>
                  </button>
                )}

                {/* Case Study Cards */}
                {displayCaseStudies.map((study: any) => (
                  <div key={study.id} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    
                    {/* Header Image class */}
                    <div className={cn("aspect-video w-full relative flex items-center justify-center", (study as any).imageClass || "bg-muted")}>
                      <Badge className="absolute top-2.5 left-2.5 bg-[#1c3322] text-white hover:bg-[#1c3322] border-0 text-[8px] font-bold tracking-widest uppercase">
                        {(study as any).statBadge || "Completed"}
                      </Badge>
                      <ImageIcon className="size-8 text-muted-foreground/40" />
                    </div>

                    {/* Meta info */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-[#476948] dark:text-[#a7d9b5] uppercase tracking-wider">
                          {(study as any).category || "Campaign Case Study"}
                        </span>
                        <h4 className="text-sm font-bold text-foreground leading-snug">{study.title}</h4>
                        <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                          {(study as any).brief || (study as any).client || "Campaign Brief details"}
                        </p>
                      </div>

                      <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                        {/* Involved Avatars */}
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {((study as any).talentAvatars || []).map((src: string, i: number) => (
                            <Avatar key={i} size="sm" className="size-6 border-2 border-card">
                              <AvatarFallback className="text-[8px] bg-muted/80">T</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>

                        <button
                          onClick={() => toast.info("Detailed case study reports are disabled in layout validation.")}
                          className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider flex items-center gap-0.5"
                        >
                          Details →
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Sidebar widgets */}
            <div className="space-y-5">
              <ProfileStrengthWidget />
              <SimilarAgenciesWidget />
            </div>

          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------
            TAB 4: CAMPAIGNS
            ------------------------------------------------------------------ */}
        <TabsContent value="campaigns" className="outline-none mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            
            {/* Grid Area */}
            <div className="space-y-5">
              {showMockCampaigns && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs font-medium text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Demonstration Campaigns</span>
                    <p className="text-[11px] text-amber-700/90 dark:text-amber-400 mt-0.5">
                      No client campaigns published on this profile yet. Showcasing demo campaigns list below.
                    </p>
                  </div>
                </div>
              )}

              {/* Brief Cards List */}
              <ul className="space-y-4">
                {displayCampaigns.map((campaign) => (
                  <li key={campaign.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Avatar size="sm" className="size-7 bg-muted border border-border/80">
                          <AvatarFallback className="text-[9px] font-bold">{campaign.logoText}</AvatarFallback>
                        </Avatar>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{campaign.client}</span>
                      </div>
                      <Badge className="text-[9px] font-bold uppercase tracking-wider rounded px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300">
                        {campaign.status}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-foreground leading-snug mt-2">
                      {campaign.title}
                    </h4>

                    {/* Metadata specs */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-xs text-muted-foreground font-semibold">
                      <span>{campaign.budget}</span>
                      <span>•</span>
                      <span>{campaign.category}</span>
                      <span>•</span>
                      <span>{campaign.closesIn}</span>
                    </div>

                  </li>
                ))}
              </ul>

            </div>

            {/* Sidebar widgets */}
            <div className="space-y-5">
              <ProfileStrengthWidget />
              <SimilarAgenciesWidget />
            </div>

          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------
            TAB 5: REVIEWS
            ------------------------------------------------------------------ */}
        <TabsContent value="reviews" className="outline-none mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            
            {/* Grid Area */}
            <div className="space-y-5">
              {!hasRealReviews && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs font-medium text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Demonstration Reviews</span>
                    <p className="text-[11px] text-amber-700/90 dark:text-amber-400 mt-0.5">
                      No client reviews collected yet. Showcasing demo ratings and testimonials below.
                    </p>
                  </div>
                </div>
              )}

              {/* Rating summary cards */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-6 justify-between">
                
                {/* Score */}
                <div className="text-center sm:text-left space-y-1.5 sm:border-r sm:border-border/60 sm:pr-8">
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-3xl font-extrabold text-foreground">
                    <Star className="size-6 fill-[#fbbf24] text-[#fbbf24]" />
                    {reviewsSummary.averageRating.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground font-semibold">Based on {reviewsSummary.reviewCount} client reviews</p>
                  <Button
                    onClick={() => toast.info("Review submissions are disabled in layout validation.")}
                    className="bg-[#476948] hover:bg-[#3d5a3e] text-white text-xs font-semibold rounded-lg h-8 px-4 mt-2"
                  >
                    Leave a Review
                  </Button>
                </div>

                {/* Bars Distribution */}
                <div className="flex-1 max-w-sm space-y-1.5">
                  {reviewsSummary.distribution.map((dist) => (
                    <div key={dist.stars} className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
                      <span className="w-3 text-right">{dist.stars}</span>
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden border border-border/30">
                        <div className="h-full bg-green-700 dark:bg-green-600 rounded-full" style={{ width: `${dist.percentage}%` }} />
                      </div>
                      <span className="w-8 text-right font-mono text-[11px] font-bold">{dist.percentage}%</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Public Feedback lists */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Public Feedback</h3>
                
                <ul className="space-y-3.5">
                  {reviewsList.map((rev) => (
                    <li key={rev.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                      
                      {/* Reviewer Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm" className="size-8">
                            <AvatarFallback className="text-[10px] bg-muted/80">{initialsFromName(rev.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-foreground leading-normal">{rev.name}</h4>
                              <Badge className="text-[8px] font-bold bg-[#e6f4ea] text-[#2d4a35] dark:bg-green-950/40 dark:text-green-300 border-0 uppercase tracking-widest py-0.5">
                                {rev.campaignTag}
                              </Badge>
                            </div>
                            <span className="text-[9px] text-muted-foreground/80 leading-none">{rev.timeAgo}</span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "size-3.5",
                                i < rev.rating ? "fill-[#fbbf24] text-[#fbbf24]" : "text-muted-foreground/30"
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => toast.success("Marked review as helpful!")}
                          className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider flex items-center gap-1"
                        >
                          Helpful ({rev.helpfulCount})
                        </button>
                        <button
                          onClick={() => toast.info("Direct review replies are disabled in layout validation.")}
                          className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider"
                        >
                          Reply
                        </button>
                      </div>

                    </li>
                  ))}
                </ul>

                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => toast.info("All reviews are already displayed.")}
                    className="text-xs font-semibold h-9 rounded-xl border-border hover:bg-muted"
                  >
                    Load More Reviews
                  </Button>
                </div>
              </div>

            </div>

            {/* Sidebar widgets */}
            <div className="space-y-5">
              <ProfileStrengthWidget />
              <SimilarAgenciesWidget />
            </div>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}

/* ==========================================================================
   SIDEBAR REUSABLE WIDGETS
   ========================================================================== */
function ProfileStrengthWidget() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
        Profile Strength
      </h4>

      <div className="flex items-center gap-4 py-1.5">
        {/* Visual Progress ring circle */}
        <div className="relative size-16 shrink-0 flex items-center justify-center rounded-full border-4 border-muted">
          <div className="absolute inset-0 rounded-full border-4 border-green-700 dark:border-green-600 border-t-transparent border-l-transparent" />
          <span className="text-sm font-bold font-mono">85%</span>
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Good Profile Strength</p>
          <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
            Complete the remaining item to showcase case achievements to top client brands.
          </p>
        </div>
      </div>

      <ul className="space-y-2 pt-1 border-t border-border/40">
        {MOCK_PROFILE_STRENGTH_ITEMS.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className={cn(
              "size-4 rounded-full border flex items-center justify-center shrink-0 text-[9px] font-bold font-mono",
              item.completed
                ? "bg-[#e6f4ea] text-[#2d4a35] border-[#a3d1c1] dark:bg-green-950/30 dark:text-green-300"
                : "border-border"
            )}>
              {item.completed ? "✓" : ""}
            </span>
            <span className={cn(item.completed && "line-through opacity-70")}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompanyInfoWidget({ profile }: { profile: Profile }) {
  const hasRealInfo = !!profile.location;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3 relative">
      {!hasRealInfo && (
        <Badge variant="outline" className="absolute top-4 right-4 text-[8px] font-bold text-amber-600 border-amber-300 bg-amber-50/50 uppercase tracking-wider">
          Demo Info
        </Badge>
      )}
      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
        Company Info
      </h4>

      <ul className="space-y-2 text-xs">
        {MOCK_COMPANY_INFO.map((info, idx) => (
          <li key={idx} className="flex justify-between items-center py-0.5">
            <span className="text-muted-foreground">{info.label}</span>
            <span className="font-semibold text-foreground">{info.value}</span>
          </li>
        ))}
        <li className="flex justify-between items-center py-0.5">
          <span className="text-muted-foreground">Headquarters</span>
          <span className="font-semibold text-foreground truncate max-w-[150px]">
            {profile.location || "Los Angeles, CA"}
          </span>
        </li>
      </ul>
    </div>
  );
}

function SocialPresenceWidget({ profile }: { profile: Profile }) {
  const hasSocials = profile.socialLinks && Object.values(profile.socialLinks).some(Boolean);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3 relative">
      {!hasSocials && (
        <Badge variant="outline" className="absolute top-4 right-4 text-[8px] font-bold text-amber-600 border-amber-300 bg-amber-50/50 uppercase tracking-wider">
          Demo Socials
        </Badge>
      )}
      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
        Social Presence
      </h4>

      <ul className="space-y-2 text-xs">
        {MOCK_SOCIAL_PRESENCE.map((soc, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground/60 shrink-0" />
            <a href={soc.href} target="_blank" rel="noreferrer" className="font-semibold text-[#476948] dark:text-[#a7d9b5] hover:underline truncate">
              {soc.handle}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SimilarAgenciesWidget() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
        Similar Agencies
      </h4>

      <ul className="space-y-3">
        {MOCK_SIMILAR_AGENCIES.map((agency) => (
          <li key={agency.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar size="sm" className="size-7.5">
                <AvatarFallback className="text-[9px] bg-muted/80">{agency.logoText}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate leading-normal">{agency.name}</p>
                <p className="text-[9px] text-muted-foreground truncate leading-none mt-0.5">{agency.niche}</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-muted-foreground/75 bg-muted px-2 py-0.5 rounded shrink-0">
              {agency.talentCount} Talent
            </span>
          </li>
        ))}
      </ul>

      <div className="text-center pt-1 border-t border-border/40">
        <button
          onClick={() => toast.info("Discovery mode directory search is disabled in layout validation.")}
          className="text-[10px] font-bold text-[#476948] dark:text-[#a7d9b5] uppercase tracking-wider hover:underline"
        >
          View Discovery Mode
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   STANDARD PROFILE DETAIL PAGE VIEW (FALLBACK FOR OTHER ROLES)
   ========================================================================== */
function StandardProfileView({
  profileData,
  isOwnProfile,
}: {
  profileData: NonNullable<ReturnType<typeof useGetPublicProfileQuery>["data"]>;
  isOwnProfile: boolean;
}) {
  const router = useRouter();
  const {
    profile,
    isVerified,
    role,
    trustScore,
    reviewSummary,
    responseTime,
    responseRate,
    openOpportunities,
    availability,
    endorsementCounts,
    postStats,
    followerCount,
    followingCount,
    viewerIsFollowing,
    managedByAgency,
    completedCollaborationsCount,
  } = profileData;

  const { data: session } = useGetSessionQuery();
  const [sendRequest, { isLoading: isConnecting, isSuccess: connected }] = useSendConnectionRequestMutation();
  const [startConversation, { isLoading: isMessaging }] = useStartConversationMutation();
  const [endorseSkill, { isLoading: isEndorsing }] = useEndorseSkillMutation();
  const [toggleFollow, { isLoading: isTogglingFollow }] = useToggleFollowMutation();
  const { data: representingAgencies } = useGetRepresentingAgenciesQuery(profile.userId, {
    skip: !profileData,
  });

  const canApply = canApplyToOpportunity(session?.user?.role);
  const { data: myApplications } = useGetMyApplicationsQuery(undefined, { skip: !isOwnProfile || !canApply });
  const { data: reviewsData } = useGetReviewsForUserQuery(profile.userId);
  const { data: dashboard } = useGetDashboardQuery(undefined, { skip: !isOwnProfile });
  const { data: ownProfile } = useGetOwnProfileQuery(undefined, { skip: !isOwnProfile });

  const [activeTab, setActiveTab] = useState("overview");
  const isTalent = role === "CREATOR" || role === "FREELANCER";

  const standardTabs = [
    { value: "overview", label: "Overview" },
    { value: "portfolio", label: "Portfolio" },
    { value: "experience", label: "Experience" },
    { value: "reviews", label: "Reviews" },
  ];
  if (isTalent) {
    standardTabs.push({ value: "analytics", label: "Analytics" });
  } else {
    if (profile.rateCardItems.length > 0 || profile.minRate || profile.maxRate) {
      standardTabs.push({ value: "rates", label: "Rates" });
    }
    if (profile.caseStudies.length > 0) {
      standardTabs.push({ value: "case-studies", label: "Case Studies" });
    }
    if (openOpportunities.length > 0) {
      standardTabs.push({ value: "opportunities", label: "Opportunities" });
    }
  }

  async function handleMessage() {
    const conversation = await startConversation(profile.userId).unwrap();
    router.push(`/messages?conversationId=${conversation.id}`);
  }

  async function handleShareProfile() {
    const url = `${window.location.origin}/profile/${profile.username}`;
    await navigator.clipboard.writeText(url);
    toast.success("Profile link copied to clipboard");
  }

  const engagementRate =
    followerCount === 0
      ? "—"
      : `${(((postStats.totalLikes + postStats.totalComments) / followerCount) * 100).toFixed(1)}%`;

  const stats: { icon: typeof Users; label: string; value: string | number }[] = [
    { icon: Users, label: "Followers", value: followerCount.toLocaleString() },
    { icon: Eye, label: "Average Views", value: postStats.averageViews.toLocaleString() },
    { icon: TrendingUp, label: "Engagement Rate", value: engagementRate },
    { icon: CheckCircle2, label: "Completed Collaborations", value: completedCollaborationsCount.toLocaleString() },
    { icon: Briefcase, label: "Portfolio Projects", value: profile.portfolioItems.length },
    {
      icon: Clock,
      label: "Response Rate",
      value: responseRate?.ratePercent != null ? `${responseRate.ratePercent}%` : "—",
    },
  ];

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
              href="/profile/edit"
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
                  href="/profile/edit"
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
                  href="/profile/edit"
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
              {role && (
                <span className="rounded-full border border-[#1F5F3F]/35 bg-[#1F5F3F]/5 px-2.5 py-1 text-xs font-semibold text-[#1F5F3F] dark:border-[#25422d] dark:bg-[#1a261d] dark:text-[#daf0dd]">
                  {formatRole(role)}
                </span>
              )}
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
            {profile.socialLinks && (profile.socialLinks.instagram || profile.socialLinks.youtube || profile.socialLinks.linkedin || profile.socialLinks.website) ? (
              <div className="flex items-center gap-4 pt-2.5" id="standard-social-links">
                {profile.socialLinks.instagram && (
                  <a
                    href={profile.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1F5F3F] transition-colors"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="size-5" />
                  </a>
                )}
                {profile.socialLinks.youtube && (
                  <a
                    href={profile.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1F5F3F] transition-colors"
                    aria-label="YouTube"
                  >
                    <FaYoutube className="size-5" />
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1F5F3F] transition-colors"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin className="size-5" />
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[#1F5F3F] transition-colors"
                    aria-label="Website"
                  >
                    <Globe className="size-5" />
                  </a>
                )}
              </div>
            ) : null}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="h-auto flex w-full justify-start border-b border-border/60 bg-transparent p-0 gap-1 rounded-none">
          {standardTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className={NEW_TAB_TRIGGER_CLASS}>
              <span>{tab.label}</span>
              {activeTab === tab.value && (
                <motion.div
                  layoutId="standard-underline"
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-[2px] bg-[#1F5F3F]"
                  transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.25 }}
                />
              )}
            </TabsTrigger>
          ))}
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
                  {profile.skills.map((skill: string) => {
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
                      href="/profile/edit"
                      className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent"
                    >
                      + Add Skill
                    </Link>
                  ) : null}
                </div>
              </section>

              {profile.subSpecializations.length > 0 ? (
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="font-heading text-lg font-bold text-foreground">Niches &amp; Categories</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.subSpecializations.map((tag: string) => (
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

              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="font-heading text-lg font-bold text-foreground">Analytics</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Engagement from posts and endorsements on Castway.{" "}
                  {isOwnProfile ? "Live metrics from connected platforms aren't synced yet." : ""}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <AnalyticsTile icon={Rss} label="Posts" value={postStats.postsCount} />
                  <AnalyticsTile icon={Heart} label="Post Likes" value={postStats.totalLikes} />
                  <AnalyticsTile icon={MessageCircle} label="Post Comments" value={postStats.totalComments} />
                  <AnalyticsTile
                    icon={Award}
                    label="Endorsements"
                    value={Object.values<number>(endorsementCounts).reduce((sum, count) => sum + count, 0)}
                  />
                </div>
              </section>
            </div>

            <div className="space-y-5">
              {isOwnProfile ? <ProfileCompletionCard /> : null}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-5">
          {profile.portfolioItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {profile.portfolioItems.map((item: any) => {
                const isImage = isImageUrl(item.imageUrl);
                // A non-image cover (PDF/video) has nothing to open unless the
                // item also has a link, so fall back to the file itself.
                const href = item.link ?? (!isImage ? item.imageUrl : undefined);
                return (
                  <a
                    key={item.id}
                    href={href}
                    target={href ? "_blank" : undefined}
                    rel={href ? "noreferrer" : undefined}
                    className="group overflow-hidden rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    {isImage ? (
                      <div
                        role="img"
                        aria-label={item.title}
                        className="aspect-video w-full rounded-lg bg-muted bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.imageUrl})` }}
                      />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center gap-1.5 rounded-lg bg-muted text-xs text-muted-foreground">
                        <FileText className="size-4" />
                        View file
                      </div>
                    )}
                    <div className="mt-3 space-y-2">
                      <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-4">
              <span>No portfolio items yet.</span>
              {isOwnProfile && (
                <Link
                  href="/profile/edit#portfolio-section"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F5F3F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1A4F35] transition-colors"
                >
                  <Plus className="size-4" />
                  Add Portfolio Item
                </Link>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="experience" className="mt-5 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-foreground">Work History</h2>
            <ExperienceTimeline entries={profile.experience} />
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
              <div className="flex items-center gap-3 bg-card p-5 border border-border rounded-2xl">
                <div className="flex items-center gap-1 text-xl font-bold">
                  <Star className="size-5 fill-[#fbbf24] text-[#fbbf24]" />
                  {reviewsData.summary.averageRating?.toFixed(1) ?? "—"}
                </div>
                <p className="text-sm text-muted-foreground">{reviewsData.summary.reviewCount} reviews</p>
              </div>
              <ul className="space-y-3">
                {reviewsData.items.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold">{review.reviewer.name}</p>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={cn("size-3.5", i < review.rating ? "fill-[#fbbf24] text-[#fbbf24]" : "text-muted-foreground/30")} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </TabsContent>

        {isTalent && (
          <TabsContent value="analytics" className="mt-5 space-y-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs font-medium text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 flex items-start gap-2 mb-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Demonstration Mode</span>
                <p className="text-[11px] text-amber-700/90 dark:text-amber-400 mt-0.5">
                  Live social platform analytics integration is currently pending. Displaying demonstration mock data below alongside real platform engagement metrics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                  <Globe className="size-5 text-[#1F5F3F]" />
                  Connected Platforms
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <FaYoutube className="size-4 text-red-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">YouTube</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-tight">120K</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Subscribers (Demo)</p>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <FaInstagram className="size-4 text-pink-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Instagram</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-tight">85K</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Followers (Demo)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Est. Reach</span>
                    <p className="text-xl font-bold text-foreground mt-1">205K</p>
                    <p className="text-[10px] text-muted-foreground">Combined Monthly (Demo)</p>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Engagement</span>
                    <p className="text-xl font-bold text-foreground mt-1">4.2%</p>
                    <p className="text-[10px] text-muted-foreground">Average Rate (Demo)</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                  <Award className="size-5 text-[#1F5F3F]" />
                  Castway Performance
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Rss className="size-4 text-[#476948]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Posts</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-tight">{postStats.postsCount}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Published Content</p>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Plus className="size-4 text-[#476948]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Endorsements</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-tight">
                      {Object.values<number>(endorsementCounts).reduce((sum, count) => sum + count, 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Skills Endorsed</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Heart className="size-4 text-[#476948]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Likes Received</span>
                    </div>
                    <p className="text-xl font-bold text-foreground leading-tight">{postStats.totalLikes}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Castway Platform</p>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-4 border border-border/40">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <MessageCircle className="size-4 text-[#476948]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">Comments</span>
                    </div>
                    <p className="text-xl font-bold text-foreground leading-tight">{postStats.totalComments}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Castway Platform</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
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

function AnalyticsTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Rss;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <p className="text-[11px] font-medium">{label}</p>
      </div>
      <p className="mt-1 font-mono text-lg font-semibold text-foreground tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

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
            <div className="size-2.5 shrink-0 rounded-full bg-[#476948]" />
            {index < entries.length - 1 ? <div className="mt-1 w-px flex-1 bg-border" /> : null}
          </div>
          <div className="min-w-0 flex-1 pb-1">
            <p className="text-sm font-bold text-foreground">{entry.title}</p>
            <p className="text-xs text-muted-foreground">
              {entry.company} · {formatMonthYear(entry.startDate)}
              {" – "}
              {entry.current ? "Present" : entry.endDate ? formatMonthYear(entry.endDate) : "Present"}
            </p>
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
          </li>
        ))}
      </ul>
    </div>
  );
}
