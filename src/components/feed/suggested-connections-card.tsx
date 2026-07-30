"use client";

import { BadgeCheck } from "lucide-react";

import type { SuggestedConnection } from "@/lib/types/feed";
import { initialsFromName } from "@/lib/format";
import {
  useGetSuggestedConnectionsQuery,
  useSendConnectionRequestMutation,
} from "@/lib/redux/endpoints/connections-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function SuggestedConnectionsCard() {
  const { data, isLoading, isError } = useGetSuggestedConnectionsQuery();

  if (isLoading) {
    return <div className="h-72 animate-pulse rounded-2xl border border-border bg-muted" />;
  }
  if (isError || !data) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Suggested Connections</h3>
      </div>

      {data.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No suggestions right now.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {data.items.map((connection) => (
            <SuggestedConnectionRow key={connection.userId} connection={connection} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SuggestedConnectionRow({ connection }: { connection: SuggestedConnection }) {
  const [sendRequest, { isLoading, isSuccess }] = useSendConnectionRequestMutation();

  return (
    <li className="flex items-start gap-3">
      <Avatar size="lg">
        <AvatarImage src={connection.avatarUrl ?? undefined} />
        <AvatarFallback>{initialsFromName(connection.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-sm font-medium text-foreground">
          {connection.name}
          {connection.verified ? (
            <BadgeCheck className="size-3.5 shrink-0 text-[#476948] dark:text-[#a7d9b5]" />
          ) : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">{connection.role}</p>
        <p className="truncate text-xs text-muted-foreground/70">{connection.location}</p>
        <Button
          size="sm"
          variant={isSuccess ? "outline" : "default"}
          disabled={isLoading || isSuccess}
          onClick={() => sendRequest(connection.userId)}
          className="mt-2 w-full"
        >
          {isSuccess ? "Requested" : isLoading ? "Requesting…" : "Connect"}
        </Button>
      </div>
    </li>
  );
}
