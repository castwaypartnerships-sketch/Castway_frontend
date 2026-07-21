"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { BadgeCheck, Check, X } from "lucide-react";

import type { ConnectionListItem } from "@/lib/types/connection";
import { initialsFromName } from "@/lib/format";
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

export default function ConnectionsPage() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab =
    requestedTab === "requests" || requestedTab === "suggested" || requestedTab === "blocked"
      ? requestedTab
      : "connections";

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">Connections</h1>
      <p className="text-sm text-muted-foreground">
        People you&apos;re connected with, pending requests, and who to connect with next.
      </p>

      <Tabs defaultValue={initialTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="connections">My Connections</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="mt-5">
          <MyConnectionsTab />
        </TabsContent>
        <TabsContent value="requests" className="mt-5">
          <RequestsTab />
        </TabsContent>
        <TabsContent value="suggested" className="mt-5">
          <SuggestedTab />
        </TabsContent>
        <TabsContent value="blocked" className="mt-5">
          <BlockedTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PersonRow({
  person,
  children,
}: {
  person: { username: string; name: string; avatarUrl: string | null; bio: string | null };
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <Link href={`/profile/${person.username}`} className="group/person flex min-w-0 flex-1 items-center gap-3">
        <Avatar size="lg" className="transition-transform group-hover/person:scale-105">
          <AvatarImage src={person.avatarUrl ?? undefined} />
          <AvatarFallback>{initialsFromName(person.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground group-hover/person:underline">
            {person.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{person.bio}</p>
        </div>
      </Link>
      {children}
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
    <ul className="space-y-3">
      {data.items.map((connection: ConnectionListItem) => (
        <PersonRow key={connection.id} person={connection.counterpart}>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
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
            <LeaveReviewAction revieweeUserId={connection.counterpart.userId} />
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
    <ul className="space-y-3">
      {data.items.map((connection: ConnectionListItem) => (
        <PersonRow key={connection.id} person={connection.counterpart}>
          <Button variant="outline" size="sm" onClick={() => handleUnblock(connection)}>
            Unblock
          </Button>
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
  const outgoing = data?.outgoing ?? [];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold text-foreground">Incoming</h2>
        {incoming.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No incoming requests.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {incoming.map((connection) => (
              <PersonRow key={connection.id} person={connection.counterpart}>
                <div className="flex gap-2">
                  <Button size="icon-sm" onClick={() => handleAccept(connection)} aria-label="Accept">
                    <Check className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => handleReject(connection)}
                    aria-label="Reject"
                  >
                    <X className="size-4" />
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
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Outgoing</h2>
        {outgoing.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No outgoing requests.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {outgoing.map((connection) => (
              <PersonRow key={connection.id} person={connection.counterpart}>
                <span className="text-xs text-muted-foreground">Pending</span>
              </PersonRow>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SuggestedTab() {
  const { data, isLoading } = useGetSuggestedConnectionsQuery();

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  if (!data || data.items.length === 0) return <EmptyState>No suggestions right now.</EmptyState>;

  return (
    <ul className="space-y-3">
      {data.items.map((suggestion) => (
        <SuggestedRow key={suggestion.userId} suggestion={suggestion} />
      ))}
    </ul>
  );
}

function SuggestedRow({
  suggestion,
}: {
  suggestion: { userId: string; username: string; name: string; role: string; avatarUrl: string | null; verified: boolean };
}) {
  const [sendRequest, { isLoading, isSuccess }] = useSendConnectionRequestMutation();

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <Link href={`/profile/${suggestion.username}`} className="group/person flex min-w-0 flex-1 items-center gap-3">
        <Avatar size="lg" className="transition-transform group-hover/person:scale-105">
          <AvatarImage src={suggestion.avatarUrl ?? undefined} />
          <AvatarFallback>{initialsFromName(suggestion.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-sm font-medium text-foreground group-hover/person:underline">
            {suggestion.name}
            {suggestion.verified ? <BadgeCheck className="size-3.5 shrink-0 text-primary" /> : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">{suggestion.role}</p>
        </div>
      </Link>
      <Button
        size="sm"
        variant={isSuccess ? "outline" : "default"}
        disabled={isLoading || isSuccess}
        onClick={() => sendRequest(suggestion.userId)}
      >
        {isSuccess ? "Requested" : isLoading ? "Requesting…" : "Connect"}
      </Button>
    </li>
  );
}
