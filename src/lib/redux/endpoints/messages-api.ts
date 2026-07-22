import { api } from "@/lib/redux/api";
import { authApi } from "@/lib/redux/endpoints/auth-api";
import type { ConversationListItem, Message } from "@/lib/types/messaging";

interface MessagesResponse {
  items: Message[];
  page: number;
  pageSize: number;
  total: number;
}

interface ConversationsResponse {
  items: ConversationListItem[];
  page: number;
  pageSize: number;
  total: number;
}

function toggleCachedFlag(
  conversationId: string,
  field: "isPinned" | "isMuted" | "isArchived",
) {
  return messagesApi.util.updateQueryData("getConversations", undefined, (draft) => {
    const conversation = draft.items.find((c) => c.id === conversationId);
    if (conversation) conversation[field] = !conversation[field];
  });
}

export const messagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Bounded to a sane default page size — the list previously fetched every
    // conversation the user had unconditionally, which was the actual cause
    // of "opening a conversation feels laggy" (TC-102): the whole inbox was
    // refetched on every load, not just a slow individual-thread fetch.
    getConversations: builder.query<ConversationsResponse, void>({
      query: () => ({ url: "/conversations", params: { page: 1, pageSize: 50 } }),
      transformResponse: (response: { data: ConversationsResponse }) => response.data,
      providesTags: ["Conversations"],
    }),
    startConversation: builder.mutation<ConversationListItem, string>({
      query: (otherUserId) => ({ url: "/conversations", method: "POST", body: { otherUserId } }),
      transformResponse: (response: { data: ConversationListItem }) => response.data,
      invalidatesTags: ["Conversations"],
    }),
    getMessages: builder.query<MessagesResponse, string>({
      query: (conversationId) => `/conversations/${conversationId}/messages`,
      transformResponse: (response: { data: MessagesResponse }) => response.data,
      providesTags: (_result, _error, conversationId) => [{ type: "Messages", id: conversationId }],
    }),
    sendMessage: builder.mutation<Message, { conversationId: string; body: string }>({
      query: ({ conversationId, body }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body: { body },
      }),
      transformResponse: (response: { data: Message }) => response.data,
      // Optimistic append so the bubble renders instantly instead of waiting
      // on the round trip — `invalidatesTags` below still refetches on
      // success/failure, which reconciles (or rolls back) this temp entry.
      async onQueryStarted({ conversationId, body }, { dispatch, getState, queryFulfilled }) {
        const senderId = authApi.endpoints.getSession.select()(getState()).data?.user?.id;
        if (!senderId) return;

        const patchResult = dispatch(
          messagesApi.util.updateQueryData("getMessages", conversationId, (draft) => {
            draft.items.unshift({
              id: `optimistic-${Date.now()}`,
              conversationId,
              senderId,
              body,
              attachmentUrl: null,
              readBy: [senderId],
              createdAt: new Date().toISOString(),
            });
            draft.total += 1;
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: "Messages", id: conversationId },
        "Conversations",
      ],
    }),
    markConversationRead: builder.mutation<void, string>({
      query: (conversationId) => ({ url: `/conversations/${conversationId}/read`, method: "POST" }),
      invalidatesTags: ["Dashboard"],
    }),
    notifyTyping: builder.mutation<void, string>({
      query: (conversationId) => ({ url: `/conversations/${conversationId}/typing`, method: "POST" }),
    }),
    // These three toggles previously waited on the mutation's round trip and
    // then a full 50-item `getConversations` refetch before the row visibly
    // changed — two sequential network trips for what should read as an
    // instant checkbox flip. Flipping the flag in the cache immediately
    // fixes the perceived lag; `invalidatesTags` still reconciles with the
    // server afterward (and `patchResult.undo()` rolls back on failure).
    toggleConversationPin: builder.mutation<void, string>({
      query: (conversationId) => ({ url: `/conversations/${conversationId}/pin`, method: "POST" }),
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        const patch = dispatch(toggleCachedFlag(conversationId, "isPinned"));
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Conversations"],
    }),
    toggleConversationMute: builder.mutation<void, string>({
      query: (conversationId) => ({ url: `/conversations/${conversationId}/mute`, method: "POST" }),
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        const patch = dispatch(toggleCachedFlag(conversationId, "isMuted"));
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Conversations"],
    }),
    toggleConversationArchive: builder.mutation<void, string>({
      query: (conversationId) => ({ url: `/conversations/${conversationId}/archive`, method: "POST" }),
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        const patch = dispatch(toggleCachedFlag(conversationId, "isArchived"));
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: ["Conversations"],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useStartConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
  useNotifyTypingMutation,
  useToggleConversationPinMutation,
  useToggleConversationMuteMutation,
  useToggleConversationArchiveMutation,
} = messagesApi;
