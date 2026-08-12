"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import {
  useGetManagedTalentActivityQuery,
  useGetManagedTalentQuery,
  useUpdateManagedTalentProfileMutation,
  type ManagedTalentActivityApplication,
  type ManagedTalentActivityConnection,
  type ManagedTalentActivityPost,
} from "@/lib/redux/endpoints/managed-talent-api";
import type { ManagedTalentProfile } from "@/lib/redux/endpoints/managed-talent-api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUpload } from "@/components/upload/avatar-upload";
import { CoverUpload } from "@/components/upload/cover-upload";
import { ActivityBarChart } from "@/components/managed-talent/activity-bar-chart";
import { cn } from "@/lib/utils";

export default function ManagedTalentEditPage() {
  const { talentUserId } = useParams<{ talentUserId: string }>();
  const { data, isLoading } = useGetManagedTalentQuery();
  const talent = data?.items.find((p) => p.userId === talentUserId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div className="flex items-center gap-2">
        <Link
          href="/roster/managed"
          aria-label="Back to managed talent"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            {talent ? talent.name : "Managed talent"}
          </h1>
          {talent ? <p className="text-sm text-muted-foreground">@{talent.username}</p> : null}
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : !talent ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Managed talent not found.
        </p>
      ) : (
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList variant="line" className="h-auto w-max justify-start gap-1 rounded-none border-b border-border/60 bg-transparent p-0">
            <TabsTrigger value="profile" className="rounded-none px-2 py-1.5">
              Profile
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-none px-2 py-1.5">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0 outline-none">
            <ProfileForm talent={talent} />
          </TabsContent>
          <TabsContent value="activity" className="mt-0 outline-none">
            <ActivityTab talentUserId={talentUserId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function ProfileForm({ talent }: { talent: ManagedTalentProfile }) {
  const [updateProfile, { isLoading }] = useUpdateManagedTalentProfileMutation();
  const [updatePhoto] = useUpdateManagedTalentProfileMutation();
  const isCreator = talent.role === "CREATOR";

  const [name, setName] = useState(talent.name);
  const [headline, setHeadline] = useState(talent.headline ?? "");
  const [bio, setBio] = useState(talent.bio ?? "");
  const [location, setLocation] = useState(talent.location ?? "");
  const [contactNumber, setContactNumber] = useState(talent.contactNumber ?? "");
  const [username, setUsername] = useState(talent.username);
  const [category, setCategory] = useState(talent.creatorCategory ?? "");
  const [skills, setSkills] = useState(talent.skills.join(", "));
  const [services, setServices] = useState(talent.services.join(", "));
  const [languages, setLanguages] = useState(talent.languages.join(", "));
  const [minRate, setMinRate] = useState(talent.minRate?.toString() ?? "");
  const [maxRate, setMaxRate] = useState(talent.maxRate?.toString() ?? "");
  const [openForCollaboration, setOpenForCollaboration] = useState(talent.openForCollaboration);
  const [availableForWork, setAvailableForWork] = useState(talent.availableForWork);
  const [instagramFollowers, setInstagramFollowers] = useState(talent.instagramFollowers?.toString() ?? "");
  const [youtubeFollowers, setYoutubeFollowers] = useState(talent.youtubeFollowers?.toString() ?? "");
  const [twitchFollowers, setTwitchFollowers] = useState(talent.twitchFollowers?.toString() ?? "");
  const [twitterFollowers, setTwitterFollowers] = useState(talent.twitterFollowers?.toString() ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timeout = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(timeout);
  }, [saved]);

  async function handleAvatarUploaded(avatarUrl: string | null) {
    try {
      await updatePhoto({ talentUserId: talent.userId, input: { avatarUrl } }).unwrap();
      toast.success(avatarUrl ? "Profile photo updated" : "Profile photo removed");
    } catch {
      toast.error("Couldn't save that profile photo. Please try again.");
    }
  }

  async function handleCoverUploaded(coverImageUrl: string | null) {
    try {
      await updatePhoto({ talentUserId: talent.userId, input: { coverImageUrl } }).unwrap();
      toast.success(coverImageUrl ? "Cover photo updated" : "Cover photo removed");
    } catch {
      toast.error("Couldn't save that cover photo. Please try again.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateProfile({
        talentUserId: talent.userId,
        input: {
          name,
          headline,
          bio,
          location,
          contactNumber,
          username,
          instagramFollowers: instagramFollowers.trim() ? Number(instagramFollowers) : null,
          youtubeFollowers: youtubeFollowers.trim() ? Number(youtubeFollowers) : null,
          twitchFollowers: twitchFollowers.trim() ? Number(twitchFollowers) : null,
          twitterFollowers: twitterFollowers.trim() ? Number(twitterFollowers) : null,
          languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          services: services.split(",").map((s) => s.trim()).filter(Boolean),
          ...(isCreator
            ? {
                creatorCategory: category,
                minRate: minRate.trim() ? Number(minRate) : undefined,
                maxRate: maxRate.trim() ? Number(maxRate) : undefined,
                openForCollaboration,
              }
            : { availableForWork }),
        },
      }).unwrap();
      setSaved(true);
    } catch {
      toast.error("Couldn't save that change. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <CoverUpload coverImageUrl={talent.coverImageUrl} onUploaded={handleCoverUploaded} />

      <div className="flex items-center gap-3">
        <AvatarUpload avatarUrl={talent.avatarUrl} name={talent.name} onUploaded={handleAvatarUploaded} />
        <p className="text-xs text-muted-foreground">Click the photo or cover banner to change it.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mt-name">Name</Label>
        <Input id="mt-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mt-username">Username</Label>
        <Input id="mt-username" required value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mt-headline">Headline</Label>
        <Input id="mt-headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mt-bio">Bio</Label>
        <Textarea id="mt-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isCreator ? (
          <div className="space-y-1.5">
            <Label htmlFor="mt-category">Category</Label>
            <Input id="mt-category" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="mt-location">Location</Label>
          <Input id="mt-location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mt-contact">Contact number</Label>
          <Input id="mt-contact" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mt-ig-followers">Instagram Followers</Label>
          <Input id="mt-ig-followers" type="number" min={0} value={instagramFollowers} onChange={(e) => setInstagramFollowers(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mt-yt-followers">YouTube Followers</Label>
          <Input id="mt-yt-followers" type="number" min={0} value={youtubeFollowers} onChange={(e) => setYoutubeFollowers(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mt-twitch-followers">Twitch Followers</Label>
          <Input id="mt-twitch-followers" type="number" min={0} value={twitchFollowers} onChange={(e) => setTwitchFollowers(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mt-twitter-followers">Twitter/X Followers</Label>
          <Input id="mt-twitter-followers" type="number" min={0} value={twitterFollowers} onChange={(e) => setTwitterFollowers(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mt-skills">Skills (comma-separated)</Label>
        <Input id="mt-skills" value={skills} onChange={(e) => setSkills(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mt-services">Services (comma-separated)</Label>
        <Input id="mt-services" value={services} onChange={(e) => setServices(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="mt-languages">Languages (comma-separated)</Label>
        <Input
          id="mt-languages"
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          placeholder="e.g. English, Hindi"
        />
      </div>

      {isCreator ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="mt-rate-min">Typical rate — from</Label>
            <Input id="mt-rate-min" type="number" min={0} value={minRate} onChange={(e) => setMinRate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mt-rate-max">To</Label>
            <Input id="mt-rate-max" type="number" min={0} value={maxRate} onChange={(e) => setMaxRate(e.target.value)} />
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2.5">
        {isCreator ? (
          <>
            <Switch id="mt-open" checked={openForCollaboration} onCheckedChange={setOpenForCollaboration} />
            <Label htmlFor="mt-open">Open for collaboration</Label>
          </>
        ) : (
          <>
            <Switch id="mt-available" checked={availableForWork} onCheckedChange={setAvailableForWork} />
            <Label htmlFor="mt-available">Available for work</Label>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving…" : "Save profile"}
        </Button>
        {saved ? <span className="text-sm text-success">Saved</span> : null}
      </div>
    </form>
  );
}

function ActivityTab({ talentUserId }: { talentUserId: string }) {
  const { data, isLoading } = useGetManagedTalentActivityQuery(talentUserId);

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  }
  if (!data) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        Couldn&apos;t load activity right now.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ActivityBarChart
        posts={data.posts.total}
        applications={data.applications.total}
        connections={data.connections.total}
        messages={data.messaging.totalSent}
      />
      <PostsCard total={data.posts.total} recent={data.posts.recent} />
      <ApplicationsCard total={data.applications.total} recent={data.applications.recent} />
      <ConnectionsCard total={data.connections.total} recent={data.connections.recent} />
      <MessagingCard totalSent={data.messaging.totalSent} lastSentAt={data.messaging.lastSentAt} />
    </div>
  );
}

function ActivityCard({ title, total, children }: { title: string; total: number; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PostsCard({ total, recent }: { total: number; recent: ManagedTalentActivityPost[] }) {
  return (
    <ActivityCard title="Posts created" total={total}>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        <ul className="space-y-2">
          {recent.map((post) => (
            <li key={post.id} className="rounded-xl border border-border p-3">
              <p className="truncate text-sm text-foreground">{post.title ?? post.content}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </ActivityCard>
  );
}

function ApplicationsCard({ total, recent }: { total: number; recent: ManagedTalentActivityApplication[] }) {
  return (
    <ActivityCard title="Opportunities applied to" total={total}>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">No applications yet.</p>
      ) : (
        <ul className="space-y-2">
          {recent.map((application) => (
            <li key={application.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
              <Link href={`/opportunities/${application.opportunityId}`} className="truncate text-sm text-primary hover:underline">
                View opportunity
              </Link>
              <span className="shrink-0 text-xs text-muted-foreground">{application.status}</span>
            </li>
          ))}
        </ul>
      )}
    </ActivityCard>
  );
}

function ConnectionsCard({ total, recent }: { total: number; recent: ManagedTalentActivityConnection[] }) {
  return (
    <ActivityCard title="Connections" total={total}>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground">No connections yet.</p>
      ) : (
        <ul className="space-y-2">
          {recent.map((connection) => (
            <li key={connection.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
              <span className="text-sm text-foreground">
                {new Date(connection.createdAt).toLocaleDateString()}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{connection.status}</span>
            </li>
          ))}
        </ul>
      )}
    </ActivityCard>
  );
}

function MessagingCard({ totalSent, lastSentAt }: { totalSent: number; lastSentAt: string | null }) {
  return (
    <ActivityCard title="Messages sent" total={totalSent}>
      <p className="text-sm text-muted-foreground">
        {lastSentAt ? `Last sent ${new Date(lastSentAt).toLocaleDateString()}` : "No messages sent yet."}
      </p>
    </ActivityCard>
  );
}
