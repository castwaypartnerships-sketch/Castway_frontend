"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BadgeCheck, SearchIcon } from "lucide-react";

import { useSearchProfilesQuery } from "@/lib/redux/endpoints/search-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { initialsFromName } from "@/lib/format";
import { PROFILE_CATEGORY_OPTIONS } from "@/lib/categories";
import type { AgencySize } from "@/lib/types/profile";

const AGENCY_SIZE_LABEL: Record<AgencySize, string> = {
  SOLO: "Just me",
  SMALL: "2-10 people",
  MEDIUM: "11-50 people",
  LARGE: "51+ people",
};

export default function SearchPage() {
  const searchParams = useSearchParams();
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

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-6 py-6">
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Search Professionals</h1>
        <p className="text-sm text-muted-foreground">
          Find creators, freelancers, brands, and agencies across the network.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, username, or skill…"
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select
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
              placeholder="e.g. Video Editing, Copywriting"
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
            <Select value={agencySize || "__any__"} onValueChange={(value) => setAgencySize(value === "__any__" || !value ? "" : value)}>
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

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <div className="flex items-center gap-2.5">
            <Switch
              id="openForCollaboration"
              checked={openForCollaboration}
              onCheckedChange={setOpenForCollaboration}
            />
            <Label htmlFor="openForCollaboration">Open for collaboration</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Switch id="lookingToHire" checked={lookingToHire} onCheckedChange={setLookingToHire} />
            <Label htmlFor="lookingToHire">Looking to hire</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Switch
              id="availableForWork"
              checked={availableForWork}
              onCheckedChange={setAvailableForWork}
            />
            <Label htmlFor="availableForWork">Available for work</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Switch id="verifiedOnly" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
            <Label htmlFor="verifiedOnly">Verified only</Label>
          </div>
        </div>
      </div>

      {isFetching ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-2xl border border-dashed border-destructive/40 py-16 text-center text-sm text-destructive">
          Couldn&apos;t load search results.
        </p>
      ) : !data || data.items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No profiles match those filters yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((profile) => (
            <li key={profile.id}>
              <Link
                href={`/profile/${profile.username}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <Avatar size="lg">
                  <AvatarImage src={profile.avatarUrl ?? undefined} />
                  <AvatarFallback>{initialsFromName(profile.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{profile.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{profile.username}
                    {profile.location ? ` · ${profile.location}` : ""}
                    {` · ${profile.followerCount} followers`}
                  </p>
                  {profile.skills.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {profile.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[11px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
                {profile.availableForWork ? (
                  <Badge variant="outline" className="shrink-0 gap-1">
                    <BadgeCheck className="size-3" />
                    Available
                  </Badge>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
