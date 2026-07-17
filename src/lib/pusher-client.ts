import PusherClient from "pusher-js";

let client: PusherClient | undefined;

/** Lazy singleton — constructed on first use so it never runs at module-load
 * time (matches the backend's reasoning in lib/pusher.ts for not throwing
 * during Next.js's build-time page collection). Public channels only (see
 * backend/src/lib/pusher.ts's `conversationChannel`), so no authEndpoint is
 * needed here. */
export function getPusherClient(): PusherClient {
  client ??= new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });
  return client;
}

export function conversationChannelName(conversationId: string): string {
  return `conversation-${conversationId}`;
}

export const PUSHER_EVENTS = {
  newMessage: "new-message",
  typing: "typing",
  messageRead: "message-read",
} as const;
