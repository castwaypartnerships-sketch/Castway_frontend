"use client";

import { use, useState } from "react";
import { FileText, Heart, Link2, MessageCircle, Rss } from "lucide-react";

import { useGetMediaKitQuery } from "@/lib/redux/endpoints/search-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/profile/trust-badge";
import { initialsFromName } from "@/lib/format";
import { isImageUrl } from "@/lib/upload-image";

export default function MediaKitPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { data, isLoading, isError } = useGetMediaKitQuery(username);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-muted" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-6">
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          This media kit doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const { profile, isVerified, trustScore, reviewSummary, availability, endorsementCounts, postStats } = data;

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Media Kit</h1>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyLink}>
          <Link2 className="size-4" />
          {copied ? "Link copied" : "Copy link to share"}
        </Button>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarImage src={profile.avatarUrl ?? undefined} />
            <AvatarFallback>{initialsFromName(profile.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">
              @{profile.username}
              {profile.location ? ` · ${profile.location}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TrustBadge isVerified={isVerified} trustScore={trustScore} reviewSummary={reviewSummary} />
          {profile.availableForWork ? (
            <Badge variant={availability.isAvailableNow ? "default" : "outline"}>
              {availability.isAvailableNow ? "Available now" : "Currently booked"}
            </Badge>
          ) : null}
        </div>

        {profile.bio ? <p className="text-sm text-foreground">{profile.bio}</p> : null}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile icon={Rss} value={postStats.postsCount} label="Posts" />
        <StatTile icon={Heart} value={postStats.totalLikes} label="Total Likes" />
        <StatTile icon={MessageCircle} value={postStats.totalComments} label="Total Comments" />
      </div>

      {profile.skills.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
                {endorsementCounts[skill] ? ` · ${endorsementCounts[skill]} endorsed` : ""}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {profile.portfolioItems.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Past Work</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profile.portfolioItems.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border border-border bg-card">
                {isImageUrl(item.imageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.title} className="aspect-square w-full object-cover" />
                ) : (
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex aspect-square w-full items-center justify-center gap-1.5 bg-muted text-xs text-muted-foreground hover:underline"
                  >
                    <FileText className="size-4" />
                    View file
                  </a>
                )}
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-foreground">{item.title}</p>
                  {item.metrics && item.metrics.length > 0 ? (
                    <p className="truncate text-[11px] font-medium text-primary">
                      {item.metrics.map((m) => `${m.value} ${m.label}`).join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Rss;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <Icon className="mx-auto size-4.5 text-primary" />
      <p className="mt-2 text-xl font-semibold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
