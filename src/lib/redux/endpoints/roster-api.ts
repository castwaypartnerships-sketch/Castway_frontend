import { api } from "@/lib/redux/api";
import type { RosterEntryDto, TalentStatus } from "@/lib/types/roster";

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
    updateTalentStatus: builder.mutation<void, { id: string; talentStatus: TalentStatus }>({
      query: ({ id, talentStatus }) => ({ url: `/roster/${id}/status`, method: "PATCH", body: { talentStatus } }),
      invalidatesTags: ["Roster"],
    }),
    setPubliclyListed: builder.mutation<void, { id: string; publiclyListed: boolean }>({
      query: ({ id, publiclyListed }) => ({
        url: `/roster/${id}/public-listing`,
        method: "PATCH",
        body: { publiclyListed },
      }),
      invalidatesTags: ["Roster"],
    }),
    // No auth required — Roster-as-a-Catalog is a public showcase page.
    getPublicRosterCatalog: builder.query<{ items: RosterEntryDto[] }, string>({
      query: (agencyUsername) => `/roster/public/${agencyUsername}`,
      transformResponse: (response: { data: { items: RosterEntryDto[] } }) => response.data,
    }),
    // Talent manager sub-accounts — Agency-only management + the manager's
    // own scoped view.
    getManagers: builder.query<{ items: ManagerDto[] }, void>({
      query: () => "/roster/managers",
      transformResponse: (response: { data: { items: ManagerDto[] } }) => response.data,
      providesTags: ["RosterManagers"],
    }),
    createManager: builder.mutation<
      { tempPassword: string; managerUserId: string },
      { email: string; username: string; name: string }
    >({
      query: (body) => ({ url: "/roster/managers", method: "POST", body }),
      transformResponse: (response: { data: { tempPassword: string; managerUserId: string } }) => response.data,
      invalidatesTags: ["RosterManagers"],
    }),
    assignManagerToRosterEntry: builder.mutation<void, { managerId: string; entryId: string }>({
      query: ({ managerId, entryId }) => ({
        url: `/roster/managers/${managerId}/assignments/${entryId}`,
        method: "POST",
      }),
      invalidatesTags: ["RosterManagers"],
    }),
    unassignManagerFromRosterEntry: builder.mutation<void, { managerId: string; entryId: string }>({
      query: ({ managerId, entryId }) => ({
        url: `/roster/managers/${managerId}/assignments/${entryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RosterManagers"],
    }),
    getAssignedRoster: builder.query<{ items: RosterEntryDto[] }, void>({
      query: () => "/roster/managers/me/assigned",
      transformResponse: (response: { data: { items: RosterEntryDto[] } }) => response.data,
      providesTags: ["Roster"],
    }),
  }),
});

export interface ManagerDto {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
}

export const {
  useGetMyRosterQuery,
  useGetPendingRosterInvitesQuery,
  useGetRepresentingAgenciesQuery,
  useInviteToRosterMutation,
  useAcceptRosterInviteMutation,
  useDeclineRosterInviteMutation,
  useRemoveFromRosterMutation,
  useUpdateTalentStatusMutation,
  useSetPubliclyListedMutation,
  useGetPublicRosterCatalogQuery,
  useGetManagersQuery,
  useCreateManagerMutation,
  useAssignManagerToRosterEntryMutation,
  useUnassignManagerFromRosterEntryMutation,
  useGetAssignedRosterQuery,
} = rosterApi;
