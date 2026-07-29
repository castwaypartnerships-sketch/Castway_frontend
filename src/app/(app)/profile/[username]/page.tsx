"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Camera,
  GraduationCap,
  Globe,
  ImageIcon,
  Languages,
  Plus,
  Video,
} from "lucide-react";

import { useGetPublicProfileQuery } from "@/lib/redux/endpoints/search-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useSendConnectionRequestMutation } from "@/lib/redux/endpoints/connections-api";
import { useStartConversationMutation } from "@/lib/redux/endpoints/messages-api";
import { useEndorseSkillMutation } from "@/lib/redux/endpoints/endorsements-api";
import { useGetRepresentingAgenciesQuery, useSetPubliclyListedMutation } from "@/lib/redux/endpoints/roster-api";
import { useToggleFollowMutation } from "@/lib/redux/endpoints/follow-api";
import type { DateRange, Education, Experience } from "@/lib/types/profile";
import type { RosterEntryDto } from "@/lib/types/roster";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrustBadge } from "@/components/profile/trust-badge";
import { ResponseTimeBadge } from "@/components/profile/response-time-badge";
import { Switch } from "@/components/ui/switch";
import { initialsFromName } from "@/lib/format";
import { cn } from "@/lib/utils";

function formatMonthYear(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

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
              {profile.headline ? (
                <p className="text-sm text-foreground">{profile.headline}</p>
              ) : null}
              <p className="text-sm text-muted-foreground">
                @{profile.username}
                {profile.location ? ` · ${profile.location}` : ""}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{followerCount}</span> followers ·{" "}
                <span className="font-medium text-foreground">{followingCount}</span> following
              </p>
              {managedByAgency ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Managed by{" "}
                  <Link href={`/profile/${managedByAgency.username}`} className="font-medium text-foreground hover:underline">
                    {managedByAgency.name}
                  </Link>
                </p>
              ) : null}
              {representingAgencies && representingAgencies.items.length > 0 ? (
                <div className="mt-1 space-y-1">
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
                  variant={viewerIsFollowing ? "outline" : "default"}
                  disabled={isTogglingFollow}
                  onClick={() => toggleFollow({ userId: profile.userId, username: profile.username })}
                >
                  {viewerIsFollowing ? "Following" : "Follow"}
                </Button>
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
          <ResponseTimeBadge responseTime={responseTime} />
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

        {profile.availableForWork ? <AvailabilityCalendar ranges={profile.unavailableRanges} /> : null}

        {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) ? (
          <div className="flex flex-wrap items-center gap-3">
            {profile.socialLinks.instagram ? (
              <SocialLink href={profile.socialLinks.instagram} icon={Camera} label="Instagram" />
            ) : null}
            {profile.socialLinks.youtube ? (
              <SocialLink href={profile.socialLinks.youtube} icon={Video} label="YouTube" />
            ) : null}
            {profile.socialLinks.linkedin ? (
              <SocialLink href={profile.socialLinks.linkedin} icon={Briefcase} label="LinkedIn" />
            ) : null}
            {profile.socialLinks.website ? (
              <SocialLink href={profile.socialLinks.website} icon={Globe} label="Website" />
            ) : null}
          </div>
        ) : null}

        {profile.bio ? <p className="text-sm text-foreground">{profile.bio}</p> : null}

        {profile.creatorCategory ? (
          <Badge variant="secondary">{profile.creatorCategory}</Badge>
        ) : null}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          {profile.rateCardItems.length > 0 || profile.minRate || profile.maxRate ? (
            <TabsTrigger value="rates">Rates</TabsTrigger>
          ) : null}
          {profile.caseStudies.length > 0 ? (
            <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          ) : null}
          {openOpportunities.length > 0 ? (
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="overview" className="mt-5 space-y-5">
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

          {profile.subSpecializations.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Sub-specializations</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.subSpecializations.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
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

          {profile.languages.length > 0 ? (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Languages className="size-3.5" />
                Languages
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.languages.map((language) => (
                  <Badge key={language} variant="outline">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {profile.skills.length === 0 &&
          profile.subSpecializations.length === 0 &&
          profile.services.length === 0 &&
          profile.languages.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              Nothing to show here yet.
            </p>
          ) : null}
        </TabsContent>

        <TabsContent value="experience" className="mt-5 space-y-5">
          <ExperienceList entries={profile.experience} />
          <EducationList entries={profile.education} />
          {profile.experience.length === 0 && profile.education.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No experience or education added yet.
            </p>
          ) : null}
        </TabsContent>

        <TabsContent value="portfolio" className="mt-5">
          {profile.portfolioItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {profile.portfolioItems.map((item) => (
                <a
                  key={item.id}
                  href={item.link ?? undefined}
                  target={item.link ? "_blank" : undefined}
                  rel={item.link ? "noreferrer" : undefined}
                  className="group overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div
                    role="img"
                    aria-label={item.title}
                    className="aspect-square w-full bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  />
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
          ) : (
            <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No portfolio items yet.
            </p>
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
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
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
              <div key={item.id} className="rounded-xl border border-border bg-card p-4">
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
                className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/50"
              >
                <p className="text-sm font-medium text-foreground">{opportunity.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{opportunity.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {opportunity.category ? <Badge variant="outline">{opportunity.category}</Badge> : null}
                  {opportunity.budget ? (
                    <span className="text-xs font-medium text-primary">{opportunity.budget}</span>
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
    <ul className="space-y-1.5">
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

function SocialLink({
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
      aria-label={label}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
    >
      <Icon className="size-3.5" />
      {label}
    </a>
  );
}

function ExperienceList({ entries }: { entries: Experience[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-foreground">Experience</h2>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-xl border border-border bg-card p-3">
            <p className="text-sm font-medium text-foreground">
              {entry.title} · {entry.company}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatMonthYear(entry.startDate)}
              {" – "}
              {entry.current ? "Present" : entry.endDate ? formatMonthYear(entry.endDate) : "Present"}
            </p>
            {entry.description ? (
              <p className="mt-1 text-xs text-muted-foreground">{entry.description}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EducationList({ entries }: { entries: Education[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <GraduationCap className="size-4" />
        Education
      </h2>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-xl border border-border bg-card p-3">
            <p className="text-sm font-medium text-foreground">{entry.school}</p>
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
