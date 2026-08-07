"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Globe, MapPin, Tag, Activity, MessageSquare, FileText, File, Folder, Upload, Download, Trash, Shield, History, Percent, CheckCircle, Mail, User, UserCheck, DollarSign, Award, Calendar } from "lucide-react";
import { FaInstagram, FaYoutube, FaTwitch, FaXTwitter } from "react-icons/fa6";
import { toast } from "sonner";

import { useGetProfileByUserIdQuery } from "@/lib/redux/endpoints/profile-api";
import {
  useGetMyRosterQuery,
  useGetTalentNotesQuery,
  useCreateTalentNoteMutation,
  useDeleteTalentNoteMutation,
  useGetTalentDocumentsQuery,
  useCreateTalentDocumentMutation,
  useGetTalentDocumentDownloadUrlMutation,
  useDeleteTalentDocumentMutation,
  useGetTalentContractsQuery,
  useCreateTalentContractMutation,
  useGetTalentContractDownloadUrlMutation,
  useUpdateTalentContractStatusMutation,
  useRenewTalentContractMutation,
  useGetTalentPaymentsQuery,
  useCreateTalentPaymentMutation,
  useGetTalentPaymentDownloadUrlMutation,
  useUpdateTalentPaymentStatusMutation,
  useGetTalentTimelineQuery,
} from "@/lib/redux/endpoints/roster-api";
import {
  useGetManagedTalentQuery,
  useGetManagedTalentActivityQuery,
  type ManagedTalentActivityPost,
  type ManagedTalentActivityApplication,
  type ManagedTalentActivityConnection,
} from "@/lib/redux/endpoints/managed-talent-api";
import { useGetRosterDealsQuery } from "@/lib/redux/endpoints/roster-deals-api";
import { useStartConversationMutation } from "@/lib/redux/endpoints/messages-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useGetUploadSignatureMutation } from "@/lib/redux/endpoints/uploads-api";
import { uploadFileToCloudinary } from "@/lib/upload-image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityBarChart } from "@/components/managed-talent/activity-bar-chart";
import { DealCard } from "@/app/(app)/roster/pipeline/page";
import { initialsFromName, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

function getPlatformIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p === "instagram") return <FaInstagram className="size-4 text-pink-500 shrink-0" />;
  if (p === "youtube") return <FaYoutube className="size-4 text-red-500 shrink-0" />;
  if (p === "twitch") return <FaTwitch className="size-4 text-purple-500 shrink-0" />;
  if (p === "twitter" || p === "x") return <FaXTwitter className="size-4 text-sky-400 shrink-0" />;
  return <Globe className="size-4 text-muted-foreground shrink-0" />;
}

