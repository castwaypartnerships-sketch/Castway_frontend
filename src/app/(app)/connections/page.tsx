"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { BadgeCheck, Check, MapPin, Users, X } from "lucide-react";

import type { ConnectionListItem } from "@/lib/types/connection";
import { initialsFromName, formatRelativeTime } from "@/lib/format";
import {
  useAcceptConnectionMutation,
  useBlockUserMutation,
  useGetBlockedConnectionsQuery,
  useGetConnectionsQuery,
  useGetPendingConnectionsQuery,
  useGetSuggestedConnectionsQuery,
  useRejectConnectionMutation,
  useRemoveConnectionMutation,
  useSendConnectionRequestMutation,
  useUnblockUserMutation,
} from "@/lib/redux/endpoints/connections-api";
import { useSubmitReviewMutation } from "@/lib/redux/endpoints/reviews-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountRoleBadge } from "@/components/shared/account-role-badge";
import { SuggestedConnectionsCard } from "@/components/feed/suggested-connections-card";
import { TrendingSkillsCard } from "@/components/shared/trending-skills-card";
import { NewOpportunitiesCard } from "@/components/shared/new-opportunities-card";
import { GrowNetworkCard } from "@/components/connections/grow-network-card";
import { cn } from "@/lib/utils";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function ConnectionsPage() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab =
    requestedTab === "requests" ||
    requestedTab === "sent" ||
    requestedTab === "suggested" ||
    requestedTab === "blocked"
      ? requestedTab
      : "connections";

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Connections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your network of creators, agencies, and collaborators.
        </p>

        <ConnectionsStatsRow />

        <Tabs defaultValue={initialTab} className="mt-6">
          <TabsList className="h-auto max-w-full gap-2 overflow-x-auto rounded-none bg-transparent p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsTrigger
              value="connections"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-none data-active:border-transparent data-active:bg-[#1c3322] data-active:text-white data-active:shadow-none dark:data-active:bg-[#25422d]"
            >
              All Connections
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-none data-active:border-transparent data-active:bg-[#1c3322] data-active:text-white data-active:shadow-none dark:data-active:bg-[#25422d]"
            >
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-none data-active:border-transparent data-active:bg-[#1c3322] data-active:text-white data-active:shadow-none dark:data-active:bg-[#25422d]"
            >
              Sent
            </TabsTrigger>
            <TabsTrigger
              value="suggested"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-none data-active:border-transparent data-active:bg-[#1c3322] data-active:text-white data-active:shadow-none dark:data-active:bg-[#25422d]"
            >
              Suggestions
            </TabsTrigger>
            <TabsTrigger
              value="blocked"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-none data-active:border-transparent data-active:bg-[#1c3322] data-active:text-white data-active:shadow-none dark:data-active:bg-[#25422d]"
            >
              Blocked
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="mt-5">
            <MyConnectionsTab />
          </TabsContent>
          <TabsContent value="requests" className="mt-5">
            <RequestsTab />
          </TabsContent>
          <TabsContent value="sent" className="mt-5">
            <SentTab />
          </TabsContent>
          <TabsContent value="suggested" className="mt-5">
            <SuggestedTab />
          </TabsContent>
          <TabsContent value="blocked" className="mt-5">
            <BlockedTab />
          </TabsContent>
        </Tabs>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        <GrowNetworkCard />
        <SuggestedConnectionsCard />
        <TrendingSkillsCard />
        <NewOpportunitiesCard />
      </aside>
    </div>
  );
}

function ConnectionsStatsRow() {
  const { data: connections } = useGetConnectionsQuery();
  const { data: pending } = useGetPendingConnectionsQuery();
  // Snapshot once on mount rather than calling Date.now() directly during
  // render (impure — see react-hooks/purity), and stable per-render anyway
  // since "new this week" doesn't need to tick live.
  const [now] = useState(() => Date.now());

  if (!connections || !pending) {
    return (
      <div className="mt-6 flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 flex-1 animate-pulse rounded-2xl border border-border bg-muted" />
        ))}
      </div>
    );
  }

  const newThisWeek = connections.items.filter(
    (item) => now - new Date(item.createdAt).getTime() < ONE_WEEK_MS,
  ).length;
  const mutualCounts = connections.items.map((item) => item.counterpart.mutualConnectionsCount);
  const mutualAverage =
    mutualCounts.length === 0 ? 0 : Math.round(mutualCounts.reduce((a, b) => a + b, 0) / mutualCounts.length);

  const stats = [
    { label: "Total Connections", value: connections.items.length },
    { label: "Pending Requests", value: pending.incoming.length },
    { label: "New This Week", value: newThisWeek },
    { label: "Mutual Average", value: mutualAverage },
  ];

  return (
    <div className="mt-6 flex flex-wrap gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function PersonRow({
  person,
  children,
}: {
  person: {
    username: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    location: string | null;
    accountRole: string;
    followerCount: number;
    mutualConnectionsCount: number;
  };
  children?: React.ReactNode;
}) {
  return (
    <li className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/profile/${person.username}`} className="group/person flex min-w-0 flex-1 gap-3">
          <Avatar size="lg" className="transition-transform group-hover/person:scale-105">
            <AvatarImage src={person.avatarUrl ?? undefined} />
            <AvatarFallback>{initialsFromName(person.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold text-foreground group-hover/person:underline">
                {person.name}
              </p>
              <AccountRoleBadge role={person.accountRole} />
            </div>
            {person.bio ? <p className="truncate text-sm text-muted-foreground">{person.bio}</p> : null}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                {person.followerCount.toLocaleString()} followers
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                {person.mutualConnectionsCount} mutual connections
              </span>
              {person.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {person.location}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      </div>
      {children ? <div className="mt-4 border-t border-border pt-4">{children}</div> : null}
    </li>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function MyConnectionsTab() {
  const { data, isLoading } = useGetConnectionsQuery();
  const [remove] = useRemoveConnectionMutation();
  const [blockUser] = useBlockUserMutation();

  async function handleRemove(connection: ConnectionListItem) {
    try {
      await remove(connection.id).unwrap();
      toast.success(`Removed ${connection.counterpart.name} from your connections`);
    } catch {
      toast.error("Couldn't remove that connection. Please try again.");
    }
  }

  async function handleBlock(connection: ConnectionListItem) {
    if (!confirm(`Block ${connection.counterpart.name}? They won't be able to contact you.`)) return;
    try {
      await blockUser(connection.counterpart.userId).unwrap();
      toast.success(`Blocked ${connection.counterpart.name}`);
    } catch {
      toast.error("Couldn't block that user. Please try again.");
    }
  }

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  if (!data || data.items.length === 0) return <EmptyState>No connections yet.</EmptyState>;

  return (
    <ul className="space-y-4">
      {data.items.map((connection: ConnectionListItem) => (
        <PersonRow key={connection.id} person={connection.counterpart}>
          <div className="flex items-center justify-end gap-3">
            <LeaveReviewAction revieweeUserId={connection.counterpart.userId} />
            <Button variant="outline" size="sm" onClick={() => handleRemove(connection)}>
              Remove
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => handleBlock(connection)}
            >
              Block
            </Button>
          </div>
        </PersonRow>
      ))}
    </ul>
  );
}

