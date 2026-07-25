"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { useGetMyRosterQuery } from "@/lib/redux/endpoints/roster-api";
import {
  useGetConversationsOnBehalfQuery,
  useGetMessagesOnBehalfQuery,
  useSendMessageOnBehalfMutation,
} from "@/lib/redux/endpoints/messages-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Read/reply side of act-on-behalf-of messaging ("respond"/"negotiate" from
 * the AGENCIES spec) — a compact, standalone view rather than folding this
 * into the main Messages page, which has real-time/typing/optimistic-update
 * state that a second identity would complicate. Deliberately no Pusher
 * realtime here; refetch-on-send is enough for a first pass. */
export default function RosterInboxPage() {
  const { data: roster, isLoading: isLoadingRoster } = useGetMyRosterQuery();
  const acceptedMembers = (roster?.items ?? []).filter((entry) => entry.status === "ACCEPTED" && entry.member);
  const [memberUserId, setMemberUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  const { data: conversations, isLoading: isLoadingConversations } = useGetConversationsOnBehalfQuery(
    memberUserId ?? "",
    { skip: !memberUserId },
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
      <div>
        <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Roster Inbox
        </h1>
        <p className="text-sm text-muted-foreground">
          Reply to a roster member&apos;s conversations on their behalf.
        </p>
      </div>

      {isLoadingRoster ? (
        <div className="h-10 animate-pulse rounded-xl bg-muted" />
      ) : acceptedMembers.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No accepted roster members yet.
        </p>
      ) : (
        <>
          <Select
            value={memberUserId}
            onValueChange={(value) => {
              setMemberUserId(value);
              setConversationId(undefined);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="View inbox for…" />
            </SelectTrigger>
            <SelectContent>
              {acceptedMembers.map((entry) => (
                <SelectItem key={entry.id} value={entry.member!.userId}>
                  {entry.member!.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {memberUserId ? (
            <div className="flex overflow-hidden rounded-2xl border border-border">
              <aside className="w-64 shrink-0 border-r border-border">
                {isLoadingConversations ? (
                  <div className="space-y-2 p-3">
                    <div className="h-14 animate-pulse rounded-xl bg-muted" />
                    <div className="h-14 animate-pulse rounded-xl bg-muted" />
                  </div>
                ) : !conversations || conversations.items.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
                ) : (
                  <ul>
                    {conversations.items.map((conversation) => (
                      <li key={conversation.id}>
                        <button
                          type="button"
                          onClick={() => setConversationId(conversation.id)}
                          className={cn(
                            "flex w-full items-center gap-2.5 border-b border-border px-3 py-3 text-left transition-colors hover:bg-muted",
                            conversation.id === conversationId && "bg-muted",
                          )}
                        >
                          <Avatar size="sm">
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
                              {conversation.lastMessageAt
                                ? formatRelativeTime(conversation.lastMessageAt)
                                : "No messages yet"}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>
              <div className="flex-1">
                {conversationId ? (
                  <ThreadView memberUserId={memberUserId} conversationId={conversationId} />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
                    Select a conversation.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function ThreadView({ memberUserId, conversationId }: { memberUserId: string; conversationId: string }) {
  const { data, isLoading } = useGetMessagesOnBehalfQuery({ conversationId, memberUserId });
  const [sendMessage, { isLoading: isSending }] = useSendMessageOnBehalfMutation();
  const [draft, setDraft] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    const body = draft;
    setDraft("");
    try {
      await sendMessage({ conversationId, memberUserId, body }).unwrap();
    } catch {
      toast.error("Couldn't send that message. Please try again.");
    }
  }

  return (
    <div className="flex h-[28rem] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        ) : !data || data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          [...data.items].reverse().map((message) => {
            const isFromMember = message.senderId === memberUserId;
            return (
              <div key={message.id} className={cn("flex", isFromMember ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-sm rounded-2xl px-4 py-2.5 text-sm",
                    isFromMember ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {message.body}
                  {message.actingAgencyUserId ? (
                    <p className="mt-1 text-[10px] opacity-70">Sent by your agency</p>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Reply on their behalf…"
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isSending || !draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
