import { api } from "@/lib/redux/api";
import type { ConversationListItem, Message } from "@/lib/types/messaging";

interface MessagesResponse {
  items: Message[];
  page: number;
  pageSize: number;
  total: number;
}

export const messagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<{ items: ConversationListItem[] }, void>({
      query: () => "/conversations",
      transformResponse: (response: { data: { items: ConversationListItem[] } }) => response.data,
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
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: "Messages", id: conversationId },
        "Conversations",
      ],
    }),
    markConversationRead: builder.mutation<void, string>({
      query: (conversationId) => ({ url: `/conversations/${conversationId}/read`, method: "POST" }),
      invalidatesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useStartConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
} = messagesApi;
