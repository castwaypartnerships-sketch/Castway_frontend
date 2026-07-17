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
import { Switch } from "@/components/ui/switch";
import { initialsFromName } from "@/lib/format";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [openForCollaboration, setOpenForCollaboration] = useState(false);
  const [lookingToHire, setLookingToHire] = useState(false);
  const [availableForWork, setAvailableForWork] = useState(false);

  const { data, isFetching, isError } = useSearchProfilesQuery({
    query: query.trim() || undefined,
    category: category.trim() || undefined,
    location: location.trim() || undefined,
    openForCollaboration: openForCollaboration || undefined,
    lookingToHire: lookingToHire || undefined,
    availableForWork: availableForWork || undefined,
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
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Fashion, Tech, Fitness"
            />
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
