import { api } from "@/lib/redux/api";
import type { RosterEntryDto } from "@/lib/types/roster";

export const rosterApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyRoster: builder.query<{ items: RosterEntryDto[] }, void>({
      query: () => "/roster",
      transformResponse: (response: { data: { items: RosterEntryDto[] } }) => response.data,
      providesTags: ["Roster"],
    }),
    getPendingRosterInvites: builder.query<{ items: RosterEntryDto[] }, void>({
      query: () => "/roster/pending",
      transformResponse: (response: { data: { items: RosterEntryDto[] } }) => response.data,
      providesTags: ["Roster"],
    }),
    getRepresentingAgencies: builder.query<{ items: RosterEntryDto[] }, string>({
      query: (userId) => `/roster/representing/${userId}`,
      transformResponse: (response: { data: { items: RosterEntryDto[] } }) => response.data,
    }),
    inviteToRoster: builder.mutation<void, string>({
      query: (username) => ({ url: "/roster/invite", method: "POST", body: { username } }),
      invalidatesTags: ["Roster"],
    }),
    acceptRosterInvite: builder.mutation<void, string>({
      query: (id) => ({ url: `/roster/${id}/accept`, method: "POST" }),
      invalidatesTags: ["Roster"],
    }),
    declineRosterInvite: builder.mutation<void, string>({
      query: (id) => ({ url: `/roster/${id}/decline`, method: "POST" }),
      invalidatesTags: ["Roster"],
    }),
    removeFromRoster: builder.mutation<void, string>({
      query: (id) => ({ url: `/roster/${id}`, method: "DELETE" }),
      invalidatesTags: ["Roster"],
    }),
  }),
});

export const {
  useGetMyRosterQuery,
  useGetPendingRosterInvitesQuery,
  useGetRepresentingAgenciesQuery,
  useInviteToRosterMutation,
  useAcceptRosterInviteMutation,
  useDeclineRosterInviteMutation,
  useRemoveFromRosterMutation,
} = rosterApi;
