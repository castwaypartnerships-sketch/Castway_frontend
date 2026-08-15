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
  X,
} from "lucide-react";
import { FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa6";
import { motion } from "framer-motion";

import { useGetPublicProfileQuery, type PublicProfileResponse, useGetAcceptedBrandsQuery } from "@/lib/redux/endpoints/search-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useSendConnectionRequestMutation } from "@/lib/redux/endpoints/connections-api";
import { useStartConversationMutation } from "@/lib/redux/endpoints/messages-api";
import { useEndorseSkillMutation } from "@/lib/redux/endpoints/endorsements-api";
import { useGetRepresentingAgenciesQuery, useSetPubliclyListedMutation, useGetMyRosterQuery } from "@/lib/redux/endpoints/roster-api";
import { useToggleFollowMutation } from "@/lib/redux/endpoints/follow-api";
import { useGetReviewsForUserQuery, useReplyToReviewMutation, useSubmitReviewMutation } from "@/lib/redux/endpoints/reviews-api";
import { useGetClientCampaignsQuery, useGetCampaignsQuery, useAddToShortlistMutation } from "@/lib/redux/endpoints/campaigns-api";
import { useGetClientBrandsQuery } from "@/lib/redux/endpoints/brand-agency-api";
import { useGetPostsByAuthorQuery } from "@/lib/redux/endpoints/feed-api";
import { PostCard } from "@/components/feed/post-card";
import {
  useAddCaseStudyMutation,
  useUpdateCaseStudyMutation,
  useRemoveCaseStudyMutation,
  useUpdateProfileMutation,
} from "@/lib/redux/endpoints/profile-api";
import type { AgencySize, CaseStudy, DateRange, Education, Experience, PortfolioMetric, Profile } from "@/lib/types/profile";
import type { RosterEntryDto } from "@/lib/types/roster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileCompletionCard } from "@/components/feed/profile-completion-card";
import { initialsFromName, formatRelativeTime } from "@/lib/format";
import { isImageUrl } from "@/lib/upload-image";
import { InlineImageUpload } from "@/components/upload/inline-image-upload";
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
  const [startConversation, { isLoading: isMessaging }] = useStartConversationMutation();
  const [toggleFollow, { isLoading: isTogglingFollow }] = useToggleFollowMutation();

  const [activeTab, setActiveTab] = useState("overview");
  const [postsPage, setPostsPage] = useState(1);
  const { data: postsData, isFetching: isFetchingPosts } = useGetPostsByAuthorQuery({
    userId: profile.userId,
    page: postsPage,
  });
  const [selectedClientBrandUserId, setSelectedClientBrandUserId] = useState<string | null>(null);
  const [caseStudyDialogOpen, setCaseStudyDialogOpen] = useState(false);
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | undefined>(undefined);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
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
  // Case Studies filtering
  // --------------------------------------------------------------------------
  const hasRealCaseStudies = profile.caseStudies && profile.caseStudies.length > 0;
  const displayCaseStudies = profile.caseStudies;

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
        campaignTag: "COMPLETED CAMPAIGN",
        timeAgo: formatRelativeTime(rev.createdAt),
        comment: rev.comment ?? "",
        helpfulCount: 0,
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

              {/* Collaboration FAQs */}
              {(() => {
                const hasFaqs = profile.faqs && (profile.faqs.minBudget || profile.faqs.paymentTimelines || profile.faqs.industriesServed);
                if (!hasFaqs && !isOwnProfile) return null;

                return (
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 relative">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Collaboration FAQs</h2>
                      {isOwnProfile && (
                        <button
                          onClick={() => setFaqDialogOpen(true)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md"
                          title="Edit FAQs"
                        >
                          <Pencil className="size-4" />
                        </button>
                      )}
                    </div>

                    {!hasFaqs ? (
                      <div className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-3">
                        <span>No FAQs set yet.</span>
                        {isOwnProfile && (
                          <Button
                            size="sm"
                            onClick={() => setFaqDialogOpen(true)}
                            className="bg-[#1F5F3F] text-white hover:bg-[#1A4F35] font-semibold text-xs rounded-xl"
                          >
                            Set FAQ Terms
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
                        {profile.faqs?.minBudget && (
                          <div className="space-y-1">
                            <h4 className="font-bold text-foreground flex items-center gap-1.5">
                              <Star className="size-3.5 text-[#1F5F3F] dark:text-[#a7d9b5]" />
                              Minimum Project Budget
                            </h4>
                            <p className="pl-5 text-muted-foreground font-medium">{profile.faqs.minBudget}</p>
                          </div>
                        )}
                        {profile.faqs?.paymentTimelines && (
                          <div className="space-y-1">
                            <h4 className="font-bold text-foreground flex items-center gap-1.5">
                              <Clock className="size-3.5 text-[#1F5F3F] dark:text-[#a7d9b5]" />
                              Payment Timelines
                            </h4>
                            <p className="pl-5 text-muted-foreground font-medium">{profile.faqs.paymentTimelines}</p>
                          </div>
                        )}
                        {profile.faqs?.industriesServed && (
                          <div className="space-y-1">
                            <h4 className="font-bold text-foreground flex items-center gap-1.5">
                              <Globe className="size-3.5 text-[#1F5F3F] dark:text-[#a7d9b5]" />
                              Industries Served
                            </h4>
                            <p className="pl-5 text-muted-foreground font-medium whitespace-pre-wrap">{profile.faqs.industriesServed}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Right Sidebar Area */}
            <div className="space-y-5">
              {/* Contact & Inquiries CTA Widget */}
              {(() => {
                const hasWhatsApp = !!profile.contactNumber;
                const hasEmail = !!profile.businessEmail;
                const hasAnyContact = hasWhatsApp || hasEmail;

                if (!hasAnyContact && !isOwnProfile) return null;

                const cleanPhone = profile.contactNumber ? profile.contactNumber.replace(/[^0-9]/g, "") : "";
                const whatsappUrl = `https://wa.me/${cleanPhone}`;
                const emailUrl = `mailto:${profile.businessEmail}`;
                const bookingUrl = hasWhatsApp
                  ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hi! I'd like to book a call with your agency to discuss a potential collaboration.")}`
                  : `mailto:${profile.businessEmail}?subject=${encodeURIComponent("Booking Inquiry")}&body=${encodeURIComponent("Hi! I'd like to book a call with your agency to discuss a potential collaboration.")}`;

                function handleInquiryClick() {
                  if (!session || !session.user) {
                    router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
                  } else {
                    handleMessage();
                  }
                }

                return (
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2 flex items-center justify-between">
                      <span>Contact Agency</span>
                      {isOwnProfile && (
                        <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">Owner Preview</span>
                      )}
                    </h4>

                    <div className="space-y-2.5">
                      {/* Inquiry CTA */}
                      <div className="w-full cursor-not-allowed" title={isOwnProfile ? "Action disabled in Owner Preview" : undefined}>
                        <Button
                          onClick={handleInquiryClick}
                          disabled={isMessaging || isOwnProfile}
                          className="w-full bg-[#1F5F3F] text-white hover:bg-[#1A4F35] font-semibold text-xs py-2 h-9 rounded-xl flex items-center justify-center gap-1.5 shadow-sm border-0 disabled:opacity-50 pointer-events-none"
                        >
                          <MessageCircle className="size-4" />
                          Send Inquiry (In-App)
                        </Button>
                      </div>

                      {/* Book Call CTA */}
                      {(hasWhatsApp || hasEmail) && (
                        isOwnProfile ? (
                          <div className="w-full cursor-not-allowed" title="Action disabled in Owner Preview">
                            <Button
                              variant="outline"
                              disabled
                              className="w-full font-semibold text-xs py-2 h-9 rounded-xl flex items-center justify-center gap-1.5 border-border disabled:opacity-50 pointer-events-none"
                            >
                              <Calendar className="size-4 text-[#1F5F3F] dark:text-[#a7d9b5]" />
                              Book a Call
                            </Button>
                          </div>
                        ) : (
                          <a
                            href={bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              "w-full font-semibold text-xs py-2 h-9 rounded-xl flex items-center justify-center gap-1.5 border-border hover:bg-muted/40"
                            )}
                          >
                            <Calendar className="size-4 text-[#1F5F3F] dark:text-[#a7d9b5]" />
                            Book a Call
                          </a>
                        )
                      )}

                      {/* Secondary Contact Actions Grid */}
                      {hasAnyContact && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {hasWhatsApp && (
                            isOwnProfile ? (
                              <div className="w-full cursor-not-allowed" title="Action disabled in Owner Preview">
                                <Button
                                  variant="outline"
                                  disabled
                                  className="font-semibold text-xs py-2 h-9 rounded-xl flex items-center justify-center gap-1.5 border-border disabled:opacity-50 pointer-events-none text-center w-full"
                                >
                                  WhatsApp
                                </Button>
                              </div>
                            ) : (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  buttonVariants({ variant: "outline" }),
                                  "font-semibold text-xs py-2 h-9 rounded-xl flex items-center justify-center gap-1.5 border-border hover:bg-muted/40 text-center"
                                )}
                              >
                                WhatsApp
                              </a>
                            )
                          )}
                          {hasEmail && (
                            isOwnProfile ? (
                              <div className="w-full cursor-not-allowed" title="Action disabled in Owner Preview">
                                <Button
                                  variant="outline"
                                  disabled
                                  className="font-semibold text-xs py-2 h-9 rounded-xl flex items-center justify-center gap-1.5 border-border disabled:opacity-50 pointer-events-none text-center w-full"
                                >
                                  Direct Email
                                </Button>
                              </div>
                            ) : (
                              <a
                                href={emailUrl}
                                className={cn(
                                  buttonVariants({ variant: "outline" }),
                                  "font-semibold text-xs py-2 h-9 rounded-xl flex items-center justify-center gap-1.5 border-border hover:bg-muted/40 text-center"
                                )}
                              >
                                Direct Email
                              </a>
                            )
                          )}
                        </div>
                      )}

                      {isOwnProfile && (
                        <p className="text-[10px] text-muted-foreground text-center italic mt-1.5">
                          {hasAnyContact 
                            ? "Action buttons are disabled in Owner Preview."
                            : "Provide a phone number or business email in your profile settings to enable booking, email, and WhatsApp CTAs."
                          }
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

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
                        href={`/profile/${talent.name.toLowerCase().replace(" ", "")}`}
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
          <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No campaigns yet.
          </p>
        </TabsContent>

        {/* ------------------------------------------------------------------
            TAB 5: REVIEWS
            ------------------------------------------------------------------ */}
        <TabsContent value="reviews" className="outline-none mt-0">
          {!hasRealReviews ? (
            <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No reviews yet.
            </p>
          ) : (
            <div className="space-y-5">
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
          )}
        </TabsContent>

      </Tabs>
      {caseStudyDialogOpen && (
        <CaseStudyDialog
          key={editingCaseStudy?.id ?? "new"}
          open={caseStudyDialogOpen}
          onOpenChange={setCaseStudyDialogOpen}
          caseStudy={editingCaseStudy}
          isOwnProfile={isOwnProfile}
        />
      )}
      {faqDialogOpen && (
        <FAQDialog
          open={faqDialogOpen}
          onOpenChange={setFaqDialogOpen}
          profile={profile}
        />
      )}
      {!isOwnProfile && reviewDialogOpen && (
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
  isOwnProfile = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present in edit mode, undefined when adding a new case study. */
  caseStudy?: CaseStudy;
  isOwnProfile?: boolean;
}) {
  const isEditing = !!caseStudy;
  const [title, setTitle] = useState(caseStudy?.title ?? "");
  const [objective, setObjective] = useState(caseStudy?.objective ?? "");
  const [brief, setBrief] = useState(caseStudy?.brief ?? "");
  const [action, setAction] = useState(caseStudy?.action ?? "");
  const [result, setResult] = useState(caseStudy?.result ?? "");
  const [metrics, setMetrics] = useState<PortfolioMetric[]>(caseStudy?.metrics ?? []);
  const [brandUserId, setBrandUserId] = useState<string | null>(caseStudy?.brandUserId ?? null);
  const [manualBrandName, setManualBrandName] = useState<string | null>(caseStudy?.manualBrandName ?? null);
  const [manualBrandLogoUrl, setManualBrandLogoUrl] = useState<string | null>(caseStudy?.manualBrandLogoUrl ?? null);
  const [isManualBrand, setIsManualBrand] = useState(!!caseStudy?.manualBrandName);

  const [deliverables, setDeliverables] = useState<string[]>(caseStudy?.deliverables ?? []);
  const [creators, setCreators] = useState<string[]>(caseStudy?.creators ?? []);
  const [media, setMedia] = useState<string[]>(caseStudy?.media ?? []);
  const [newDeliverable, setNewDeliverable] = useState("");

  const { data: acceptedBrands } = useGetAcceptedBrandsQuery();
  const { data: roster } = useGetMyRosterQuery();

  const rosterCreators = (roster?.items ?? [])
    .filter((r) => r.status === "ACCEPTED" && r.member)
    .map((r) => r.member!);

  const [addCaseStudy, { isLoading: isAdding }] = useAddCaseStudyMutation();
  const [updateCaseStudy, { isLoading: isUpdating }] = useUpdateCaseStudyMutation();
  const [removeCaseStudy, { isLoading: isRemoving }] = useRemoveCaseStudyMutation();
  const isSaving = isAdding || isUpdating;

  if (!isOwnProfile && caseStudy) {
    const brandName = caseStudy.manualBrandName || acceptedBrands?.items?.find((b: any) => b.brandUserId === caseStudy.brandUserId)?.name || "";
    const brandLogo = caseStudy.manualBrandLogoUrl || acceptedBrands?.items?.find((b: any) => b.brandUserId === caseStudy.brandUserId)?.avatarUrl || "";

    // Resolve creator details
    const taggedCreators = (caseStudy.creators || []).map(cid => {
      const entry = roster?.items?.find(r => r.member?.userId === cid);
      return entry?.member;
    }).filter(Boolean);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto space-y-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{caseStudy.title}</DialogTitle>
          </DialogHeader>

          {/* Media Showcase */}
          {caseStudy.media && caseStudy.media.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {caseStudy.media.map((url, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-border/80 bg-muted">
                  {isImageUrl(url) ? (
                    <img src={url} alt={`Campaign detail ${i+1}`} className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex flex-col items-center justify-center p-3 text-center">
                      <FileText className="size-6 text-muted-foreground/60" />
                      <a href={url} target="_blank" rel="noreferrer" className="text-xs text-[#476948] dark:text-[#a7d9b5] hover:underline mt-1 truncate max-w-full">
                        View Attachment
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Objective */}
          {caseStudy.objective && (
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Objective</h4>
              <p className="text-xs text-foreground leading-relaxed">{caseStudy.objective}</p>
            </div>
          )}

          {/* Narrative grid */}
          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Brief / Challenge</h4>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{caseStudy.brief}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Action / Strategy</h4>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{caseStudy.action}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Result / Outcome</h4>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{caseStudy.result}</p>
            </div>
          </div>

          {/* Tagged Brand */}
          {(brandName || brandLogo) && (
            <div className="border-t border-border/40 pt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Partner Brand</span>
              <div className="flex items-center gap-2">
                {brandLogo && <img src={brandLogo} alt={brandName} className="size-5 object-contain" />}
                <span className="text-xs font-semibold text-foreground">{brandName}</span>
              </div>
            </div>
          )}

          {/* Creators Involved */}
          {taggedCreators.length > 0 && (
            <div className="border-t border-border/40 pt-3 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Creators Involved</span>
              <div className="flex flex-wrap gap-3">
                {taggedCreators.map((creator: any) => (
                  <Link key={creator.userId} href={`/profile/${creator.username}`} className="flex items-center gap-1.5 hover:opacity-85 transition">
                    <Avatar className="size-6">
                      <AvatarImage src={creator.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-[9px] bg-muted/80">{initialsFromName(creator.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-semibold text-[#476948] dark:text-[#a7d9b5] hover:underline">{creator.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {caseStudy.deliverables && caseStudy.deliverables.length > 0 && (
            <div className="border-t border-border/40 pt-3 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Deliverables</span>
              <div className="flex flex-wrap gap-1.5">
                {caseStudy.deliverables.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[10px] font-bold px-2.5 py-0.5">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {caseStudy.metrics && caseStudy.metrics.length > 0 && (
            <div className="border-t border-border/40 pt-3 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Metrics</span>
              <div className="grid grid-cols-2 gap-2 text-center">
                {caseStudy.metrics.map((metric, i) => (
                  <div key={i} className="border border-border/60 rounded-xl p-2.5 bg-muted/10 space-y-0.5">
                    <p className="text-sm font-extrabold text-[#1F5F3F] dark:text-[#a7d9b5] leading-none">{metric.value}</p>
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function updateMetric(index: number, field: "label" | "value", value: string) {
    setMetrics((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function addDeliverable() {
    const val = newDeliverable.trim();
    if (val && !deliverables.includes(val)) {
      setDeliverables([...deliverables, val]);
      setNewDeliverable("");
    }
  }

  function removeDeliverable(idx: number) {
    setDeliverables(deliverables.filter((_, i) => i !== idx));
  }

  function addMedia(url: string) {
    if (url && !media.includes(url)) {
      setMedia([...media, url]);
    }
  }

  function removeMedia(url: string) {
    setMedia(media.filter((u) => u !== url));
  }

  function toggleCreator(userId: string) {
    setCreators((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cleanMetrics = metrics.filter((m) => m.label.trim() && m.value.trim());
    const input = {
      title: title.trim(),
      brief: brief.trim(),
      action: action.trim(),
      result: result.trim(),
      metrics: cleanMetrics,
      brandUserId: isManualBrand ? null : (brandUserId || undefined),
      manualBrandName: isManualBrand ? (manualBrandName?.trim() || undefined) : null,
      manualBrandLogoUrl: isManualBrand ? (manualBrandLogoUrl || undefined) : null,
      objective: objective.trim() || null,
      deliverables,
      creators,
      media,
    };
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
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Case study details" : "Add new case study"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cs-title">Campaign Name / Title</Label>
            <Input id="cs-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Summer Product Launch" required />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="cs-objective">Campaign Objective (Optional)</Label>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">What we aimed to achieve</span>
            </div>
            <Textarea
              id="cs-objective"
              placeholder="What we aimed to achieve (e.g. Increase brand awareness by 20% among Gen-Z, drive product trials)"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cs-brief">Brief</Label>
            <Textarea
              id="cs-brief"
              placeholder="Background / The client's problem (e.g. Client wanted to launch a new product line with zero search footprint)"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              required
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="cs-action">Action</Label>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">What we did</span>
            </div>
            <Textarea
              id="cs-action"
              placeholder="What we did (e.g. Partnered with 5 micro-influencers to create authentic video content, ran a 2-week giveaway)"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              required
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cs-result">Result</Label>
            <Textarea
              id="cs-result"
              placeholder="The outcome of the campaign (e.g. Campaign generated 1.2M views, 50k clicks, and 5% conversion rate)"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              required
              rows={2}
            />
          </div>

          {/* Roster Creators Multi-select Selection */}
          {rosterCreators && rosterCreators.length > 0 && (
            <div className="space-y-1.5 border-t border-border/40 pt-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creators Involved (Optional)</Label>
              <div className="max-h-36 overflow-y-auto rounded-lg border border-border bg-muted/20 p-2 space-y-1.5">
                {rosterCreators.map((creator) => {
                  const isChecked = creators.includes(creator.userId);
                  return (
                    <label key={creator.userId} className="flex items-center gap-2 cursor-pointer hover:bg-muted/40 p-1.5 rounded-md transition-colors text-xs font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCreator(creator.userId)}
                        className="rounded border-input text-[#1F5F3F] focus:ring-[#1F5F3F] size-3.5"
                      />
                      <Avatar className="size-5 shrink-0">
                        <AvatarImage src={creator.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-[8px] bg-muted/80">{initialsFromName(creator.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 truncate">
                        <span>{creator.name}</span>
                        <span className="text-muted-foreground ml-1 text-[10px]">@{creator.username}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deliverables Tags Input */}
          <div className="space-y-1.5 border-t border-border/40 pt-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deliverables (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                placeholder="e.g. 1 Dedicated YouTube Video"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDeliverable();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addDeliverable} className="shrink-0 h-9">
                Add
              </Button>
            </div>
            {deliverables.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {deliverables.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                    {item}
                    <button type="button" onClick={() => removeDeliverable(idx)} className="text-muted-foreground hover:text-foreground">
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Campaign Media Grid Uploads */}
          <div className="space-y-1.5 border-t border-border/40 pt-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Campaign Media (Optional)</Label>
            <div className="grid grid-cols-3 gap-2.5">
              {media.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
                  {isImageUrl(url) ? (
                    <img src={url} alt={`Campaign Media ${idx + 1}`} className="size-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-1 text-center">
                      <FileText className="size-5 text-muted-foreground" />
                      <span className="text-[8px] text-muted-foreground truncate max-w-full">File</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(url)}
                    className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {media.length < 10 && (
                <InlineImageUpload
                  kind="portfolio"
                  imageUrl=""
                  onUploaded={addMedia}
                  className="aspect-video w-full"
                />
              )}
            </div>
          </div>

          <div className="space-y-2 border-t border-border/40 pt-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tag Brand (Optional)</Label>
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Button
                type="button"
                variant={isManualBrand ? "outline" : "default"}
                size="xs"
                className="flex-1 text-[11px]"
                onClick={() => {
                  setIsManualBrand(false);
                  setManualBrandName(null);
                  setManualBrandLogoUrl(null);
                }}
              >
                On Castway
              </Button>
              <Button
                type="button"
                variant={isManualBrand ? "default" : "outline"}
                size="xs"
                className="flex-1 text-[11px]"
                onClick={() => {
                  setIsManualBrand(true);
                  setBrandUserId(null);
                }}
              >
                Brand not on Castway
              </Button>
            </div>

            {isManualBrand ? (
              <div className="space-y-2 pl-1.5 border-l-2 border-border/60">
                <div className="space-y-1">
                  <Label htmlFor="manual-brand-tag-name" className="text-xs">Brand Name</Label>
                  <Input
                    id="manual-brand-tag-name"
                    placeholder="e.g. Pepsi"
                    value={manualBrandName || ""}
                    onChange={(e) => setManualBrandName(e.target.value || null)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Brand Logo</Label>
                  <InlineImageUpload
                    kind="portfolio"
                    imageUrl={manualBrandLogoUrl || ""}
                    onUploaded={setManualBrandLogoUrl}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1 pl-1.5 border-l-2 border-border/60">
                <Label htmlFor="platform-brand-tag-select" className="text-xs">Select Connected Brand</Label>
                <select
                  id="platform-brand-tag-select"
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm h-8"
                  value={brandUserId || ""}
                  onChange={(e) => setBrandUserId(e.target.value || null)}
                >
                  <option value="">Choose a brand...</option>
                  {(acceptedBrands?.items || []).map((b: any) => (
                    <option key={b.brandUserId} value={b.brandUserId}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
   FAQ EDIT DIALOG — Agency Profile "Overview" tab
   ========================================================================== */
function FAQDialog({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}) {
  const [minBudget, setMinBudget] = useState(profile.faqs?.minBudget ?? "");
  const [paymentTimelines, setPaymentTimelines] = useState(profile.faqs?.paymentTimelines ?? "");
  const [industriesServed, setIndustriesServed] = useState(profile.faqs?.industriesServed ?? "");

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await updateProfile({
        faqs: {
          minBudget: minBudget.trim() || null,
          paymentTimelines: paymentTimelines.trim() || null,
          industriesServed: industriesServed.trim() || null,
        }
      }).unwrap();
      toast.success("FAQs updated");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't save FAQs. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Collaboration FAQs</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="faq-budget">Minimum Project Budget</Label>
            <Input id="faq-budget" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} placeholder="e.g. $5,000 USD" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="faq-timelines">Payment Timelines</Label>
            <Input id="faq-timelines" value={paymentTimelines} onChange={(e) => setPaymentTimelines(e.target.value)} placeholder="e.g. Net 30, 50% upfront" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="faq-industries">Industries Served</Label>
            <Textarea id="faq-industries" value={industriesServed} onChange={(e) => setIndustriesServed(e.target.value)} placeholder="e.g. Tech, Beauty, Gaming, Lifestyle" rows={3} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save changes"}
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

  const { data: reviewsData } = useGetReviewsForUserQuery(profile.userId);

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