function BlockedTab() {
  const { data, isLoading } = useGetBlockedConnectionsQuery();
  const [unblock] = useUnblockUserMutation();

  async function handleUnblock(connection: ConnectionListItem) {
    try {
      await unblock(connection.id).unwrap();
      toast.success(`Unblocked ${connection.counterpart.name}`);
    } catch {
      toast.error("Couldn't unblock that user. Please try again.");
    }
  }

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  if (!data || data.items.length === 0) return <EmptyState>No blocked users.</EmptyState>;

  return (
    <ul className="space-y-4">
      {data.items.map((connection: ConnectionListItem) => (
        <PersonRow key={connection.id} person={connection.counterpart}>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => handleUnblock(connection)}>
              Unblock
            </Button>
          </div>
        </PersonRow>
      ))}
    </ul>
  );
}

/** Inline (not modal) review form — this codebase has no Dialog primitive
 * yet, and one collaborator per connection row doesn't need one. Eligibility
 * (must share an accepted connection or accepted application) is enforced
 * server-side by `ReviewService`; this only decides where the action is
 * surfaced. */
function LeaveReviewAction({ revieweeUserId }: { revieweeUserId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitReview, { isLoading, isSuccess }] = useSubmitReviewMutation();

  if (isSuccess) return <span className="text-xs text-success">Review submitted</span>;

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Leave a review
      </Button>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitReview({ revieweeUserId, rating, comment: comment || undefined }).unwrap();
  }

  return (
    <form onSubmit={handleSubmit} className="w-56 space-y-2 rounded-xl border border-border p-3">
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} star{n === 1 ? "" : "s"}
          </option>
        ))}
      </select>
      <Textarea
        rows={2}
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? "Submitting…" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

