"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, MapPin, MessageCircle, SearchIcon, Users } from "lucide-react";
import { toast } from "sonner";

import { useSearchProfilesQuery, type SearchProfileItem } from "@/lib/redux/endpoints/search-api";
import { useToggleFollowMutation } from "@/lib/redux/endpoints/follow-api";
import { useStartConversationMutation } from "@/lib/redux/endpoints/messages-api";
import { useComposer } from "@/components/feed/composer-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AccountRoleBadge } from "@/components/shared/account-role-badge";
import { SuggestedConnectionsCard } from "@/components/feed/suggested-connections-card";
import { TrendingSkillsCard } from "@/components/shared/trending-skills-card";
import { NewOpportunitiesCard } from "@/components/shared/new-opportunities-card";
import { initialsFromName } from "@/lib/format";
import { PROFILE_CATEGORY_OPTIONS } from "@/lib/categories";
import type { AgencySize } from "@/lib/types/profile";
import { cn } from "@/lib/utils";

const AGENCY_SIZE_LABEL: Record<AgencySize, string> = {
  SOLO: "Just me",
  SMALL: "2-10 people",
  MEDIUM: "11-50 people",
  LARGE: "51+ people",
};

type QuickFilter = "all" | "creators" | "agencies";

const TALENT_ROLES = new Set(["CREATOR", "FREELANCER"]);
const HIRING_ROLES = new Set(["AGENCY", "BRAND"]);

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { openComposer } = useComposer();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [subSpecializations, setSubSpecializations] = useState("");
  const [openForCollaboration, setOpenForCollaboration] = useState(false);
  const [lookingToHire, setLookingToHire] = useState(false);
  const [availableForWork, setAvailableForWork] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minFollowers, setMinFollowers] = useState("");
  const [rateMin, setRateMin] = useState("");
  const [rateMax, setRateMax] = useState("");
  const [agencySize, setAgencySize] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  const { data, isFetching, isError } = useSearchProfilesQuery({
    query: query.trim() || undefined,
    category: category.trim() || undefined,
    location: location.trim() || undefined,
    skills: skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    subSpecializations: subSpecializations
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    openForCollaboration: openForCollaboration || undefined,
    lookingToHire: lookingToHire || undefined,
    availableForWork: availableForWork || undefined,
    verifiedOnly: verifiedOnly || undefined,
    minFollowers: minFollowers.trim() ? Number(minFollowers) : undefined,
    rateMin: rateMin.trim() ? Number(rateMin) : undefined,
    rateMax: rateMax.trim() ? Number(rateMax) : undefined,
    agencySize: (agencySize as AgencySize) || undefined,
  });

  const items = useMemo(() => {
    if (!data) return [];
    if (quickFilter === "creators") return data.items.filter((p) => TALENT_ROLES.has(p.accountRole));
    if (quickFilter === "agencies") return data.items.filter((p) => HIRING_ROLES.has(p.accountRole));
    return data.items;
  }, [data, quickFilter]);

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Discover</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Find creators, agencies, and collaborators across the network.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link href="/saved" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Saved
            </Link>
            <button
              type="button"
              onClick={openComposer}
              className="flex items-center gap-1.5 rounded-lg bg-[#476948] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
            >
              Create Post
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {(
            [
              { value: "all", label: "All" },
              { value: "creators", label: "Creators" },
              { value: "agencies", label: "Agencies" },
            ] as { value: QuickFilter; label: string }[]
          ).map((tab) => {
            const isActive = tab.value === quickFilter;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setQuickFilter(tab.value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-transparent bg-[#2d4a35] text-white dark:bg-[#25422d]"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, skill, or niche…"
              className="rounded-lg bg-muted pl-9"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Select
                items={{ __any__: "Any category", ...Object.fromEntries(PROFILE_CATEGORY_OPTIONS.map((o) => [o, o])) }}
                value={category || "__any__"}
                onValueChange={(value) => setCategory(!value || value === "__any__" ? "" : value)}
              >
                <SelectTrigger id="category" className="w-full">
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Remote"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Video Editing, UI/UX, Motion Design"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="subSpecializations">Sub-specialization (comma-separated)</Label>
              <Input
                id="subSpecializations"
                value={subSpecializations}
                onChange={(e) => setSubSpecializations(e.target.value)}
                placeholder="e.g. B2B SaaS onboarding, Fintech dashboards"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minFollowers">Minimum followers</Label>
              <Input
                id="minFollowers"
                type="number"
                min={0}
                inputMode="numeric"
                value={minFollowers}
                onChange={(e) => setMinFollowers(e.target.value)}
                placeholder="e.g. 1000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rateMin">Rate — from</Label>
              <Input
                id="rateMin"
                type="number"
                min={0}
                inputMode="numeric"
                value={rateMin}
                onChange={(e) => setRateMin(e.target.value)}
                placeholder="e.g. 500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rateMax">Rate — to</Label>
              <Input
                id="rateMax"
                type="number"
                min={0}
                inputMode="numeric"
                value={rateMax}
                onChange={(e) => setRateMax(e.target.value)}
                placeholder="e.g. 2000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="agencySize">Agency size</Label>
              <Select
                items={{ __any__: "Any size", ...AGENCY_SIZE_LABEL }}
                value={agencySize || "__any__"}
                onValueChange={(value) => setAgencySize(value === "__any__" || !value ? "" : value)}
              >
                <SelectTrigger id="agencySize" className="w-full">
                  <SelectValue placeholder="Any size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Any size</SelectItem>
                  {(Object.keys(AGENCY_SIZE_LABEL) as AgencySize[]).map((size) => (
                    <SelectItem key={size} value={size}>
                      {AGENCY_SIZE_LABEL[size]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
            <div className="flex items-center gap-2.5">
              <Switch
                id="openForCollaboration"
                className="data-checked:bg-[#476948] dark:data-checked:bg-[#1c3322]"
                checked={openForCollaboration}
                onCheckedChange={setOpenForCollaboration}
              />
              <Label htmlFor="openForCollaboration">Open for collaboration</Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Switch
                id="lookingToHire"
                className="data-checked:bg-[#476948] dark:data-checked:bg-[#1c3322]"
                checked={lookingToHire}
                onCheckedChange={setLookingToHire}
              />
              <Label htmlFor="lookingToHire">Looking to hire</Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Switch
                id="availableForWork"
                className="data-checked:bg-[#476948] dark:data-checked:bg-[#1c3322]"
                checked={availableForWork}
                onCheckedChange={setAvailableForWork}
              />
              <Label htmlFor="availableForWork">Open to Work only</Label>
            </div>
            <div className="flex items-center gap-2.5">
              <Switch
                id="verifiedOnly"
                className="data-checked:bg-[#476948] dark:data-checked:bg-[#1c3322]"
                checked={verifiedOnly}
                onCheckedChange={setVerifiedOnly}
              />
              <Label htmlFor="verifiedOnly">Verified only</Label>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {isFetching ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-muted" />
            ))
          ) : isError ? (
            <p className="rounded-2xl border border-dashed border-destructive/40 py-16 text-center text-sm text-destructive">
              Couldn&apos;t load search results.
            </p>
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No profiles match those filters yet.
            </p>
          ) : (
            items.map((profile) => <ProfileCard key={profile.id} profile={profile} />)
          )}
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        <SuggestedConnectionsCard />
        <TrendingSkillsCard />
        <NewOpportunitiesCard />
      </aside>
    </div>
  );
}

function ProfileCard({ profile }: { profile: SearchProfileItem }) {
  const router = useRouter();
  const [toggleFollow, { isLoading: isTogglingFollow }] = useToggleFollowMutation();
  const [startConversation, { isLoading: isMessaging }] = useStartConversationMutation();
  const isHiring = HIRING_ROLES.has(profile.accountRole);
  // `searchProfiles` isn't tag-invalidated by the follow toggle (it's a
  // filtered/paginated list, not a single-entity cache), so the button's
  // state is tracked optimistically here instead of re-reading the prop.
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing);

  async function handleToggleFollow() {
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      await toggleFollow({ userId: profile.userId, username: profile.username }).unwrap();
    } catch {
      setIsFollowing(!next);
      toast.error("Couldn't update follow status. Please try again.");
    }
  }

  async function handleMessage() {
    try {
      await startConversation(profile.userId).unwrap();
      router.push("/messages");
    } catch {
      toast.error("Couldn't start that conversation. Please try again.");
    }
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/profile/${profile.username}`} className="group/person flex min-w-0 flex-1 gap-3">
          <Avatar size="lg" className="size-12 transition-transform group-hover/person:scale-105">
            <AvatarImage src={profile.avatarUrl ?? undefined} />
            <AvatarFallback>{initialsFromName(profile.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-bold text-foreground group-hover/person:underline">{profile.name}</p>
              {profile.verified ? (
                <BadgeCheck className="size-3.5 shrink-0 text-[#476948] dark:text-[#a7d9b5]" />
              ) : null}
            </div>
            <AccountRoleBadge role={profile.accountRole} />
          </div>
        </Link>
      </div>

      {profile.bio ? <p className="mt-3 text-sm text-muted-foreground">{profile.bio}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5" />
          {profile.followerCount.toLocaleString()} followers
        </span>
        {profile.creatorCategory ? <span>{profile.creatorCategory}</span> : null}
        {profile.location ? (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {profile.location}
          </span>
        ) : null}
      </div>

      {profile.skills.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-[11px]">
              {skill}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <Button
          variant="outline"
          size="icon"
          aria-label="Message"
          disabled={isMessaging}
          onClick={() => void handleMessage()}
        >
          <MessageCircle className="size-4" />
        </Button>
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          disabled={isTogglingFollow}
          className={cn(
            !isFollowing && "bg-[#476948] text-white hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d]",
          )}
          onClick={() => void handleToggleFollow()}
        >
          {isFollowing ? "Following" : isHiring ? "Follow Agency" : "Follow"}
        </Button>
      </div>
    </article>
  );
}
