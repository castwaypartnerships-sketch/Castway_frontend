import PusherClient from "pusher-js";

let client: PusherClient | undefined;

/** Lazy singleton — constructed on first use so it never runs at module-load
 * time (matches the backend's reasoning in lib/pusher.ts for not throwing
 * during Next.js's build-time page collection). `conversation-*` channels are
 * public (see backend/src/lib/pusher.ts's `conversationChannel`), but the one
 * presence channel (`PRESENCE_ONLINE_CHANNEL`, for online/offline — TC-146)
 * needs server-signed auth, hence the `channelAuthorization.customHandler`:
 * pusher-js's built-in ajax authorizer doesn't send credentials, and this
 * app's session is an httpOnly cookie, so a plain `fetch` with
 * `credentials: "include"` against the same-origin `/api/pusher/auth` route
 * (proxied to the backend, same as every other request — see lib/redux/api.ts)
 * is used instead. */
export function getPusherClient(): PusherClient {
  client ??= new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    channelAuthorization: {
      customHandler: ({ socketId, channelName }, callback) => {
        fetch("/api/pusher/auth", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ socket_id: socketId, channel_name: channelName }),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`Pusher auth failed with status ${res.status}`);
            return res.json();
          })
          .then((data) => callback(null, data))
          .catch((error: Error) => callback(error, null));
      },
    },
  });
  return client;
}

export function conversationChannelName(conversationId: string): string {
  return `conversation-${conversationId}`;
}

export const PRESENCE_ONLINE_CHANNEL = "presence-online";

export const PUSHER_EVENTS = {
  newMessage: "new-message",
  typing: "typing",
  messageRead: "message-read",
} as const;
