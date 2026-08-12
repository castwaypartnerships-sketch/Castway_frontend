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
  FolderPlus,
  GraduationCap,
  Globe,
  ImageIcon,
  MapPin,
  Pencil,
  Plus,
  Share2,
  Star,
  TrendingUp,
  Users,
  ArrowUp,
  ArrowDown,
  Video,
  Compass,
  Award,
  FileText,
  Heart,
  MessageCircle,
  Rss,
} from "lucide-react";
import { FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa6";
import { motion } from "framer-motion";

import { useGetPublicProfileQuery, type PublicProfileResponse } from "@/lib/redux/endpoints/search-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useSendConnectionRequestMutation } from "@/lib/redux/endpoints/connections-api";
import { useStartConversationMutation } from "@/lib/redux/endpoints/messages-api";
import { useEndorseSkillMutation } from "@/lib/redux/endpoints/endorsements-api";
import { useGetRepresentingAgenciesQuery, useSetPubliclyListedMutation, useGetMyRosterQuery } from "@/lib/redux/endpoints/roster-api";
import { useToggleFollowMutation } from "@/lib/redux/endpoints/follow-api";
import { useGetReviewsForUserQuery, useReplyToReviewMutation, useSubmitReviewMutation } from "@/lib/redux/endpoints/reviews-api";
import { useGetClientCampaignsQuery, useGetCampaignsQuery, useAddToShortlistMutation } from "@/lib/redux/endpoints/campaigns-api";
import { useGetClientBrandsQuery } from "@/lib/redux/endpoints/brand-agency-api";
import {
  useAddCaseStudyMutation,
  useUpdateCaseStudyMutation,
  useRemoveCaseStudyMutation,
} from "@/lib/redux/endpoints/profile-api";
import type { AgencySize, CaseStudy, DateRange, Education, Experience, PortfolioMetric, Profile } from "@/lib/types/profile";
import type { RosterEntryDto } from "@/lib/types/roster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileCompletionCard } from "@/components/feed/profile-completion-card";
import { initialsFromName, formatRelativeTime } from "@/lib/format";
import { isImageUrl } from "@/lib/upload-image";
import { cn } from "@/lib/utils";
import { isHiringRole } from "@/lib/rbac";

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
  "relative py-3.5 px-4 text-sm font-normal text-muted-foreground data-[state=active]:text-[#1F5F3F] data-[state=active]:font-medium bg-transparent border-0 shadow-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 select-none cursor-pointer data-active:bg-transparent data-active:border-transparent data-active:shadow-none dark:data-active:bg-transparent dark:data-active:border-transparent after:hidden shrink-0";

const AGENCY_SIZE_LABEL: Record<AgencySize, string> = {
  SOLO: "Just me",
  SMALL: "2-10 people",
  MEDIUM: "11-50 people",
  LARGE: "51+ people",
};

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
  const { data: clientBrands } = useGetClientBrandsQuery(undefined, { skip: !isOwnProfile });
  const [startConversation, { isLoading: isMessaging }] = useStartConversationMutation();
  const [toggleFollow, { isLoading: isTogglingFollow }] = useToggleFollowMutation();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClientBrandUserId, setSelectedClientBrandUserId] = useState<string | null>(null);
  const [caseStudyDialogOpen, setCaseStudyDialogOpen] = useState(false);
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | undefined>(undefined);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyToReview, { isLoading: isSubmittingReply }] = useReplyToReviewMutation();

  async function handleSubmitReply(reviewId: string) {
    const replyComment = replyDraft.trim();
    if (!replyComment) return;
    try {
      await replyToReview({ reviewId, revieweeUserId: profile.userId, replyComment }).unwrap();
      setReplyingToReviewId(null);
      setReplyDraft("");
      toast.success("Reply posted");
    } catch {
      toast.error("Couldn't post that reply. Please try again.");
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

  // --------------------------------------------------------------------------
  // Header Stats Selection
  // --------------------------------------------------------------------------
  const getHeaderStats = () => {
    // Only real data we have is the accepted roster count, and only for the
    // owner viewing their own dashboard (no public roster-size query exists).
    const stats: { label: string; value: string; showStars?: boolean }[] = [];
    if (isOwnProfile && roster?.items) {
      const acceptedCount = roster.items.filter((r) => r.status === "ACCEPTED").length;
      stats.push({ label: "Roster Size", value: `${acceptedCount} Talent` });
    }
    return stats;
  };

  const headerStatsList = getHeaderStats();

  // --------------------------------------------------------------------------
  // specialties / industries checks
  // --------------------------------------------------------------------------
  const hasRealBio = !!profile.bio;
  const specialties = profile.skills;
  const hasRealSpecialties = profile.skills.length > 0;

  const industries = profile.subSpecializations;
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
        username: entry.member!.username,
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
  const hasPublicRoster = realPublicRoster.length > 0;
  const displayRoster = realPublicRoster;

  // --------------------------------------------------------------------------
  // Campaigns Tab — Co-Management for Brand Clients. There's no backend
  // endpoint that aggregates campaigns across every linked client at once
  // (each client's campaigns stay scoped to that brand, see
  // `CampaignService.listForClient`), so this shows real per-client data via
  // a client selector rather than a single combined (and therefore fake)
  // list. Campaign briefs are internal agency/client data, never shown to
  // public profile visitors.
  // --------------------------------------------------------------------------
  const acceptedClientBrands = (clientBrands?.items ?? []).filter(
    (link) => link.status === "ACCEPTED" && link.brand,
  );
  const effectiveClientBrandUserId = selectedClientBrandUserId ?? acceptedClientBrands[0]?.brand?.userId ?? null;
  const { data: selectedClientCampaigns, isFetching: isLoadingClientCampaigns } = useGetClientCampaignsQuery(
    effectiveClientBrandUserId ?? "",
    { skip: !isOwnProfile || !effectiveClientBrandUserId },
  );

  // --------------------------------------------------------------------------
  // Case Studies filtering
  // --------------------------------------------------------------------------
  const hasRealCaseStudies = profile.caseStudies && profile.caseStudies.length > 0;
  const displayCaseStudies: CaseStudy[] = profile.caseStudies;

  // --------------------------------------------------------------------------
  // Reviews filtering
  // --------------------------------------------------------------------------
  const [reviewsPage, setReviewsPage] = useState(1);
  const { data: realReviews, isFetching: isFetchingReviews } = useGetReviewsForUserQuery({
    userId: profile.userId,
    page: reviewsPage,
  });
  const hasRealReviews = realReviews && realReviews.items.length > 0;
  const hasMoreReviews = realReviews ? realReviews.items.length < realReviews.total : false;

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
    return {
      averageRating: 0,
      reviewCount: 0,
      distribution: [
        { stars: 5, percentage: 0 },
        { stars: 4, percentage: 0 },
        { stars: 3, percentage: 0 },
        { stars: 2, percentage: 0 },
        { stars: 1, percentage: 0 },
      ],
    };
  };

  const getReviewsList = () => {
    if (hasRealReviews && realReviews) {
      return realReviews.items.map((rev) => ({
        id: rev.id,
        name: rev.reviewer.name,
        avatarUrl: rev.reviewer.avatarUrl ?? undefined,
        rating: rev.rating,
        timeAgo: formatRelativeTime(rev.createdAt),
        comment: rev.comment ?? "",
        replyComment: rev.replyComment,
        repliedAt: rev.repliedAt,
      }));
    }
    return [];
  };

  const reviewsSummary = getReviewsSummary();
  const reviewsList = getReviewsList();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 break-words">
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
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between w-full">
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
      {headerStatsList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {headerStatsList.map((stat, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-bold font-mono text-foreground leading-none">{stat.value}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Tab Switcher and Content Sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsList variant="line" className="h-auto flex w-max justify-start border-b border-border/60 bg-transparent p-0 gap-1 rounded-none">
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
        </div>

        {/* ------------------------------------------------------------------
            TAB 1: OVERVIEW
            ------------------------------------------------------------------ */}
        <TabsContent value="overview" className="outline-none mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
            
            {/* Left Content Area */}
            <div className="space-y-5">
              
              {/* About Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">About Company</h2>
                {hasRealBio ? (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
                    <span>No company bio yet.</span>
                    {isOwnProfile && (
                      <Link
                        href="/profile/edit#bio"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F5F3F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1A4F35] transition-colors"
                      >
                        <Plus className="size-4" />
                        Add Bio
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Specialties Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3.5">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Specialties</h2>
                {hasRealSpecialties ? (
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
                ) : (
                  <div className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
                    <span>No specialties yet.</span>
                    {isOwnProfile && (
                      <Link
                        href="/profile/edit#skills"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F5F3F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1A4F35] transition-colors"
                      >
                        <Plus className="size-4" />
                        Add Specialties
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Industries Served */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3.5">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Industries Served</h2>
                {hasRealIndustries ? (
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
                ) : (
                  <div className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
                    <span>No industries yet.</span>
                    {isOwnProfile && (
                      <Link
                        href="/profile/edit#sub-specializations-section"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F5F3F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1A4F35] transition-colors"
                      >
                        <Plus className="size-4" />
                        Add Industries
                      </Link>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Right Sidebar Area */}
            <div className="space-y-5">
              <CompanyInfoWidget profile={profile} />
              <SocialPresenceWidget profile={profile} />
            </div>

          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------
            TAB 2: PUBLIC ROSTER
            ------------------------------------------------------------------ */}
        <TabsContent value="roster" className="outline-none mt-0">
          <div className="space-y-5">
            {hasPublicRoster ? (
              <>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Full roster is private — only opted-in talent shown here.
                </div>

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
                        href={`/profile/${talent.username}`}
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
              </>
            ) : (
              <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                No public roster members yet.
              </p>
            )}
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------
            TAB 3: CASE STUDIES
            ------------------------------------------------------------------ */}
        <TabsContent value="case-studies" className="outline-none mt-0">
          <div className="space-y-5">
            {hasRealCaseStudies || isOwnProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Add New Case Study CTA Trigger card */}
                {isOwnProfile && (
                  <button
                    onClick={() => {
                      setEditingCaseStudy(undefined);
                      setCaseStudyDialogOpen(true);
                    }}
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
                {displayCaseStudies.map((study) => (
                  <div key={study.id} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">

                    {/* Header */}
                    <div className="aspect-video w-full relative flex items-center justify-center bg-muted">
                      <Badge className="absolute top-2.5 left-2.5 bg-[#1c3322] text-white hover:bg-[#1c3322] border-0 text-[8px] font-bold tracking-widest uppercase">
                        {study.metrics[0] ? `${study.metrics[0].label}: ${study.metrics[0].value}` : "Case Study"}
                      </Badge>
                      <ImageIcon className="size-8 text-muted-foreground/40" />
                    </div>

                    {/* Meta info */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-foreground leading-snug">{study.title}</h4>
                        <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">{study.brief}</p>
                      </div>

                      <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {study.metrics.slice(1).map((metric, i) => (
                            <Badge key={i} variant="secondary" className="text-[8px] font-bold px-1.5 py-0.5">
                              {metric.label}: {metric.value}
                            </Badge>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            setEditingCaseStudy(study);
                            setCaseStudyDialogOpen(true);
                          }}
                          className="shrink-0 text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider flex items-center gap-0.5"
                        >
                          Details →
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                No case studies yet.
              </p>
            )}
          </div>
        </TabsContent>

        {/* ------------------------------------------------------------------
            TAB 4: CAMPAIGNS
            ------------------------------------------------------------------ */}
        <TabsContent value="campaigns" className="outline-none mt-0">
          {!isOwnProfile ? (
            <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              Campaign details are private to the agency and its clients.
            </p>
          ) : acceptedClientBrands.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No linked clients yet — link a brand client to start managing their campaigns.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {acceptedClientBrands.map((link) => (
                  <button
                    key={link.brand!.userId}
                    type="button"
                    onClick={() => setSelectedClientBrandUserId(link.brand!.userId)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      effectiveClientBrandUserId === link.brand!.userId
                        ? "border-[#476948] bg-[#e6f4ea] text-[#2d4a35] dark:bg-[#1a261d] dark:text-[#daf0dd]"
                        : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {link.brand!.name}
                  </button>
                ))}
              </div>

              {isLoadingClientCampaigns ? (
                <div className="space-y-3">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
                  ))}
                </div>
              ) : !selectedClientCampaigns || selectedClientCampaigns.items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                  No campaigns for this client yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedClientCampaigns.items.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/campaigns/${campaign.id}`}
                      className="block rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-sm font-bold text-foreground">{campaign.name}</h4>
                        <Badge
                          variant="secondary"
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5"
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span>{campaign.budget ?? "Budget not set"}</span>
                        {campaign.category ? <span>{campaign.category}</span> : null}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ------------------------------------------------------------------
            TAB 5: REVIEWS
            ------------------------------------------------------------------ */}
        <TabsContent value="reviews" className="outline-none mt-0">
          <div className="space-y-5">
            {/* Rating summary card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-6 justify-between">

              {/* Score */}
              <div className="text-center sm:text-left space-y-1.5 sm:border-r sm:border-border/60 sm:pr-8">
                <div className="flex items-center justify-center sm:justify-start gap-1 text-3xl font-extrabold text-foreground">
                  <Star className="size-6 fill-[#fbbf24] text-[#fbbf24]" />
                  {reviewsSummary.averageRating.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground font-semibold">Based on {reviewsSummary.reviewCount} client reviews</p>
                {!isOwnProfile && (
                  <Button
                    onClick={() => setReviewDialogOpen(true)}
                    className="bg-[#476948] hover:bg-[#3d5a3e] text-white text-xs font-semibold rounded-lg h-8 px-4 mt-2"
                  >
                    Leave a Review
                  </Button>
                )}
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
            {!hasRealReviews ? (
              <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                No reviews yet.
              </p>
            ) : (
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
                            <h4 className="text-xs font-bold text-foreground leading-normal">{rev.name}</h4>
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

                      {rev.replyComment ? (
                        <div className="ml-4 rounded-xl border border-border/60 bg-muted/40 p-3 space-y-1">
                          <p className="text-[9px] font-bold text-foreground uppercase tracking-wider">Response from {profile.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{rev.replyComment}</p>
                        </div>
                      ) : isOwnProfile ? (
                        replyingToReviewId === rev.id ? (
                          <div className="space-y-2 pt-1">
                            <Textarea
                              value={replyDraft}
                              onChange={(e) => setReplyDraft(e.target.value)}
                              placeholder="Write a public reply..."
                              rows={2}
                              maxLength={1000}
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSubmitReply(rev.id)}
                                disabled={isSubmittingReply || !replyDraft.trim()}
                              >
                                {isSubmittingReply ? "Posting..." : "Post reply"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setReplyingToReviewId(null);
                                  setReplyDraft("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={() => {
                                setReplyingToReviewId(rev.id);
                                setReplyDraft("");
                              }}
                              className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider"
                            >
                              Reply
                            </button>
                          </div>
                        )
                      ) : null}

                    </li>
                  ))}
                </ul>

                {hasMoreReviews && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setReviewsPage((p) => p + 1)}
                      disabled={isFetchingReviews}
                      className="text-xs font-semibold h-9 rounded-xl border-border hover:bg-muted"
                    >
                      {isFetchingReviews ? "Loading..." : "Load More Reviews"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

      </Tabs>

      {isOwnProfile && (
        <CaseStudyDialog
          open={caseStudyDialogOpen}
          onOpenChange={setCaseStudyDialogOpen}
          caseStudy={editingCaseStudy}
        />
      )}
      {!isOwnProfile && (
        <ReviewFormDialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen} revieweeUserId={profile.userId} />
      )}
    </div>
  );
}

/* ==========================================================================
   SIDEBAR REUSABLE WIDGETS
   ========================================================================== */
function CompanyInfoWidget({ profile }: { profile: Profile }) {
  const rows: { label: string; value: string }[] = [];
  if (profile.agencySize) {
    rows.push({ label: "Team Size", value: AGENCY_SIZE_LABEL[profile.agencySize] });
  }
  if (profile.location) {
    rows.push({ label: "Headquarters", value: profile.location });
  }
  if (profile.businessEmail) {
    rows.push({ label: "Email", value: profile.businessEmail });
  }
  if (profile.contactNumber) {
    rows.push({ label: "Phone", value: profile.contactNumber });
  }

  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
        Company Info
      </h4>

      <ul className="space-y-2 text-xs">
        {rows.map((info) => (
          <li key={info.label} className="flex justify-between items-center py-0.5 gap-3">
            <span className="text-muted-foreground shrink-0">{info.label}</span>
            <span className="font-semibold text-foreground truncate max-w-[150px]">{info.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialPresenceWidget({ profile }: { profile: Profile }) {
  const links = [
    profile.socialLinks?.instagram ? { label: "Instagram", href: profile.socialLinks.instagram, Icon: FaInstagram } : null,
    profile.socialLinks?.youtube ? { label: "YouTube", href: profile.socialLinks.youtube, Icon: FaYoutube } : null,
    profile.socialLinks?.linkedin ? { label: "LinkedIn", href: profile.socialLinks.linkedin, Icon: FaLinkedin } : null,
    profile.socialLinks?.website ? { label: "Website", href: profile.socialLinks.website, Icon: Globe } : null,
  ].filter((link): link is { label: string; href: string; Icon: typeof Globe } => link !== null);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">
        Social Presence
      </h4>

      {links.length > 0 ? (
        <ul className="space-y-2 text-xs">
          {links.map((link) => (
            <li key={link.label} className="flex items-center gap-2">
              <link.Icon className="size-4 text-muted-foreground/60 shrink-0" />
              <a href={link.href} target="_blank" rel="noreferrer" className="font-semibold text-[#476948] dark:text-[#a7d9b5] hover:underline truncate">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">No social links yet.</p>
      )}
    </div>
  );
}

/* ==========================================================================
   CASE STUDY DIALOG (Add / Edit / Delete) — Agency Profile "Case Studies" tab
   ========================================================================== */
function CaseStudyDialog({
  open,
  onOpenChange,
  caseStudy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present in edit mode, undefined when adding a new case study. */
  caseStudy?: CaseStudy;
}) {
  const isEditing = !!caseStudy;
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [metrics, setMetrics] = useState<PortfolioMetric[]>([]);

  const [addCaseStudy, { isLoading: isAdding }] = useAddCaseStudyMutation();
  const [updateCaseStudy, { isLoading: isUpdating }] = useUpdateCaseStudyMutation();
  const [removeCaseStudy, { isLoading: isRemoving }] = useRemoveCaseStudyMutation();
  const isSaving = isAdding || isUpdating;

  useEffect(() => {
    if (!open) return;
    setTitle(caseStudy?.title ?? "");
    setBrief(caseStudy?.brief ?? "");
    setAction(caseStudy?.action ?? "");
    setResult(caseStudy?.result ?? "");
    setMetrics(caseStudy?.metrics ?? []);
  }, [open, caseStudy]);

  function updateMetric(index: number, field: "label" | "value", value: string) {
    setMetrics((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cleanMetrics = metrics.filter((m) => m.label.trim() && m.value.trim());
    const input = { title: title.trim(), brief: brief.trim(), action: action.trim(), result: result.trim(), metrics: cleanMetrics };
    try {
      if (isEditing) {
        await updateCaseStudy({ itemId: caseStudy.id, patch: input }).unwrap();
        toast.success("Case study updated");
      } else {
        await addCaseStudy(input).unwrap();
        toast.success("Case study added");
      }
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save that case study. Please try again.");
    }
  }

  async function handleDelete() {
    if (!caseStudy) return;
    try {
      await removeCaseStudy(caseStudy.id).unwrap();
      toast.success("Case study removed");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't remove that case study. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Case study details" : "Add new case study"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cs-title">Title</Label>
            <Input id="cs-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cs-brief">Brief</Label>
            <Textarea id="cs-brief" value={brief} onChange={(e) => setBrief(e.target.value)} required rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cs-action">Action</Label>
            <Textarea id="cs-action" value={action} onChange={(e) => setAction(e.target.value)} required rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cs-result">Result</Label>
            <Textarea id="cs-result" value={result} onChange={(e) => setResult(e.target.value)} required rows={2} />
          </div>

          <div className="space-y-1.5">
            <Label>Metrics</Label>
            {metrics.map((metric, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={metric.label}
                  onChange={(e) => updateMetric(i, "label", e.target.value)}
                  placeholder="e.g. Engagement Rate"
                />
                <Input
                  value={metric.value}
                  onChange={(e) => updateMetric(i, "value", e.target.value)}
                  placeholder="e.g. +42%"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMetrics((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMetrics((prev) => [...prev, { label: "", value: "" }])}
            >
              Add metric
            </Button>
          </div>

          <DialogFooter className="flex items-center justify-between">
            {isEditing ? (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isRemoving}>
                {isRemoving ? "Removing..." : "Delete"}
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Save changes" : "Add case study"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ==========================================================================
   LEAVE A REVIEW DIALOG
   ========================================================================== */
function ReviewFormDialog({
  open,
  onOpenChange,
  revieweeUserId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revieweeUserId: string;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitReview, { isLoading }] = useSubmitReviewMutation();

  useEffect(() => {
    if (!open) return;
    setRating(5);
    setComment("");
  }, [open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await submitReview({ revieweeUserId, rating, comment: comment.trim() || undefined }).unwrap();
      toast.success("Review submitted");
      onOpenChange(false);
    } catch {
      toast.error(
        "Couldn't submit that review. You can only review someone after a completed collaboration or project.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => {
                const value = i + 1;
                return (
                  <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`}>
                    <Star
                      className={cn(
                        "size-6",
                        value <= rating ? "fill-[#fbbf24] text-[#fbbf24]" : "text-muted-foreground/30",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="review-comment">Comment (optional)</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={1000}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ==========================================================================
   STANDARD PROFILE DETAIL PAGE VIEW (FALLBACK FOR OTHER ROLES)
   ========================================================================== */
function StandardProfileView({
  profileData,
  isOwnProfile,
}: {
  profileData: PublicProfileResponse;
  isOwnProfile: boolean;
}) {
  const router = useRouter();
  const {
    profile,
    isVerified,
    role,
    trustScore,
    responseTime,
    responseRate,
    openOpportunities,
    availability,
    endorsementCounts,
    postStats,
    followerCount,
    viewerIsFollowing,
    viewerConnectionStatus,
    managedByAgency,
    completedCollaborationsCount,
  } = profileData;

  const { data: session } = useGetSessionQuery();
  const [sendRequest, { isLoading: isConnecting }] = useSendConnectionRequestMutation();
  const [startConversation, { isLoading: isMessaging }] = useStartConversationMutation();
  const [endorseSkill, { isLoading: isEndorsing }] = useEndorseSkillMutation();
  const [toggleFollow, { isLoading: isTogglingFollow }] = useToggleFollowMutation();
  const { data: representingAgencies } = useGetRepresentingAgenciesQuery(profile.userId, {
    skip: !profileData,
  });

  const { data: reviewsData } = useGetReviewsForUserQuery({ userId: profile.userId });

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

  async function handleConnect() {
    try {
      await sendRequest(profile.userId).unwrap();
      toast.success("Connection request sent");
    } catch (err) {
      const message =
        (err as { data?: { error?: string } })?.data?.error ?? "Couldn't send that connection request.";
      toast.error(message);
    }
  }

  async function handleShareProfile() {
    const url = `${window.location.origin}/profile/${profile.username}`;
    await navigator.clipboard.writeText(url);
    toast.success("Profile link copied to clipboard");
  }

  const engagementRate =
    followerCount === 0 || postStats.postsCount === 0
      ? "—"
      : // Capped at 100% for display — the raw ratio can exceed it (e.g. a
        // post reshared beyond the account's own follower count), which
        // reads as broken rather than as a meaningful "over-engaged" signal.
        `${Math.min(100, ((postStats.totalLikes + postStats.totalComments) / postStats.postsCount / followerCount) * 100).toFixed(1)}%`;

  const stats: { 
    icon: typeof Users; 
    label: string; 
    value: string | number; 
    trend?: "up" | "down"; 
    trendValue?: string;
  }[] = isTalent
    ? [
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
      ]
    : [{ icon: Users, label: "Followers", value: followerCount.toLocaleString() }];

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-6 py-8 break-words">
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
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between w-full">
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
            <div className="flex flex-wrap gap-2 pt-4">
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
              ) : isHiringRole(session?.user?.role) && isTalent ? (
                <>
                  <Button size="sm" disabled={isMessaging} onClick={handleMessage} className="gap-1.5 bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]">
                    Hire Creator
                  </Button>
                  <InviteToCampaignMenu creatorUserId={profile.userId} />
                  <Button size="sm" variant="outline" disabled={isMessaging} onClick={handleMessage}>
                    Message
                  </Button>
                </>
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
                  {viewerConnectionStatus === "pending_incoming" ? (
                    <Link href="/connections" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
                      Respond to request
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      variant={viewerConnectionStatus === "none" ? "default" : "outline"}
                      disabled={isConnecting || viewerConnectionStatus !== "none"}
                      className={
                        viewerConnectionStatus === "none"
                          ? "bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
                          : undefined
                      }
                      onClick={handleConnect}
                    >
                      {isConnecting
                        ? "Requesting…"
                        : viewerConnectionStatus === "connected"
                          ? "Connected"
                          : viewerConnectionStatus === "pending_outgoing"
                            ? "Requested"
                            : "Connect"}
                    </Button>
                  )}
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xl font-bold font-mono text-foreground leading-none">{stat.value}</h3>
              {stat.trend && stat.trendValue && (
                <span className={cn(
                  "ml-auto text-xs font-bold flex items-center gap-0.5",
                  stat.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {stat.trend === "up" ? <ArrowUp className="size-3 stroke-[3]" /> : <ArrowDown className="size-3 stroke-[3]" />}
                  {stat.trendValue}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsList variant="line" className="h-auto flex w-max justify-start border-b border-border/60 bg-transparent p-0 gap-1 rounded-none">
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
        </div>

        <TabsContent value="overview" className="outline-none mt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">About</h2>
                {profile.bio ? (
                  <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No bio added yet.</p>
                )}
              </section>

              <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Skills</h2>
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
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Niches &amp; Categories</h2>
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
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Social Links</h2>
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
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Analytics</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Engagement from posts and endorsements on Castway.{" "}
                  {isOwnProfile ? "Live metrics from connected platforms aren't synced yet." : ""}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <AnalyticsTile icon={Rss} label="Posts" value={postStats.postsCount} href="/home/mine" />
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

        <TabsContent value="portfolio" className="outline-none mt-0">
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

        <TabsContent value="experience" className="outline-none mt-0 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Work History</h2>
            <ExperienceTimeline entries={profile.experience} />
          </div>
          <EducationList entries={profile.education} />
        </TabsContent>

        <TabsContent value="reviews" className="outline-none mt-0 space-y-4">
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
          <TabsContent value="analytics" className="outline-none mt-0 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Award className="size-5 text-[#1F5F3F]" />
                  Castway Performance
                </h2>
                <span className="rounded-full bg-muted/50 px-3 py-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase border border-border/50">
                  Updated Live
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Posts Card */}
                <Link href="/home/mine" className="block">
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer">
                  <div className="absolute -right-4 -top-4 size-24 rounded-full bg-[#1F5F3F] opacity-[0.08] blur-2xl transition-all duration-500 group-hover:opacity-[0.15] group-hover:scale-110 dark:opacity-[0.12] dark:group-hover:opacity-[0.2]" />
                  <div className="flex items-center gap-2.5 text-muted-foreground mb-4">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#e6f4ea] dark:bg-[#1a261d]">
                      <Rss className="size-4 text-[#2d4a35] dark:text-[#daf0dd]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Posts</span>
                  </div>
                  <p className="font-mono text-3xl font-bold text-foreground tracking-tight">{postStats.postsCount}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">Published Content</p>
                </div>
                </Link>

                {/* Endorsements Card */}
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="absolute -right-4 -top-4 size-24 rounded-full bg-[#1F5F3F] opacity-[0.08] blur-2xl transition-all duration-500 group-hover:opacity-[0.15] group-hover:scale-110 dark:opacity-[0.12] dark:group-hover:opacity-[0.2]" />
                  <div className="flex items-center gap-2.5 text-muted-foreground mb-4">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#e6f4ea] dark:bg-[#1a261d]">
                      <Plus className="size-4 text-[#2d4a35] dark:text-[#daf0dd]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Endorsements</span>
                  </div>
                  <p className="font-mono text-3xl font-bold text-foreground tracking-tight">
                    {Object.values<number>(endorsementCounts).reduce((sum, count) => sum + count, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">Skills Endorsed</p>
                </div>

                {/* Likes Received */}
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="absolute -right-4 -top-4 size-24 rounded-full bg-[#1F5F3F] opacity-[0.08] blur-2xl transition-all duration-500 group-hover:opacity-[0.15] group-hover:scale-110 dark:opacity-[0.12] dark:group-hover:opacity-[0.2]" />
                  <div className="flex items-center gap-2.5 text-muted-foreground mb-4">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#e6f4ea] dark:bg-[#1a261d]">
                      <Heart className="size-4 text-[#2d4a35] dark:text-[#daf0dd]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Likes Received</span>
                  </div>
                  <p className="font-mono text-3xl font-bold text-foreground tracking-tight">{postStats.totalLikes}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">Castway Platform</p>
                </div>

                {/* Comments */}
                <div className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted/20 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <div className="absolute -right-4 -top-4 size-24 rounded-full bg-[#1F5F3F] opacity-[0.08] blur-2xl transition-all duration-500 group-hover:opacity-[0.15] group-hover:scale-110 dark:opacity-[0.12] dark:group-hover:opacity-[0.2]" />
                  <div className="flex items-center gap-2.5 text-muted-foreground mb-4">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#e6f4ea] dark:bg-[#1a261d]">
                      <MessageCircle className="size-4 text-[#2d4a35] dark:text-[#daf0dd]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Comments</span>
                  </div>
                  <p className="font-mono text-3xl font-bold text-foreground tracking-tight">{postStats.totalComments}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">Castway Platform</p>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function InviteToCampaignMenu({ creatorUserId }: { creatorUserId: string }) {
  const { data, isLoading: isLoadingCampaigns } = useGetCampaignsQuery();
  const [addToShortlist, { isLoading }] = useAddToShortlistMutation();

  async function handleInvite(campaignId: string, campaignName: string) {
    try {
      await addToShortlist({ campaignId, creatorUserId }).unwrap();
      toast.success(`Added to shortlist for "${campaignName}"`);
    } catch {
      toast.error("Couldn't add to that campaign's shortlist. Please try again.");
    }
  }

  if (isLoadingCampaigns) {
    return (
      <Button size="sm" variant="outline" disabled>
        Loading…
      </Button>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <Button size="sm" variant="outline" disabled>
        Invite to Campaign
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" variant="outline" disabled={isLoading} className="gap-1.5">
            <FolderPlus className="size-4" />
            Invite to Campaign
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {data.items.map((campaign) => (
          <DropdownMenuItem key={campaign.id} onClick={() => handleInvite(campaign.id, campaign.name)}>
            {campaign.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
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
  href,
}: {
  icon: typeof Rss;
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <div className={cn("rounded-lg bg-muted/50 p-3", href && "cursor-pointer transition-colors hover:bg-muted")}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5" />
        <p className="text-[11px] font-medium">{label}</p>
      </div>
      <p className="mt-1 font-mono text-lg font-semibold text-foreground tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
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
            {entry.description && (
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{entry.description}</p>
            )}
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
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
        <GraduationCap className="size-4" />
        Education
      </h2>
      <ul className="mt-4 space-y-3">
        {entries.map((entry) => (
          <li key={entry.id}>
            <p className="text-sm font-bold text-foreground">{entry.school}</p>
            {(entry.degree || entry.fieldOfStudy) && (
              <p className="text-sm text-foreground mt-0.5">
                {[entry.degree, entry.fieldOfStudy].filter(Boolean).join(", ")}
              </p>
            )}
            {(entry.startDate || entry.endDate) && (
              <p className="text-xs text-muted-foreground mt-1">
                {entry.startDate ? formatMonthYear(entry.startDate) : ""}
                {entry.startDate && entry.endDate ? " – " : ""}
                {entry.endDate ? formatMonthYear(entry.endDate) : ""}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
