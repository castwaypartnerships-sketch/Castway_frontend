import { api } from "@/lib/redux/api";
import type { ConnectionListItem } from "@/lib/types/connection";
import type { SuggestedConnection } from "@/lib/types/feed";

export const connectionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getConnections: builder.query<{ items: ConnectionListItem[] }, void>({
      query: () => "/connections",
      transformResponse: (response: { data: { items: ConnectionListItem[] } }) => response.data,
      providesTags: ["Connections"],
    }),
    getPendingConnections: builder.query<
      { incoming: ConnectionListItem[]; outgoing: ConnectionListItem[] },
      void
    >({
      query: () => "/connections/pending",
      transformResponse: (response: {
        data: { incoming: ConnectionListItem[]; outgoing: ConnectionListItem[] };
      }) => response.data,
      providesTags: ["PendingConnections"],
    }),
    getSuggestedConnections: builder.query<{ items: SuggestedConnection[] }, void>({
      query: () => "/connections/suggested",
      transformResponse: (response: { data: { items: SuggestedConnection[] } }) => response.data,
      providesTags: ["SuggestedConnections"],
    }),
    sendConnectionRequest: builder.mutation<void, string>({
      query: (addresseeId) => ({
        url: "/connections",
        method: "POST",
        body: { addresseeId },
      }),
      invalidatesTags: ["SuggestedConnections", "PendingConnections"],
    }),
    acceptConnection: builder.mutation<void, string>({
      query: (connectionId) => ({ url: `/connections/${connectionId}/accept`, method: "POST" }),
      invalidatesTags: ["Connections", "PendingConnections", "Dashboard"],
    }),
    rejectConnection: builder.mutation<void, string>({
      query: (connectionId) => ({ url: `/connections/${connectionId}/reject`, method: "POST" }),
      invalidatesTags: ["PendingConnections"],
    }),
    removeConnection: builder.mutation<void, string>({
      query: (connectionId) => ({ url: `/connections/${connectionId}`, method: "DELETE" }),
      invalidatesTags: ["Connections", "Dashboard"],
    }),
    getBlockedConnections: builder.query<{ items: ConnectionListItem[] }, void>({
      query: () => "/connections/blocked",
      transformResponse: (response: { data: { items: ConnectionListItem[] } }) => response.data,
      providesTags: ["BlockedConnections"],
    }),
    blockUser: builder.mutation<void, string>({
      query: (userId) => ({ url: "/connections/block", method: "POST", body: { userId } }),
      invalidatesTags: [
        "Connections",
        "PendingConnections",
        "SuggestedConnections",
        "BlockedConnections",
      ],
      // Drop the row immediately rather than waiting on the invalidated
      // refetch — blocking someone is a one-way action, so there's nothing
      // to reconcile even on rollback beyond letting the refetch correct it.
      onQueryStarted: async (userId, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          connectionsApi.util.updateQueryData("getConnections", undefined, (draft) => {
            draft.items = draft.items.filter((item) => item.counterpart.userId !== userId);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    unblockUser: builder.mutation<void, string>({
      query: (connectionId) => ({ url: `/connections/${connectionId}/unblock`, method: "POST" }),
      invalidatesTags: ["BlockedConnections"],
    }),
  }),
});

export const {
  useGetConnectionsQuery,
  useGetPendingConnectionsQuery,
  useGetSuggestedConnectionsQuery,
  useSendConnectionRequestMutation,
  useAcceptConnectionMutation,
  useRejectConnectionMutation,
  useRemoveConnectionMutation,
  useGetBlockedConnectionsQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
} = connectionsApi;
