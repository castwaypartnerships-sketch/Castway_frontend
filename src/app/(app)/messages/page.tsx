"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Send } from "lucide-react";

import type { ConversationListItem } from "@/lib/types/messaging";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useMarkConversationReadMutation,
  useSendMessageMutation,
} from "@/lib/redux/endpoints/messages-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { data: conversations, isLoading } = useGetConversationsQuery();
  const [manuallySelectedId, setManuallySelectedId] = useState<string | null>(null);
  const selectedId = manuallySelectedId ?? conversations?.items[0]?.id ?? null;

  return (
    <div className="flex h-full">
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-border">
        <div className="border-b border-border px-5 py-4">
          <h1 className="text-sm font-semibold text-foreground">Messages</h1>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : !conversations || conversations.items.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          <ul>
            {conversations.items.map((conversation) => (
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
          <p className="truncate text-sm font-medium text-foreground">
            {conversation.otherParticipant.name}
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
