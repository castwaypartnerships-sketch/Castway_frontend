"use client";

import { useState } from "react";
import { Check, Link2, Send, Share2 } from "lucide-react";
import { toast } from "sonner";

import { useGetConnectionsQuery } from "@/lib/redux/endpoints/connections-api";
import { useSendMessageMutation, useStartConversationMutation } from "@/lib/redux/endpoints/messages-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initialsFromName } from "@/lib/format";

function postUrl(postId: string): string {
  return `${window.location.origin}/feed/${postId}`;
}

export function SharePostMenu({ postId, title }: { postId: string; title: string }) {
  const [sendingToUserId, setSendingToUserId] = useState<string | null>(null);
  const { data: connections } = useGetConnectionsQuery();
  const [startConversation] = useStartConversationMutation();
  const [sendMessage] = useSendMessageMutation();

  async function handleCopyLink() {
    await navigator.clipboard.writeText(postUrl(postId));
    toast.success("Link copied");
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url: postUrl(postId) });
    } catch {
      // User dismissed the share sheet — not an error.
    }
  }

  async function handleSendToConnection(userId: string, name: string) {
    setSendingToUserId(userId);
    try {
      const conversation = await startConversation(userId).unwrap();
      await sendMessage({ conversationId: conversation.id, body: postUrl(postId) }).unwrap();
      toast.success(`Sent to ${name}`);
    } catch {
      toast.error(`Couldn't send that to ${name}. Please try again.`);
    } finally {
      setSendingToUserId(null);
    }
  }

  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Share post">
            <Share2 className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => void handleCopyLink()}>
            <Link2 className="size-4" />
            Copy link
          </DropdownMenuItem>
          {canNativeShare ? (
            <DropdownMenuItem onClick={() => void handleNativeShare()}>
              <Share2 className="size-4" />
              Share…
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Send to a connection</DropdownMenuLabel>
          {!connections || connections.items.length === 0 ? (
            <p className="px-1.5 py-2 text-sm text-muted-foreground">
              No connections yet — connect with people first.
            </p>
          ) : (
            connections.items.map((connection) => (
              <DropdownMenuItem
                key={connection.id}
                disabled={sendingToUserId === connection.counterpart.userId}
                onClick={() => void handleSendToConnection(connection.counterpart.userId, connection.counterpart.name)}
              >
                <Avatar size="sm">
                  <AvatarImage src={connection.counterpart.avatarUrl ?? undefined} />
                  <AvatarFallback>{initialsFromName(connection.counterpart.name)}</AvatarFallback>
                </Avatar>
                {connection.counterpart.name}
                {sendingToUserId === connection.counterpart.userId ? (
                  <Check className="ml-auto size-3.5 animate-pulse" />
                ) : (
                  <Send className="ml-auto size-3.5 text-muted-foreground" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
