"use client";

import { BadgeCheck, Check, X } from "lucide-react";

import type { ConnectionListItem } from "@/lib/types/connection";
import { initialsFromName } from "@/lib/format";
import {
  useAcceptConnectionMutation,
  useGetConnectionsQuery,
  useGetPendingConnectionsQuery,
  useGetSuggestedConnectionsQuery,
  useRejectConnectionMutation,
  useRemoveConnectionMutation,
  useSendConnectionRequestMutation,
} from "@/lib/redux/endpoints/connections-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConnectionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <h1 className="text-lg font-semibold text-foreground">Connections</h1>
      <p className="text-sm text-muted-foreground">
        People you&apos;re connected with, pending requests, and who to connect with next.
      </p>

      <Tabs defaultValue="connections" className="mt-6">
        <TabsList>
          <TabsTrigger value="connections">My Connections</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
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
      </Tabs>
    </div>
  );
}

function PersonRow({
  person,
  children,
}: {
  person: { name: string; avatarUrl: string | null; bio: string | null };
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Avatar size="lg">
        <AvatarImage src={person.avatarUrl ?? undefined} />
        <AvatarFallback>{initialsFromName(person.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{person.name}</p>
        <p className="truncate text-xs text-muted-foreground">{person.bio}</p>
      </div>
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

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />;
  if (!data || data.items.length === 0) return <EmptyState>No connections yet.</EmptyState>;

  return (
    <ul className="space-y-3">
      {data.items.map((connection: ConnectionListItem) => (
        <PersonRow key={connection.id} person={connection.counterpart}>
          <Button variant="outline" size="sm" onClick={() => remove(connection.id)}>
            Remove
          </Button>
        </PersonRow>
      ))}
    </ul>
  );
}

function RequestsTab() {
  const { data, isLoading } = useGetPendingConnectionsQuery();
  const [accept] = useAcceptConnectionMutation();
  const [reject] = useRejectConnectionMutation();

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
                  <Button size="icon-sm" onClick={() => accept(connection.id)} aria-label="Accept">
                    <Check className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => reject(connection.id)}
                    aria-label="Reject"
                  >
                    <X className="size-4" />
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
  suggestion: { userId: string; name: string; role: string; avatarUrl: string | null; verified: boolean };
}) {
  const [sendRequest, { isLoading, isSuccess }] = useSendConnectionRequestMutation();

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Avatar size="lg">
        <AvatarImage src={suggestion.avatarUrl ?? undefined} />
        <AvatarFallback>{initialsFromName(suggestion.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm font-medium text-foreground">
          {suggestion.name}
          {suggestion.verified ? <BadgeCheck className="size-3.5 shrink-0 text-primary" /> : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">{suggestion.role}</p>
      </div>
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
