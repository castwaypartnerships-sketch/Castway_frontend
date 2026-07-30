"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { PresenceChannel } from "pusher-js";
import {
  Archive,
  ArchiveRestore,
  BellOff,
  Check,
  CheckCheck,
  MoreVertical,
  Pin,
  Search,
  Send,
  SquarePen,
} from "lucide-react";
import { toast } from "sonner";

import type { ConversationListItem, DealInquiryStatus } from "@/lib/types/messaging";
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
  useUpdateDealStatusMutation,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type InboxFilter = "all" | "unread" | "brand-deals";

export default function MessagesPage() {
  const { data: conversations, isLoading } = useGetConversationsQuery();
  const { data: session } = useGetSessionQuery();
  const searchParams = useSearchParams();
  const conversationIdFromQuery = searchParams.get("conversationId");
  const [manuallySelectedId, setManuallySelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");

  const isCreator = session?.user?.role === "CREATOR";
  const filtered = conversations?.items.filter((c) => {
    if (filter === "brand-deals" && c.context !== "BRAND_DEAL") return false;
    if (filter === "unread" && c.unreadCount === 0) return false;
    if (search.trim() && !c.otherParticipant.name.toLowerCase().includes(search.trim().toLowerCase())) {
      return false;
    }
    return true;
  });
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
    <div className="flex h-full bg-card">
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-border">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Messages</h1>
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

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="rounded-full bg-muted pl-8"
            />
          </div>

          {!showArchived ? (
            <div className="mt-3 flex items-center gap-2">
              {(
                [
                  { value: "all", label: "All" },
                  { value: "unread", label: "Unread" },
                  ...(isCreator ? [{ value: "brand-deals" as const, label: "Brand Deals" }] : []),
                ] as { value: InboxFilter; label: string }[]
              ).map((tab) => {
                const isActive = tab.value === filter;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setFilter(tab.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                      isActive
                        ? "border-transparent bg-[#2d4a35] text-white dark:bg-[#25422d]"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
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
                : filter === "unread"
                  ? "No unread conversations."
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
                isCreator={isCreator}
                onSelect={() => setManuallySelectedId(conversation.id)}
              />
            ))}
          </ul>
        )}
      </aside>

      <div className="flex-1 bg-[#f9fafb] dark:bg-background">
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

const DEAL_STATUS_LABELS: Record<DealInquiryStatus, string> = {
  NEW: "New",
  RESPONDED: "Responded",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};

function ConversationRow({
  conversation,
  active,
  online,
  isCreator,
  onSelect,
}: {
  conversation: ConversationListItem;
  active: boolean;
  online: boolean;
  isCreator: boolean;
  onSelect: () => void;
}) {
  const [togglePin] = useToggleConversationPinMutation();
  const [toggleMute] = useToggleConversationMuteMutation();
  const [toggleArchive] = useToggleConversationArchiveMutation();
  const [updateDealStatus] = useUpdateDealStatusMutation();

  return (
    <li>
      <div
        className={cn(
          "group flex w-full items-center gap-3 border-l-4 border-transparent px-5 py-3.5 transition-colors hover:bg-muted",
          active && "border-[#476948] bg-[#e6f4ea] dark:border-[#daf0dd] dark:bg-[#1a261d]",
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
        >
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
            {conversation.context === "BRAND_DEAL" && conversation.dealBudget ? (
              <p className="truncate text-xs font-medium text-[#476948] dark:text-[#a7d9b5]">
                {conversation.dealBudget}
              </p>
            ) : null}
          </div>
          {conversation.unreadCount > 0 ? (
            <span className="size-2 shrink-0 rounded-full bg-[#476948] dark:bg-[#daf0dd]" aria-label="Unread" />
          ) : null}
        </button>

        {conversation.context === "BRAND_DEAL" && isCreator && conversation.dealStatus ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="shrink-0 text-[10px]">
                  {DEAL_STATUS_LABELS[conversation.dealStatus]}
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {(Object.keys(DEAL_STATUS_LABELS) as DealInquiryStatus[]).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => updateDealStatus({ conversationId: conversation.id, status })}
                >
                  {DEAL_STATUS_LABELS[status]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

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

/** Groups messages by calendar day for the "Today"/"Yesterday"/date divider
 * pills — purely a presentation grouping over real message timestamps, no
 * new data. `messages` must already be in oldest-first order. */
function groupMessagesByDay(
  messages: { id: string; createdAt: string }[],
): { dayLabel: string; messages: { id: string; createdAt: string }[] }[] {
  const groups: { dayLabel: string; messages: { id: string; createdAt: string }[] }[] = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  function dayLabelFor(dateStr: string): string {
    const date = new Date(dateStr);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  for (const message of messages) {
    const label = dayLabelFor(message.createdAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dayLabel === label) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ dayLabel: label, messages: [message] });
    }
  }
  return groups;
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

  const orderedMessages = useMemo(() => (data ? [...data.items].reverse() : []), [data]);
  const dayGroups = useMemo(() => groupMessagesByDay(orderedMessages), [orderedMessages]);
  const messageById = useMemo(() => new Map(orderedMessages.map((m) => [m.id, m])), [orderedMessages]);

  return (
    <div className="flex h-full flex-col">
      <Link
        href={`/profile/${conversation.otherParticipant.username}`}
        className="group/thread-header flex items-center gap-3 border-b border-border bg-card px-6 py-3.5 transition-colors hover:bg-accent/50"
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

      <div className="flex-1 space-y-1 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        ) : orderedMessages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet — say hello.</p>
        ) : (
          dayGroups.map((group) => (
            <div key={group.dayLabel} className="space-y-3 pb-3">
              <div className="flex justify-center py-2">
                <span className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                  {group.dayLabel}
                </span>
              </div>
              {group.messages.map((groupedMessage) => {
                const message = messageById.get(groupedMessage.id);
                if (!message) return null;
                const isOwn = message.senderId === session?.user?.id;
                const isRead = message.readBy.includes(conversation.otherParticipant.userId);
                return (
                  <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-sm rounded-2xl px-4 py-2.5 text-sm",
                        isOwn
                          ? "bg-[#476948] text-white dark:bg-[#1c3322]"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {message.body}
                      {isOwn ? (
                        <span className="mt-1 flex justify-end" aria-label={isRead ? "Read" : "Sent"}>
                          {isRead ? (
                            <CheckCheck className="size-3.5 text-white/80" />
                          ) : (
                            <Check className="size-3.5 text-white/60" />
                          )}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
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
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border bg-card p-4">
      <Input
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-full bg-muted px-4"
      />
      <button
        type="submit"
        disabled={isSending || !draft.trim()}
        aria-label="Send"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#476948] text-white transition-colors hover:bg-[#3d5a3e] disabled:opacity-50 dark:bg-[#1c3322] dark:hover:bg-[#25422d]"
      >
        <Send className="size-4" />
      </button>
    </form>
  );
}
