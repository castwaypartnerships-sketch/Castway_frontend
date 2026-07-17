"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Send, SquarePen } from "lucide-react";
import { toast } from "sonner";

import type { ConversationListItem } from "@/lib/types/messaging";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import {
  messagesApi,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useMarkConversationReadMutation,
  useSendMessageMutation,
  useStartConversationMutation,
} from "@/lib/redux/endpoints/messages-api";
import { useGetConnectionsQuery } from "@/lib/redux/endpoints/connections-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useAppDispatch } from "@/lib/redux/hooks";
import { conversationChannelName, getPusherClient, PUSHER_EVENTS } from "@/lib/pusher-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type InboxFilter = "all" | "brand-deals";

export default function MessagesPage() {
  const { data: conversations, isLoading } = useGetConversationsQuery();
  const { data: session } = useGetSessionQuery();
  const searchParams = useSearchParams();
  const conversationIdFromQuery = searchParams.get("conversationId");
  const [manuallySelectedId, setManuallySelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const selectedId = manuallySelectedId ?? conversationIdFromQuery ?? conversations?.items[0]?.id ?? null;

  const isCreator = session?.user?.role === "CREATOR";
  const items = conversations?.items.filter(
    (c) => filter === "all" || c.context === "BRAND_DEAL",
  );

  useConversationsRealtime(conversations?.items.map((c) => c.id) ?? []);

  return (
    <div className="flex h-full">
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-border">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-sm font-semibold tracking-tight text-foreground">Messages</h1>
            <NewChatMenu onStarted={setManuallySelectedId} />
          </div>
          {isCreator ? (
            <Tabs value={filter} onValueChange={(v) => setFilter(v as InboxFilter)} className="mt-3">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  All
                </TabsTrigger>
                <TabsTrigger value="brand-deals" className="flex-1">
                  Brand Deals
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : null}
        </div>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            {filter === "brand-deals" ? "No Brand Deal conversations yet." : "No conversations yet."}
          </p>
        ) : (
          <ul>
            {items.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === selectedId}
                onSelect={() => setManuallySelectedId(conversation.id)}
              />
            ))}
          </ul>
        )}
      </aside>

      <div className="flex-1">
        {selectedId ? (
          <ThreadView key={selectedId} conversationId={selectedId} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select a conversation to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}

/** Live delivery: the backend fans new messages out over Pusher (see
 * backend/src/modules/messaging/messaging-event-publisher.ts), but RTK
 * Query's cache only knows to refetch on the sender's own mutation. This
 * subscribes to every conversation the user is part of — not just the open
 * one — so the sidebar's ordering/preview and an unopened thread's cache
 * both stay live. Keyed off a sorted, joined id string rather than the raw
 * array so a same-ids refetch (a new array reference) doesn't churn the
 * Pusher subscriptions. */
function useConversationsRealtime(conversationIds: string[]) {
  const dispatch = useAppDispatch();
  const idsKey = [...conversationIds].sort().join(",");

  useEffect(() => {
    const ids = idsKey ? idsKey.split(",") : [];
    const client = getPusherClient();
    const bindings = ids.map((id) => {
      const channel = client.subscribe(conversationChannelName(id));
      const onNewMessage = () => {
        dispatch(messagesApi.util.invalidateTags([{ type: "Messages", id }, "Conversations"]));
      };
      const onMessageRead = () => {
        dispatch(messagesApi.util.invalidateTags([{ type: "Messages", id }]));
      };
      channel.bind(PUSHER_EVENTS.newMessage, onNewMessage);
      channel.bind(PUSHER_EVENTS.messageRead, onMessageRead);
      return { id, channel, onNewMessage, onMessageRead };
    });

    return () => {
      for (const { id, channel, onNewMessage, onMessageRead } of bindings) {
        channel.unbind(PUSHER_EVENTS.newMessage, onNewMessage);
        channel.unbind(PUSHER_EVENTS.messageRead, onMessageRead);
        client.unsubscribe(conversationChannelName(id));
      }
    };
  }, [idsKey, dispatch]);
}

function NewChatMenu({ onStarted }: { onStarted: (conversationId: string) => void }) {
  const { data: connections, isLoading } = useGetConnectionsQuery();
  const [startConversation, { isLoading: isStarting }] = useStartConversationMutation();

  async function handlePick(userId: string) {
    try {
      const conversation = await startConversation(userId).unwrap();
      onStarted(conversation.id);
    } catch {
      toast.error("Couldn't start that conversation. Please try again.");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="New message" disabled={isStarting}>
            <SquarePen className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Start a chat with a connection</DropdownMenuLabel>
          {isLoading ? (
            <p className="px-1.5 py-2 text-sm text-muted-foreground">Loading…</p>
          ) : !connections || connections.items.length === 0 ? (
            <p className="px-1.5 py-2 text-sm text-muted-foreground">
              No connections yet — connect with people first.
            </p>
          ) : (
            connections.items.map((connection) => (
              <DropdownMenuItem
                key={connection.id}
                onClick={() => void handlePick(connection.counterpart.userId)}
              >
                <Avatar size="sm">
                  <AvatarImage src={connection.counterpart.avatarUrl ?? undefined} />
                  <AvatarFallback>{initialsFromName(connection.counterpart.name)}</AvatarFallback>
                </Avatar>
                {connection.counterpart.name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ConversationRow({
  conversation,
  active,
  onSelect,
}: {
  conversation: ConversationListItem;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-3 border-b border-border px-5 py-3.5 text-left transition-colors hover:bg-muted",
          active && "bg-muted",
        )}
      >
        <Avatar>
          <AvatarImage src={conversation.otherParticipant.avatarUrl ?? undefined} />
          <AvatarFallback>{initialsFromName(conversation.otherParticipant.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
            {conversation.otherParticipant.name}
            {conversation.context === "BRAND_DEAL" ? (
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                Brand Deal
              </Badge>
            ) : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.lastMessageAt ? formatRelativeTime(conversation.lastMessageAt) : "No messages yet"}
          </p>
        </div>
      </button>
    </li>
  );
}

function ThreadView({ conversationId }: { conversationId: string }) {
  const { data: session } = useGetSessionQuery();
  const { data, isLoading } = useGetMessagesQuery(conversationId);
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markRead] = useMarkConversationReadMutation();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    markRead(conversationId);
  }, [conversationId, markRead]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    const body = draft;
    setDraft("");
    await sendMessage({ conversationId, body });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        ) : !data || data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet — say hello.</p>
        ) : (
          [...data.items].reverse().map((message) => {
            const isOwn = message.senderId === session?.user?.id;
            return (
              <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-sm rounded-2xl px-4 py-2.5 text-sm",
                    isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {message.body}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-4">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isSending || !draft.trim()} aria-label="Send">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
