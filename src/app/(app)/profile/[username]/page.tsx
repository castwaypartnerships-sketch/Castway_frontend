"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageIcon, Plus } from "lucide-react";

import { useGetPublicProfileQuery } from "@/lib/redux/endpoints/search-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useSendConnectionRequestMutation } from "@/lib/redux/endpoints/connections-api";
import { useStartConversationMutation } from "@/lib/redux/endpoints/messages-api";
import { useEndorseSkillMutation } from "@/lib/redux/endpoints/endorsements-api";
import { useGetRepresentingAgenciesQuery } from "@/lib/redux/endpoints/roster-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { TrustBadge } from "@/components/profile/trust-badge";
import { initialsFromName } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const { data, isLoading, isError } = useGetPublicProfileQuery(username);
  const { data: session } = useGetSessionQuery();
  const [sendRequest, { isLoading: isConnecting, isSuccess: connected }] =
    useSendConnectionRequestMutation();
  const [startConversation, { isLoading: isMessaging }] = useStartConversationMutation();
  const [endorseSkill, { isLoading: isEndorsing }] = useEndorseSkillMutation();
  const { data: representingAgencies } = useGetRepresentingAgenciesQuery(data?.profile.userId ?? "", {
    skip: !data,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-6 py-6">
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-6">
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          This profile doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const { profile, isVerified, trustScore, reviewSummary, availability, endorsementCounts } = data;
  const isOwnProfile = session?.user?.id === profile.userId;

  async function handleMessage() {
    const conversation = await startConversation(profile.userId).unwrap();
    router.push(`/messages?conversationId=${conversation.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src={profile.avatarUrl ?? undefined} />
              <AvatarFallback>{initialsFromName(profile.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">{profile.name}</h1>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
                {profile.location ? ` · ${profile.location}` : ""}
              </p>
              {representingAgencies && representingAgencies.items.length > 0 ? (
                <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
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
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/media-kit/${profile.username}`}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5")}
            >
              <ImageIcon className="size-4" />
              Media Kit
            </Link>
            {!isOwnProfile ? (
              <>
                <Button
                  size="sm"
                  variant={connected ? "outline" : "default"}
                  disabled={isConnecting || connected}
                  onClick={() => sendRequest(profile.userId)}
                >
                  {connected ? "Requested" : isConnecting ? "Requesting…" : "Connect"}
                </Button>
                <Button size="sm" variant="outline" disabled={isMessaging} onClick={handleMessage}>
                  Message
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TrustBadge isVerified={isVerified} trustScore={trustScore} reviewSummary={reviewSummary} />
          {profile.availableForWork ? (
            <Badge variant={availability.isAvailableNow ? "default" : "outline"}>
              {availability.isAvailableNow
                ? "Available now"
                : availability.nextAvailableDate
                  ? `Booked until ${new Date(availability.nextAvailableDate).toLocaleDateString()}`
                  : "Available now"}
            </Badge>
          ) : null}
        </div>

        {profile.bio ? <p className="text-sm text-foreground">{profile.bio}</p> : null}

        {profile.creatorCategory ? (
          <Badge variant="secondary">{profile.creatorCategory}</Badge>
        ) : null}

        {profile.skills.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => {
                const count = endorsementCounts[skill] ?? 0;
                return (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full border border-border py-1 pr-1 pl-2.5 text-xs text-foreground"
                  >
                    {skill}
                    {count > 0 ? <span className="text-muted-foreground">· {count}</span> : null}
                    {!isOwnProfile ? (
                      <button
                        type="button"
                        aria-label={`Endorse ${skill}`}
                        disabled={isEndorsing}
                        onClick={() => endorseSkill({ userId: profile.userId, username: profile.username, skill })}
                        className="flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        <Plus className="size-3" />
                      </button>
                    ) : null}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {profile.services.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Services</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.services.map((service) => (
                <Badge key={service} variant="outline">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {profile.portfolioItems.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">Portfolio</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profile.portfolioItems.map((item) => (
              <a
                key={item.id}
                href={item.link ?? undefined}
                target={item.link ? "_blank" : undefined}
                rel={item.link ? "noreferrer" : undefined}
                className="group overflow-hidden rounded-xl border border-border bg-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title} className="aspect-square w-full object-cover" />
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-foreground">{item.title}</p>
                  {item.metrics && item.metrics.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