function RequestsTab() {
  const { data, isLoading } = useGetPendingConnectionsQuery();
  const [accept] = useAcceptConnectionMutation();
  const [reject] = useRejectConnectionMutation();
  const [blockUser] = useBlockUserMutation();

  async function handleAccept(connection: ConnectionListItem) {
    try {
      await accept(connection.id).unwrap();
      toast.success(`You're now connected with ${connection.counterpart.name}`);
    } catch {
      toast.error("Couldn't accept that request. Please try again.");
    }
  }

  async function handleReject(connection: ConnectionListItem) {
    try {
      await reject(connection.id).unwrap();
      toast.success(`Declined ${connection.counterpart.name}'s request`);
    } catch {
      toast.error("Couldn't decline that request. Please try again.");
    }
  }

  async function handleBlock(connection: ConnectionListItem) {
    if (!confirm(`Block ${connection.counterpart.name}? They won't be able to contact you.`)) return;
    try {
      await blockUser(connection.counterpart.userId).unwrap();
      toast.success(`Blocked ${connection.counterpart.name}`);
    } catch {
      toast.error("Couldn't block that user. Please try again.");
    }
  }

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;

  const incoming = data?.incoming ?? [];
  if (incoming.length === 0) return <EmptyState>No incoming requests.</EmptyState>;

  return (
    <ul className="space-y-4">
      {incoming.map((connection) => (
        <PersonRow key={connection.id} person={connection.counterpart}>
          <div className="flex items-center justify-between gap-3">
            <time className="text-xs text-muted-foreground">{formatRelativeTime(connection.createdAt)}</time>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => handleBlock(connection)}
              >
                Decline &amp; Block
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleReject(connection)}>
                <X className="size-4" />
                Decline
              </Button>
              <Button size="sm" onClick={() => handleAccept(connection)}>
                <Check className="size-4" />
                Accept
              </Button>
            </div>
          </div>
        </PersonRow>
      ))}
    </ul>
  );
}

function SentTab() {
  const { data, isLoading } = useGetPendingConnectionsQuery();
  const [remove] = useRemoveConnectionMutation();

  async function handleWithdraw(connection: ConnectionListItem) {
    try {
      await remove(connection.id).unwrap();
      toast.success(`Withdrew your request to ${connection.counterpart.name}`);
    } catch {
      toast.error("Couldn't withdraw that request. Please try again.");
    }
  }

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;

  const outgoing = data?.outgoing ?? [];
  if (outgoing.length === 0) return <EmptyState>No outgoing requests.</EmptyState>;

  return (
    <ul className="space-y-4">
      {outgoing.map((connection) => (
        <PersonRow key={connection.id} person={connection.counterpart}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Sent {formatRelativeTime(connection.createdAt)} · Pending
            </span>
            <Button variant="outline" size="sm" onClick={() => handleWithdraw(connection)}>
              Withdraw
            </Button>
          </div>
        </PersonRow>
      ))}
    </ul>
  );
}

function SuggestedTab() {
  const { data, isLoading } = useGetSuggestedConnectionsQuery();

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  if (!data || data.items.length === 0) return <EmptyState>No suggestions right now.</EmptyState>;

  return (
    <ul className="space-y-4">
      {data.items.map((suggestion) => (
        <SuggestedRow key={suggestion.userId} suggestion={suggestion} />
      ))}
    </ul>
  );
}

function SuggestedRow({
  suggestion,
}: {
  suggestion: {
    userId: string;
    username: string;
    name: string;
    role: string;
    accountRole: string;
    location: string;
    avatarUrl: string | null;
    verified: boolean;
    followerCount: number;
    mutualConnectionsCount: number;
  };
}) {
  const [sendRequest, { isLoading, isSuccess }] = useSendConnectionRequestMutation();

  return (
    <li className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/profile/${suggestion.username}`} className="group/person flex min-w-0 flex-1 gap-3">
          <Avatar size="lg" className="transition-transform group-hover/person:scale-105">
            <AvatarImage src={suggestion.avatarUrl ?? undefined} />
            <AvatarFallback>{initialsFromName(suggestion.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="flex items-center gap-1 truncate font-semibold text-foreground group-hover/person:underline">
                {suggestion.name}
                {suggestion.verified ? (
                  <BadgeCheck className="size-3.5 shrink-0 text-[#476948] dark:text-[#a7d9b5]" />
                ) : null}
              </p>
              <AccountRoleBadge role={suggestion.accountRole} />
            </div>
            {suggestion.role ? <p className="truncate text-sm text-muted-foreground">{suggestion.role}</p> : null}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                {suggestion.followerCount.toLocaleString()} followers
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                {suggestion.mutualConnectionsCount} mutual connections
              </span>
              {suggestion.location ? (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {suggestion.location}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      </div>
      <div className={cn("mt-4 flex justify-end border-t border-border pt-4")}>
        <Button
          size="sm"
          variant={isSuccess ? "outline" : "default"}
          disabled={isLoading || isSuccess}
          onClick={() => sendRequest(suggestion.userId)}
        >
          {isSuccess ? "Requested" : isLoading ? "Requesting…" : "Connect"}
        </Button>
      </div>
    </li>
  );
}