export default function CreatorDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Fetch the full profile by userId
  const { data: profileResponse, isLoading: isLoadingProfile } = useGetProfileByUserIdQuery(id);
  const profile = profileResponse?.profile;

  // Fetch Roster Status
  const { data: roster } = useGetMyRosterQuery();
  const rosterEntry = roster?.items.find((e) => e.member?.userId === id);

  // Fetch Managed Talent Status
  const { data: managedTalent } = useGetManagedTalentQuery();
  const managedProfile = managedTalent?.items.find((t) => t.userId === id);

  const isManaged = !!managedProfile;
  const isRepresented = !!rosterEntry;

  if (isLoadingProfile) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-6 py-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        </div>
        <div className="h-10 w-full bg-muted rounded-xl" />
        <div className="h-40 w-full bg-muted rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 text-center">
        <h2 className="text-lg font-semibold text-foreground">Creator Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2">We couldn&apos;t retrieve the profile for this user ID.</p>
        <Link href="/roster" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="size-4" /> Back to Roster
        </Link>
      </div>
    );
  }

  // Resolve platform & followers
  const followersCount = isManaged ? managedProfile?.followers : rosterEntry?.followers;
  const primaryPlatform = isManaged ? managedProfile?.primaryPlatform : rosterEntry?.primaryPlatform;

  // Resolve manager / assignment
  const managedByName = isManaged ? "Agency Owner" : rosterEntry?.managedByName;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-6">
      {/* Back link */}
      <div>
        <Link href="/roster" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to Roster
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar size="lg">
            <AvatarImage src={profile.avatarUrl ?? undefined} />
            <AvatarFallback>{initialsFromName(profile.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground truncate">
                {profile.name}
              </h1>
              {isManaged ? (
                <Badge className="bg-[#2a78d6]/10 text-[#2a78d6] border-[#2a78d6]/20 font-semibold text-[10px] uppercase px-2 py-0.5 rounded border">
                  Managed
                </Badge>
              ) : isRepresented ? (
                <Badge className="bg-[#476948]/10 text-[#476948] border-[#476948]/20 font-semibold text-[10px] uppercase px-2 py-0.5 rounded border">
                  Represented
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        </div>

        {isManaged && (
          <div className="shrink-0">
            <Link
              href={`/roster/managed/${profile.userId}/edit`}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              Edit Profile
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Followers Stat */}
        {followersCount && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Followers</p>
            <div className="flex items-center gap-1.5 mt-2">
              {primaryPlatform && getPlatformIcon(primaryPlatform)}
              <span className="text-lg font-bold text-foreground leading-none">{followersCount}</span>
            </div>
          </div>
        )}

        {/* Managed By Stat */}
        {managedByName && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Managed By</p>
            <p className="text-sm font-semibold text-foreground mt-2 truncate">{managedByName}</p>
          </div>
        )}

        {/* Response Rate (Represented only) */}
        {isRepresented && rosterEntry?.responseRate !== null && rosterEntry?.responseRate !== undefined && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Response Rate</p>
            <p className="text-lg font-bold text-foreground mt-2 leading-none">{rosterEntry.responseRate}%</p>
          </div>
        )}

        {/* Revenue (Represented only) */}
        {isRepresented && rosterEntry?.revenue !== null && rosterEntry?.revenue !== undefined && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue (INR)</p>
            <p className="text-lg font-bold text-[#476948] dark:text-[#a7d9b5] mt-2 leading-none">
              ₹{rosterEntry.revenue.toLocaleString("en-IN")}
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList variant="line" className="h-auto w-max justify-start gap-1 rounded-none border-b border-border/60 bg-transparent p-0">
          <TabsTrigger value="overview" className="rounded-none px-2 py-1.5">Overview</TabsTrigger>
          <TabsTrigger value="portfolio" className="rounded-none px-2 py-1.5">Portfolio</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-none px-2 py-1.5">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns" className="rounded-none px-2 py-1.5">Campaigns</TabsTrigger>
          <TabsTrigger value="messages" className="rounded-none px-2 py-1.5">Messages</TabsTrigger>
          <TabsTrigger value="notes" className="rounded-none px-2 py-1.5">Notes</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-none px-2 py-1.5">Documents</TabsTrigger>
          <TabsTrigger value="contracts" className="rounded-none px-2 py-1.5">Contracts</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-none px-2 py-1.5">Payments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          {/* Bio Card */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm">
            <h3 className="font-semibold text-sm text-foreground">Bio</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {profile.bio || "No bio written yet."}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <h3 className="font-semibold text-sm text-foreground">About</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 shrink-0 text-muted-foreground/60" />
                  <span className="text-foreground">{profile.location || "Not specified"}</span>
                </div>
                {profile.creatorCategory && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="size-4 shrink-0 text-muted-foreground/60" />
                    <span className="text-foreground capitalize">{profile.creatorCategory}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="size-4 shrink-0 text-muted-foreground/60" />
                  <span className="text-foreground">
                    {profile.languages.length > 0 ? profile.languages.join(", ") : "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills & Services Card */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <h3 className="font-semibold text-sm text-foreground">Skills & Services</h3>
              <div className="space-y-4">
                {profile.skills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs px-2.5 py-0.5">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {profile.services.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Services</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.services.map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs px-2.5 py-0.5">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {profile.skills.length === 0 && profile.services.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills or services listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Relationship Timeline */}
          <TimelineSection talentUserId={id} />
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="outline-none">
          {profile.portfolioItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground bg-card shadow-sm">
              No portfolio items added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {profile.portfolioItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
                  {item.imageUrl && (
                    <div className="aspect-video w-full relative bg-muted shrink-0">
                      <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div className="p-4 space-y-1 flex-1">
                    <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                    {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="outline-none">
          {isManaged ? (
            <AnalyticsTabContent talentUserId={id} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground max-w-md mx-auto bg-card shadow-sm">
              <Activity className="size-8 mx-auto text-muted-foreground/60 mb-3 animate-pulse" />
              <h4 className="font-semibold text-foreground text-sm mb-1">Analytics Oversight Limit</h4>
              <p className="text-xs text-muted-foreground leading-relaxed px-4">
                Detailed activity tracking and performance analytics are available for managed creator accounts under your agency&apos;s direct oversight.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="outline-none">
          <CampaignsTabContent talentUserId={id} />
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="outline-none">
          <MessagesTabContent talentUserId={id} />
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="outline-none">
          <NotesTabContent talentUserId={id} />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="outline-none">
          <DocumentsTabContent talentUserId={id} />
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="outline-none">
          <ContractsTabContent talentUserId={id} />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="outline-none">
          <PaymentsTabContent talentUserId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsTabContent({ talentUserId }: { talentUserId: string }) {
  const { data, isLoading } = useGetManagedTalentActivityQuery(talentUserId);

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  }
  if (!data) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground bg-card shadow-sm">
        Couldn&apos;t load activity right now.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ActivityBarChart
        posts={data.posts.total}
        applications={data.applications.total}
        connections={data.connections.total}
        messages={data.messaging.totalSent}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PostsCard total={data.posts.total} recent={data.posts.recent} />
        <ApplicationsCard total={data.applications.total} recent={data.applications.recent} />
        <ConnectionsCard total={data.connections.total} recent={data.connections.recent} />
        <MessagingCard totalSent={data.messaging.totalSent} lastSentAt={data.messaging.lastSentAt} />
      </div>
    </div>
  );
}

function ActivityCard({ title, total, children }: { title: string; total: number; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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

function CampaignsTabContent({ talentUserId }: { talentUserId: string }) {
  const { data: dealsResponse, isLoading } = useGetRosterDealsQuery();

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  const creatorDeals = (dealsResponse?.items ?? []).filter((d) => d.member?.userId === talentUserId);

  if (creatorDeals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground bg-card shadow-sm">
        No campaigns or deals tracked for this creator yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {creatorDeals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
}

function NotesTabContent({ talentUserId }: { talentUserId: string }) {
  const { data: session } = useGetSessionQuery();
  const currentUserId = session?.user?.id;

  const { data: notesData, isLoading } = useGetTalentNotesQuery(talentUserId);
  const [createNote, { isLoading: isCreating }] = useCreateTalentNoteMutation();
  const [deleteNote] = useDeleteTalentNoteMutation();

  const [body, setBody] = useState("");

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      await createNote({ targetUserId: talentUserId, body }).unwrap();
      setBody("");
      toast.success("Note added");
    } catch {
      toast.error("Couldn't add that note. Please try again.");
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote({ targetUserId: talentUserId, noteId }).unwrap();
      toast.success("Note deleted");
    } catch {
      toast.error("Couldn't delete that note. Please try again.");
    }
  }

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddNote} className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm animate-in fade-in-50 duration-200">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          Add Internal Note
        </h3>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type an internal note about this creator... (only visible to agency team members)"
          rows={3}
          required
          className="w-full text-sm rounded-xl border border-border bg-transparent p-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isCreating || !body.trim()}>
            {isCreating ? "Adding..." : "Add note"}
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {!notesData || notesData.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground bg-card shadow-sm">
            No notes recorded yet.
          </div>
        ) : (
          notesData.items.map((note) => (
            <div key={note.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between gap-3 transition-colors duration-150">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{note.body}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5 border-t border-border/40 pt-2.5">
                <div>
                  <span>by <strong className="text-foreground">{note.authorName}</strong></span>
                  <span className="mx-1.5">•</span>
                  <span>{formatRelativeTime(note.createdAt)}</span>
                </div>
                {note.authorUserId === currentUserId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(note.id)}
                    className="text-destructive hover:underline text-xs"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MessagesTabContent({ talentUserId }: { talentUserId: string }) {
  const router = useRouter();
  const [startConversation, { isLoading }] = useStartConversationMutation();

  async function handleOpenChat() {
    try {
      const conversation = await startConversation(talentUserId).unwrap();
      router.push(`/messages?conversationId=${conversation.id}`);
    } catch {
      toast.error("Couldn't open the conversation. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground bg-card shadow-sm max-w-md mx-auto">
      <MessageSquare className="size-8 mx-auto text-muted-foreground/60 mb-3" />
      <h4 className="font-semibold text-foreground text-sm mb-1">Direct Messages</h4>
      <p className="text-xs text-muted-foreground leading-relaxed px-6 mb-4">
        Start or resume a direct conversation with this creator to discuss campaigns, terms, or check-ins.
      </p>
      <Button size="sm" onClick={handleOpenChat} disabled={isLoading}>
        {isLoading ? "Opening Chat..." : "Open conversation"}
      </Button>
    </div>
  );
}

function DocumentsTabContent({ talentUserId }: { talentUserId: string }) {
  const [getSignature] = useGetUploadSignatureMutation();
  const [createDoc] = useCreateTalentDocumentMutation();
  const [deleteDoc] = useDeleteTalentDocumentMutation();
  const [getDownloadUrl] = useGetTalentDocumentDownloadUrlMutation();
  const { data: docsData, isLoading } = useGetTalentDocumentsQuery(talentUserId);

  const [docType, setDocType] = useState<"PAN" | "GST" | "BANK_DETAILS" | "OTHER">("PAN");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10_000_000) {
        toast.error("That file is too large — please use one under 10MB.");
        setFile(null);
        e.target.value = "";
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      const signature = await getSignature("documents").unwrap();
      const uploadResult = await uploadFileToCloudinary(file, signature);

      await createDoc({
        targetUserId: talentUserId,
        docType,
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        resourceType: uploadResult.resource_type,
      }).unwrap();

      toast.success("Document uploaded successfully");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try a JPG, PNG, or PDF under 10MB.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const { url } = await getDownloadUrl({ targetUserId: talentUserId, docId }).unwrap();
      window.open(url, "_blank");
    } catch {
      toast.error("Couldn't retrieve download link. Please try again.");
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document? This completely purges it from Cloudinary and the database.")) return;
    try {
      await deleteDoc({ targetUserId: talentUserId, docId }).unwrap();
      toast.success("Document deleted");
    } catch {
      toast.error("Couldn't delete document. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleUpload} className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in-50 duration-200 flex flex-col gap-4">
        {/* Header row */}
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          Upload Secure Document
        </h3>
        
        {/* 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Left Column: Doc Type */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="doc-type-select" className="text-xs text-muted-foreground font-medium">
              Document Type
            </label>
            <select
              id="doc-type-select"
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full text-sm rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-[38px] cursor-pointer"
            >
              <option value="PAN" className="bg-card text-foreground">PAN Card</option>
              <option value="GST" className="bg-card text-foreground">GST Certificate</option>
              <option value="BANK_DETAILS" className="bg-card text-foreground">Bank Details</option>
              <option value="OTHER" className="bg-card text-foreground">Other Document</option>
            </select>
          </div>

          {/* Right Column: File Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground font-medium">
              File · PDF, JPG, PNG · max 10MB
            </label>
            <input
              id="document-file-input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              required
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-between w-full text-xs rounded-xl border border-border bg-muted/20 hover:bg-muted/40 p-2 cursor-pointer transition-colors h-[38px]"
            >
              <span className="text-muted-foreground truncate pl-1 mr-2">
                {file ? file.name : "No file chosen"}
              </span>
              <span className="bg-muted text-foreground hover:bg-muted/80 font-medium px-3 py-1.5 rounded-lg text-[11px] shrink-0 border border-border/80 transition-colors">
                Choose file
              </span>
            </div>
          </div>
        </div>

        {/* Divider and button */}
        <div className="border-t border-border/60 pt-4 flex justify-end">
          <Button type="submit" size="sm" disabled={isUploading || !file}>
            <Upload className="size-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {!docsData || docsData.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground bg-card shadow-sm">
            No secure documents uploaded yet.
          </div>
        ) : (
          docsData.items.map((doc) => (
            <div key={doc.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-150">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted text-muted-foreground shrink-0">
                  <File className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium text-foreground max-w-xs sm:max-w-md md:max-w-lg truncate">{doc.fileName}</h4>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border-none">
                      {doc.docType.replace("_", " ")}
                    </Badge>
                    <span>•</span>
                    <span>uploaded by <strong className="text-foreground">{doc.uploadedByName}</strong></span>
                    <span>•</span>
                    <span>{formatRelativeTime(doc.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.id, doc.fileName)} className="h-8 px-2.5 text-muted-foreground hover:text-foreground">
                  <Download className="size-4 mr-1.5" />
                  View
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)} className="h-8 px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ContractsTabContent({ talentUserId }: { talentUserId: string }) {
  const [getSignature] = useGetUploadSignatureMutation();
  const [createContract] = useCreateTalentContractMutation();
  const [getDownloadUrl] = useGetTalentContractDownloadUrlMutation();
  const [updateStatus] = useUpdateTalentContractStatusMutation();
  const [renewContract] = useRenewTalentContractMutation();
  const { data: contractsData, isLoading } = useGetTalentContractsQuery(talentUserId);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("0");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const contractFileInputRef = useRef<HTMLInputElement>(null);

  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [newEndDate, setNewEndDate] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 20_000_000) {
        toast.error("That file is too large — please use one under 20MB.");
        setFile(null);
        e.target.value = "";
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !startDate || !endDate) return;

    setIsUploading(true);
    try {
      const signature = await getSignature("contracts").unwrap();
      const uploadResult = await uploadFileToCloudinary(file, signature);

      await createContract({
        targetUserId: talentUserId,
        fileName: file.name,
        fileUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        resourceType: uploadResult.resource_type,
        startDate,
        endDate,
        commissionPercent: parseFloat(commissionPercent || "0"),
        status,
      }).unwrap();

      toast.success("Contract uploaded successfully");
      setFile(null);
      setStartDate("");
      setEndDate("");
      setCommissionPercent("0");
      setStatus("ACTIVE");
      if (contractFileInputRef.current) {
        contractFileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please check form inputs and file format.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (contractId: string) => {
    try {
      const { url } = await getDownloadUrl({ targetUserId: talentUserId, contractId }).unwrap();
      window.open(url, "_blank");
    } catch {
      toast.error("Couldn't retrieve download link. Please try again.");
    }
  };

  const handleStatusChange = async (contractId: string, newStatus: string) => {
    try {
      await updateStatus({ targetUserId: talentUserId, contractId, status: newStatus }).unwrap();
      toast.success("Contract status updated");
    } catch {
      toast.error("Couldn't update contract status. Please try again.");
    }
  };

  const handleRenew = async (contractId: string) => {
    if (!newEndDate) return;
    try {
      await renewContract({ targetUserId: talentUserId, contractId, newEndDate }).unwrap();
      toast.success("Contract renewed successfully");
      setRenewingId(null);
      setNewEndDate("");
    } catch {
      toast.error("Couldn't renew contract. Please try again.");
    }
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case "ACTIVE":
      case "RENEWED":
        return "bg-emerald-500/10 text-emerald-500 border-none";
      case "DRAFT":
        return "bg-yellow-500/10 text-yellow-500 border-none";
      case "EXPIRED":
        return "bg-zinc-500/10 text-zinc-500 border-none";
      case "TERMINATED":
      case "ARCHIVED":
        return "bg-destructive/10 text-destructive border-none";
      default:
        return "bg-muted text-muted-foreground border-none";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  return (
    <div className="space-y-6">
      {/* Upload Contract Form */}
      <form onSubmit={handleUpload} className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in-50 duration-200 flex flex-col gap-4">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          Upload Secure Contract
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Left column: form fields */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contract-start-date" className="text-xs text-muted-foreground font-medium">Start Date</label>
                <input
                  id="contract-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full text-xs rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-[38px] [color-scheme:dark]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contract-end-date" className="text-xs text-muted-foreground font-medium">End Date</label>
                <input
                  id="contract-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full text-xs rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-[38px] [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contract-commission-percent" className="text-xs text-muted-foreground font-medium">Commission %</label>
                <div className="relative">
                  <input
                    id="contract-commission-percent"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                    required
                    className="w-full text-xs rounded-xl border border-border bg-transparent p-2.5 pr-8 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-[38px]"
                  />
                  <Percent className="size-3 text-muted-foreground absolute right-3 top-3" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contract-status-select" className="text-xs text-muted-foreground font-medium">Initial Status</label>
                <select
                  id="contract-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-sm rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-[38px] cursor-pointer"
                >
                  <option value="ACTIVE" className="bg-card text-foreground">Active</option>
                  <option value="DRAFT" className="bg-card text-foreground">Draft</option>
                  <option value="EXPIRED" className="bg-card text-foreground">Expired</option>
                  <option value="TERMINATED" className="bg-card text-foreground">Terminated</option>
                  <option value="ARCHIVED" className="bg-card text-foreground">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right column: file picker */}
          <div className="flex flex-col gap-1.5 justify-start">
            <label className="text-xs text-muted-foreground font-medium">
              Contract Scan · PDF, JPG, PNG · max 20MB
            </label>
            <input
              id="contract-file-input"
              type="file"
              ref={contractFileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              required
              className="hidden"
            />
            <div
              onClick={() => contractFileInputRef.current?.click()}
              className="flex items-center justify-between w-full text-xs rounded-xl border border-border bg-muted/20 hover:bg-muted/40 p-2 cursor-pointer transition-colors h-[38px] mt-0.5"
            >
              <span className="text-muted-foreground truncate pl-1 mr-2">
                {file ? file.name : "No file chosen"}
              </span>
              <span className="bg-muted text-foreground hover:bg-muted/80 font-medium px-3 py-1.5 rounded-lg text-[11px] shrink-0 border border-border/80 transition-colors">
                Choose file
              </span>
            </div>
          </div>
        </div>

        {/* Divider and button */}
        <div className="border-t border-border/60 pt-4 flex justify-end">
          <Button type="submit" size="sm" disabled={isUploading || !file}>
            <Upload className="size-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload Contract"}
          </Button>
        </div>
      </form>

      {/* Contracts List */}
      <div className="space-y-4">
        {!contractsData || contractsData.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground bg-card shadow-sm">
            No contracts recorded yet.
          </div>
        ) : (
          contractsData.items.map((contract) => (
            <div key={contract.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4 transition-colors duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted text-muted-foreground shrink-0">
                    <File className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium text-foreground max-w-xs sm:max-w-md md:max-w-lg truncate">{contract.fileName}</h4>
                    <p className="text-xs text-muted-foreground">
                      uploaded by <strong className="text-foreground">{contract.uploadedByName}</strong> • {formatRelativeTime(contract.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant="secondary" className={cn("px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider", getStatusBadgeClass(contract.status))}>
                    {contract.status}
                  </Badge>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Start Date</span>
                  <span className="font-medium text-foreground">{formatDate(contract.startDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">End Date</span>
                  <span className="font-medium text-foreground">{formatDate(contract.endDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Commission Rate</span>
                  <span className="font-medium text-foreground">{contract.commissionPercent}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground block">Update Status</span>
                  <select
                    value={contract.status}
                    onChange={(e) => handleStatusChange(contract.id, e.target.value)}
                    className="text-[11px] rounded-lg border border-border bg-transparent px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-28 cursor-pointer h-7"
                  >
                    <option value="ACTIVE" className="bg-card text-foreground">Active</option>
                    <option value="DRAFT" className="bg-card text-foreground">Draft</option>
                    <option value="EXPIRED" className="bg-card text-foreground">Expired</option>
                    <option value="TERMINATED" className="bg-card text-foreground">Terminated</option>
                    <option value="ARCHIVED" className="bg-card text-foreground">Archived</option>
                  </select>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(contract.id)} className="h-8 text-xs">
                    <Download className="size-3.5 mr-1.5" />
                    Download File
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRenewingId(renewingId === contract.id ? null : contract.id);
                      setNewEndDate("");
                    }}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <History className="size-3.5 mr-1.5" />
                    Renew Contract
                  </Button>
                </div>
              </div>

              {/* Inline renewal panel */}
              {renewingId === contract.id && (
                <div className="bg-muted/10 border border-border rounded-xl p-4 mt-2 space-y-3 animate-in slide-in-from-top-2 duration-150">
                  <h5 className="font-semibold text-xs text-foreground">Renew Contract Term</h5>
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex flex-col gap-1 shrink-0">
                      <label htmlFor={`renew-date-${contract.id}`} className="text-[10px] text-muted-foreground font-medium">New End Date</label>
                      <input
                        id={`renew-date-${contract.id}`}
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        required
                        className="text-xs rounded-lg border border-border bg-transparent p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-[34px] [color-scheme:dark] w-40"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleRenew(contract.id)} disabled={!newEndDate} className="h-[34px]">
                        Save Renewal
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setRenewingId(null)} className="h-[34px]">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PaymentsTabContent({ talentUserId }: { talentUserId: string }) {
  const [getSignature] = useGetUploadSignatureMutation();
  const [createPayment] = useCreateTalentPaymentMutation();
  const [getDownloadUrl] = useGetTalentPaymentDownloadUrlMutation();
  const [updateStatus] = useUpdateTalentPaymentStatusMutation();
  const { data: paymentsData, isLoading } = useGetTalentPaymentsQuery(talentUserId);
  const { data: dealsData } = useGetRosterDealsQuery();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [dealId, setDealId] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [status, setStatus] = useState<string>("PENDING");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const creatorDeals = (dealsData?.items || []).filter(
    (d) => d.member?.userId === talentUserId
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10_000_000) {
        toast.error("That file is too large — please use one under 10MB.");
        setFile(null);
        e.target.value = "";
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !paymentDate) return;

    setIsUploading(true);
    try {
      let fileData = {};
      if (file) {
        const signature = await getSignature("payments").unwrap();
        const uploadResult = await uploadFileToCloudinary(file, signature);
        fileData = {
          fileName: file.name,
          fileUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          resourceType: uploadResult.resource_type,
        };
      }

      await createPayment({
        targetUserId: talentUserId,
        amount: parseFloat(amount),
        paymentDate,
        status,
        paymentReference: paymentReference || undefined,
        dealId: dealId || undefined,
        ...fileData,
      }).unwrap();

      toast.success("Payment recorded successfully");
      setAmount("");
      setPaymentDate("");
      setDealId("");
      setPaymentReference("");
      setStatus("PENDING");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to record payment. Please check inputs.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (paymentId: string) => {
    try {
      const { url } = await getDownloadUrl({ targetUserId: talentUserId, paymentId }).unwrap();
      window.open(url, "_blank");
    } catch {
      toast.error("Couldn't retrieve download link. Please try again.");
    }
  };

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      await updateStatus({ targetUserId: talentUserId, paymentId, status: newStatus }).unwrap();
      toast.success("Payment status updated");
    } catch {
      toast.error("Couldn't update payment status. Please try again.");
    }
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case "PAID":
        return "bg-emerald-500/10 text-emerald-500 border-none";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-none";
      case "VOIDED":
        return "bg-destructive/10 text-destructive border-none";
      default:
        return "bg-muted text-muted-foreground border-none";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  return (
    <div className="space-y-6">
      {/* Record Payment Entry Form */}
      <form onSubmit={handleUpload} className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in-50 duration-200 flex flex-col gap-4">
        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          Record Secure Payment Entry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Left column */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="payment-amount" className="text-xs text-muted-foreground font-medium">Amount (INR)</label>
                <input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full text-xs rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-[38px]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="payment-date" className="text-xs text-muted-foreground font-medium">Payment Date</label>
                <input
                  id="payment-date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full text-xs rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-[38px] [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="payment-deal" className="text-xs text-muted-foreground font-medium">Campaign / Deal</label>
                <select
                  id="payment-deal"
                  value={dealId}
                  onChange={(e) => setDealId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-[38px] cursor-pointer"
                >
                  <option value="" className="bg-card text-foreground">General (Unlinked)</option>
                  {creatorDeals.map((d) => (
                    <option key={d.id} value={d.id} className="bg-card text-foreground">
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="payment-status-select" className="text-xs text-muted-foreground font-medium">Status</label>
                <select
                  id="payment-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-[38px] cursor-pointer"
                >
                  <option value="PENDING" className="bg-card text-foreground">Pending</option>
                  <option value="PAID" className="bg-card text-foreground">Paid</option>
                  <option value="VOIDED" className="bg-card text-foreground">Voided</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="payment-ref" className="text-xs text-muted-foreground font-medium">Reference Note</label>
              <input
                id="payment-ref"
                type="text"
                placeholder="UPI ref, Bank transfer, Cheque number, etc."
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full text-xs rounded-xl border border-border bg-transparent p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-[38px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground font-medium">
                Payment Proof / Receipt (Optional) · PDF, Image · max 10MB
              </label>
              <input
                id="payment-file-input"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-between w-full text-xs rounded-xl border border-border bg-muted/20 hover:bg-muted/40 p-2 cursor-pointer transition-colors h-[38px] mt-0.5"
              >
                <span className="text-muted-foreground truncate pl-1 mr-2">
                  {file ? file.name : "No file chosen"}
                </span>
                <span className="bg-muted text-foreground hover:bg-muted/80 font-medium px-3 py-1.5 rounded-lg text-[11px] shrink-0 border border-border/80 transition-colors">
                  Choose file
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider and button */}
        <div className="border-t border-border/60 pt-4 flex justify-end">
          <Button type="submit" size="sm" disabled={isUploading}>
            <Upload className="size-4 mr-2" />
            {isUploading ? "Uploading..." : "Record Payment"}
          </Button>
        </div>
      </form>

      {/* Payments List */}
      <div className="space-y-4">
        {!paymentsData || paymentsData.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground bg-card shadow-sm">
            No payment entries logged yet.
          </div>
        ) : (
          paymentsData.items.map((payment) => (
            <div key={payment.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4 transition-colors duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-muted text-muted-foreground shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold text-foreground">
                      ₹{payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      recorded by <strong className="text-foreground">{payment.uploadedByName}</strong> • logged {formatRelativeTime(payment.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant="secondary" className={cn("px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider", getStatusBadgeClass(payment.status))}>
                    {payment.status}
                  </Badge>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Payment Date</span>
                  <span className="font-medium text-foreground">{formatDate(payment.paymentDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Campaign Link</span>
                  <span className="font-medium text-foreground truncate max-w-[150px] block">
                    {payment.dealTitle || "General / None"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Reference Note</span>
                  <span className="font-medium text-foreground block truncate max-w-[150px]" title={payment.paymentReference || "N/A"}>
                    {payment.paymentReference || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground block">Update Status</span>
                  <select
                    value={payment.status}
                    onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                    className="text-[11px] rounded-lg border border-border bg-transparent px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-28 cursor-pointer h-7"
                  >
                    <option value="PENDING" className="bg-card text-foreground">Pending</option>
                    <option value="PAID" className="bg-card text-foreground">Paid</option>
                    <option value="VOIDED" className="bg-card text-foreground">Voided</option>
                  </select>
                </div>
              </div>

              {/* Actions row */}
              {payment.fileName && (
                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(payment.id)} className="h-8 text-xs">
                    <Download className="size-3.5 mr-1.5" />
                    Download Proof
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TimelineSection({ talentUserId }: { talentUserId: string }) {
  const { data: timelineData, isLoading } = useGetTalentTimelineQuery(talentUserId);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "INVITED":
        return <Mail className="size-3 text-primary" />;
      case "ACCEPTED":
        return <CheckCircle className="size-3 text-emerald-500" />;
      case "PROFILE_COMPLETED":
        return <User className="size-3 text-indigo-400" />;
      case "MANAGER_ASSIGNED":
        return <UserCheck className="size-3 text-sky-400" />;
      case "CAMPAIGN":
        return <Activity className="size-3 text-violet-400" />;
      case "CONTRACT_RENEWED":
        return <History className="size-3 text-purple-400" />;
      case "PAYMENT":
        return <DollarSign className="size-3 text-amber-500" />;
      case "REVIEW":
        return <Award className="size-3 text-yellow-500" />;
      case "LONG_TERM":
        return <Calendar className="size-3 text-rose-500" />;
      default:
        return <Activity className="size-3 text-muted-foreground" />;
    }
  };

  const getEventBorderClass = (type: string) => {
    switch (type) {
      case "ACCEPTED":
        return "border-emerald-500/50 bg-emerald-500/5";
      case "LONG_TERM":
        return "border-rose-500/50 bg-rose-500/5";
      case "REVIEW":
        return "border-yellow-500/50 bg-yellow-500/5";
      default:
        return "border-primary/40 bg-muted/20";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl border border-border bg-muted" />;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-sm animate-in fade-in-50 duration-200 mt-6">
      <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
        <Activity className="size-4 text-primary" />
        Relationship Timeline
      </h3>

      {!timelineData || timelineData.items.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4">
          No relationship timeline milestones recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 border-l border-border/80 ml-3 space-y-8 py-2">
          {timelineData.items.map((item) => (
            <div key={item.id} className="relative group animate-in slide-in-from-left-2 duration-200">
              <div className={cn(
                "absolute -left-[38px] top-0.5 flex items-center justify-center size-[24px] rounded-full border shadow-sm transition-transform duration-200 group-hover:scale-110",
                getEventBorderClass(item.type)
              )}>
                {getEventIcon(item.type)}
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  {formatDate(item.date)}
                </span>
                <h4 className="text-sm font-semibold text-foreground mt-0.5">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
