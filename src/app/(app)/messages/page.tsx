"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { PresenceChannel } from "pusher-js";
import { Archive, ArchiveRestore, BellOff, Check, CheckCheck, MoreVertical, Pin, Send, SquarePen } from "lucide-react";
import { toast } from "sonner";

import type { ConversationListItem } from "@/lib/types/messaging";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import {
  messagesApi,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useMarkConversationReadMutation,
  useNotifyTypingMutation,
  useSendMessageMutation,
  useStartConversationMutation,
  useToggleConversationArchiveMutation,
  useToggleConversationMuteMutation,
  useToggleConversationPinMutation,
} from "@/lib/redux/endpoints/messages-api";
import { useGetConnectionsQuery } from "@/lib/redux/endpoints/connections-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  conversationChannelName,
  getPusherClient,
  PRESENCE_ONLINE_CHANNEL,
  PUSHER_EVENTS,
} from "@/lib/pusher-client";
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
  const [showArchived, setShowArchived] = useState(false);

  const isCreator = session?.user?.role === "CREATOR";
  const filtered = conversations?.items.filter((c) => filter === "all" || c.context === "BRAND_DEAL");
  const archived = filtered?.filter((c) => c.isArchived) ?? [];
  // Pinned first, otherwise most-recent-first (the order the backend already
  // returns), so pinning a conversation reliably moves it to the top.
  const active = (filtered?.filter((c) => !c.isArchived) ?? []).sort(
    (a, b) => Number(b.isPinned) - Number(a.isPinned),
  );
  const items = showArchived ? archived : active;

  const selectedId = manuallySelectedId ?? conversationIdFromQuery ?? active[0]?.id ?? null;
  const selectedConversation = conversations?.items.find((c) => c.id === selectedId) ?? null;

  const onlineUserIds = useOnlinePresence();
  useConversationsRealtime(conversations?.items.map((c) => c.id) ?? []);

  return (
    <div className="flex h-full">
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-border">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-sm font-semibold tracking-tight text-foreground">Messages</h1>
            <div className="flex items-center gap-1">
              <Button
                variant={showArchived ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label={showArchived ? "Show inbox" : "Show archived"}
                aria-pressed={showArchived}
                onClick={() => setShowArchived((prev) => !prev)}
              >
                {showArchived ? <ArchiveRestore className="size-4" /> : <Archive className="size-4" />}
              </Button>
              <NewChatMenu onStarted={setManuallySelectedId} />
            </div>
          </div>
          {isCreator && !showArchived ? (
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
        ) : items.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            {showArchived
              ? "No archived conversations."
              : filter === "brand-deals"
                ? "No Brand Deal conversations yet."
                : "No conversations yet."}
          </p>
        ) : (
          <ul>
            {items.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === selectedId}
                online={onlineUserIds.has(conversation.otherParticipant.userId)}
                onSelect={() => setManuallySelectedId(conversation.id)}
              />
            ))}
          </ul>
        )}
      </aside>

      <div className="flex-1">
        {selectedId && selectedConversation ? (
          <ThreadView
            key={selectedId}
            conversationId={selectedId}
            conversation={selectedConversation}
            online={onlineUserIds.has(selectedConversation.otherParticipant.userId)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select a conversation to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}

/** Tracks who's currently online app-wide via one shared Pusher presence
 * channel (see `PRESENCE_ONLINE_CHANNEL`) rather than a per-conversation
 * channel — presence is a global fact about a user, not scoped to a thread.
 * Requires the signed auth wired up in `getPusherClient` (`/api/pusher/auth`);
 * subscribing without a valid session simply fails silently (no channel
 * members), which is fine since this page is already auth-gated. */
function useOnlinePresence(): Set<string> {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const client = getPusherClient();
    const channel = client.subscribe(PRESENCE_ONLINE_CHANNEL) as PresenceChannel;

    function sync() {
      const ids = new Set<string>();
      channel.members.each((member: { id: string }) => ids.add(member.id));
      setOnlineUserIds(ids);
    }

    channel.bind("pusher:subscription_succeeded", sync);
    channel.bind("pusher:member_added", sync);
    channel.bind("pusher:member_removed", sync);

    return () => {
      channel.unbind("pusher:subscription_succeeded", sync);
      channel.unbind("pusher:member_added", sync);
      channel.unbind("pusher:member_removed", sync);
      client.unsubscribe(PRESENCE_ONLINE_CHANNEL);
    };
  }, []);

  return onlineUserIds;
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
  online,
  onSelect,
}: {
  conversation: ConversationListItem;
  active: boolean;
  online: boolean;
  onSelect: () => void;
}) {
  const [togglePin] = useToggleConversationPinMutation();
  const [toggleMute] = useToggleConversationMuteMutation();
  const [toggleArchive] = useToggleConversationArchiveMutation();

  return (
    <li>
      <div
        className={cn(
          "group flex w-full items-center gap-3 border-b border-border px-5 py-3.5 transition-colors hover:bg-muted",
          active && "bg-muted",
        )}
      >
        <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="relative shrink-0">
            <Avatar>
              <AvatarImage src={conversation.otherParticipant.avatarUrl ?? undefined} />
              <AvatarFallback>{initialsFromName(conversation.otherParticipant.name)}</AvatarFallback>
            </Avatar>
            {online ? (
              <span
                className="absolute right-0 bottom-0 size-2.5 rounded-full bg-success ring-2 ring-background"
                aria-label="Online"
              />
            ) : null}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
              {conversation.isPinned ? <Pin className="size-3 shrink-0 text-muted-foreground" /> : null}
              {conversation.isMuted ? <BellOff className="size-3 shrink-0 text-muted-foreground" /> : null}
              {conversation.otherParticipant.name}
              {conversation.context === "BRAND_DEAL" ? (
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  Brand Deal
                </Badge>
              ) : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {online
                ? "Online"
                : conversation.lastMessageAt
                  ? formatRelativeTime(conversation.lastMessageAt)
                  : "No messages yet"}
            </p>
          </div>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 opacity-0 group-hover:opacity-100 data-[popup-open]:opacity-100"
                aria-label="Conversation options"
              >
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => togglePin(conversation.id)}>
              {conversation.isPinned ? "Unpin" : "Pin"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleMute(conversation.id)}>
              {conversation.isMuted ? "Unmute" : "Mute"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleArchive(conversation.id)}>
              {conversation.isArchived ? "Unarchive" : "Archive"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

function ThreadView({
  conversationId,
  conversation,
  online,
}: {
  conversationId: string;
  conversation: ConversationListItem;
  online: boolean;
}) {
  const { data: session } = useGetSessionQuery();
  const { data, isLoading } = useGetMessagesQuery(conversationId);
  const [markRead] = useMarkConversationReadMutation();
  const isOtherTyping = useTypingIndicator(conversationId, conversation.otherParticipant.userId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead(conversationId);
  }, [conversationId, markRead]);

  // Scroll to the newest message (the last item after `.reverse()`) whenever
  // the list changes — first load, a new send (optimistic or confirmed), or
  // an incoming message via Pusher. Keyed off the last message's id/count
  // rather than `data` itself, since `data` is a new object reference on
  // every refetch even when the visible messages haven't actually changed.
  const lastMessageId = data?.items[0]?.id;
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [conversationId, lastMessageId, data?.items.length]);

  return (
    <div className="flex h-full flex-col">
      <Link
        href={`/profile/${conversation.otherParticipant.username}`}
        className="group/thread-header flex items-center gap-3 border-b border-border px-6 py-3.5 transition-colors hover:bg-accent/50"
      >
        <span className="relative shrink-0">
          <Avatar size="sm" className="transition-transform group-hover/thread-header:scale-105">
            <AvatarImage src={conversation.otherParticipant.avatarUrl ?? undefined} />
            <AvatarFallback>{initialsFromName(conversation.otherParticipant.name)}</AvatarFallback>
          </Avatar>
          {online ? (
            <span className="absolute right-0 bottom-0 size-2 rounded-full bg-success ring-2 ring-background" />
          ) : null}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground group-hover/thread-header:underline">
            {conversation.otherParticipant.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {isOtherTyping
              ? "Typing…"
              : online
                ? "Online"
                : conversation.otherParticipant.lastSeenAt
                  ? `Last seen ${formatRelativeTime(conversation.otherParticipant.lastSeenAt)}`
                  : "Offline"}
          </p>
        </div>
      </Link>

      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        ) : !data || data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet — say hello.</p>
        ) : (
          [...data.items].reverse().map((message) => {
            const isOwn = message.senderId === session?.user?.id;
            const isRead = message.readBy.includes(conversation.otherParticipant.userId);
            return (
              <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-sm rounded-2xl px-4 py-2.5 text-sm",
                    isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {message.body}
                  {isOwn ? (
                    <span className="mt-1 flex justify-end" aria-label={isRead ? "Read" : "Sent"}>
                      {isRead ? (
                        <CheckCheck className="size-3.5 text-primary-foreground/80" />
                      ) : (
                        <Check className="size-3.5 text-primary-foreground/60" />
                      )}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      <MessageComposer conversationId={conversationId} />
    </div>
  );
}

/** Listens for the other participant's typing events on the conversation's
 * existing Pusher channel (the backend already publishes these — see
 * `messaging.service.ts::notifyTyping` — nothing previously subscribed on the
 * frontend). Each event means "still typing as of now"; auto-clears after 3s
 * of silence rather than waiting for an explicit "stopped typing" event,
 * since the backend has no such event and a stuck indicator would be worse
 * than one that clears a beat late. */
function useTypingIndicator(conversationId: string, otherUserId: string): boolean {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(false);
    const client = getPusherClient();
    const channel = client.subscribe(conversationChannelName(conversationId));
    let clearTimer: ReturnType<typeof setTimeout> | undefined;

    function onTyping(payload: { userId: string }) {
      if (payload.userId !== otherUserId) return;
      setIsTyping(true);
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(() => setIsTyping(false), 3000);
    }

    channel.bind(PUSHER_EVENTS.typing, onTyping);
    return () => {
      channel.unbind(PUSHER_EVENTS.typing, onTyping);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [conversationId, otherUserId]);

  return isTyping;
}

// Kept separate from `ThreadView` so a keystroke here only re-renders this
// small form, not the whole (potentially long) reversed message list above.
function MessageComposer({ conversationId }: { conversationId: string }) {
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [notifyTyping] = useNotifyTypingMutation();
  const [draft, setDraft] = useState("");
  const lastTypingNotifyAt = useRef(0);

  function handleChange(value: string) {
    setDraft(value);
    // Throttled, not debounced — sends at most once every 2s of continuous
    // typing rather than waiting for a pause, so the other side's "Typing…"
    // stays live throughout a long message instead of flickering off.
    const now = Date.now();
    if (value.trim() && now - lastTypingNotifyAt.current > 2000) {
      lastTypingNotifyAt.current = now;
      notifyTyping(conversationId);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    const body = draft;
    setDraft("");
    try {
      await sendMessage({ conversationId, body }).unwrap();
    } catch {
      toast.error("Couldn't send that message. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-4">
      <Input
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Write a message…"
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={isSending || !draft.trim()} aria-label="Send">
        <Send className="size-4" />
      </Button>
    </form>
  );
}
