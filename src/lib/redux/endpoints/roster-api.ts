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
    // Talent manager sub-accounts — creation/listing/removal live in
    // team-api.ts (TeamService); these endpoints only assign a manager to
    // specific roster entries.
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
    // Agency-facing counterpart to `getAssignedRoster` ("me") — lets the
    // agency owner see what a *specific* manager is actually assigned to,
    // instead of the Team page's "Manage Roster Access" panel guessing at
    // empty/unchecked state.
    getManagerAssignedRoster: builder.query<{ items: RosterEntryDto[] }, string>({
      query: (managerId) => `/roster/managers/${managerId}/assigned`,
      transformResponse: (response: { data: { items: RosterEntryDto[] } }) => response.data,
      providesTags: ["RosterManagers"],
    }),
    getTalentNotes: builder.query<{ items: TalentNoteDto[] }, string>({
      query: (targetUserId) => `/roster/talent/${targetUserId}/notes`,
      transformResponse: (response: { data: { items: TalentNoteDto[] } }) => response.data,
      providesTags: (_result, _error, targetUserId) => [{ type: "TalentNotes", id: targetUserId }],
    }),
    createTalentNote: builder.mutation<TalentNoteDto, { targetUserId: string; body: string }>({
      query: ({ targetUserId, body }) => ({
        url: `/roster/talent/${targetUserId}/notes`,
        method: "POST",
        body: { body },
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [{ type: "TalentNotes", id: targetUserId }],
    }),
    deleteTalentNote: builder.mutation<void, { targetUserId: string; noteId: string }>({
      query: ({ targetUserId, noteId }) => ({
        url: `/roster/talent/${targetUserId}/notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [{ type: "TalentNotes", id: targetUserId }],
    }),
    getTalentDocuments: builder.query<{ items: TalentDocumentDto[] }, string>({
      query: (targetUserId) => `/roster/talent/${targetUserId}/documents`,
      transformResponse: (response: { data: { items: TalentDocumentDto[] } }) => response.data,
      providesTags: (_result, _error, targetUserId) => [{ type: "TalentDocuments", id: targetUserId }],
    }),
    createTalentDocument: builder.mutation<
      TalentDocumentDto,
      { targetUserId: string; docType: string; fileName: string; fileUrl: string; publicId: string; resourceType: string }
    >({
      query: ({ targetUserId, ...body }) => ({
        url: `/roster/talent/${targetUserId}/documents`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [{ type: "TalentDocuments", id: targetUserId }],
    }),
    getTalentDocumentDownloadUrl: builder.mutation<{ url: string }, { targetUserId: string; docId: string }>({
      query: ({ targetUserId, docId }) => ({
        url: `/roster/talent/${targetUserId}/documents/${docId}/download`,
        method: "GET",
      }),
      transformResponse: (response: { data: { url: string } }) => response.data,
    }),
    deleteTalentDocument: builder.mutation<void, { targetUserId: string; docId: string }>({
      query: ({ targetUserId, docId }) => ({
        url: `/roster/talent/${targetUserId}/documents/${docId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [{ type: "TalentDocuments", id: targetUserId }],
    }),
    getTalentContracts: builder.query<{ items: TalentContractDto[] }, string>({
      query: (targetUserId) => `/roster/talent/${targetUserId}/contracts`,
      transformResponse: (response: { data: { items: TalentContractDto[] } }) => response.data,
      providesTags: (_result, _error, targetUserId) => [{ type: "TalentContracts", id: targetUserId }],
    }),
    createTalentContract: builder.mutation<
      TalentContractDto,
      {
        targetUserId: string;
        fileName: string;
        fileUrl: string;
        publicId: string;
        resourceType: string;
        startDate: string;
        endDate: string;
        commissionPercent: number;
        status: string;
      }
    >({
      query: ({ targetUserId, ...body }) => ({
        url: `/roster/talent/${targetUserId}/contracts`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [{ type: "TalentContracts", id: targetUserId }],
    }),
    getTalentContractDownloadUrl: builder.mutation<{ url: string }, { targetUserId: string; contractId: string }>({
      query: ({ targetUserId, contractId }) => ({
        url: `/roster/talent/${targetUserId}/contracts/${contractId}/download`,
        method: "GET",
      }),
      transformResponse: (response: { data: { url: string } }) => response.data,
    }),
    updateTalentContractStatus: builder.mutation<
      TalentContractDto,
      { targetUserId: string; contractId: string; status: string }
    >({
      query: ({ targetUserId, contractId, status }) => ({
        url: `/roster/talent/${targetUserId}/contracts/${contractId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [{ type: "TalentContracts", id: targetUserId }],
    }),
    renewTalentContract: builder.mutation<
      TalentContractDto,
      { targetUserId: string; contractId: string; newEndDate: string }
    >({
      query: ({ targetUserId, contractId, newEndDate }) => ({
        url: `/roster/talent/${targetUserId}/contracts/${contractId}/renew`,
        method: "POST",
        body: { newEndDate },
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [{ type: "TalentContracts", id: targetUserId }],
    }),
    getTalentPayments: builder.query<{ items: TalentPaymentDto[] }, string>({
      query: (targetUserId) => `/roster/talent/${targetUserId}/payments`,
      transformResponse: (response: { data: { items: TalentPaymentDto[] } }) => response.data,
      providesTags: (_result, _error, targetUserId) => [{ type: "TalentPayments", id: targetUserId }],
    }),
    createTalentPayment: builder.mutation<
      TalentPaymentDto,
      {
        targetUserId: string;
        amount: number;
        paymentDate: string;
        status: string;
        paymentReference?: string;
        dealId?: string;
        fileName?: string;
        fileUrl?: string;
        publicId?: string;
        resourceType?: string;
      }
    >({
      query: ({ targetUserId, ...body }) => ({
        url: `/roster/talent/${targetUserId}/payments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [{ type: "TalentPayments", id: targetUserId }],
    }),
    getTalentPaymentDownloadUrl: builder.mutation<{ url: string }, { targetUserId: string; paymentId: string }>({
      query: ({ targetUserId, paymentId }) => ({
        url: `/roster/talent/${targetUserId}/payments/${paymentId}/download`,
        method: "GET",
      }),
      transformResponse: (response: { data: { url: string } }) => response.data,
    }),
    updateTalentPaymentStatus: builder.mutation<
      TalentPaymentDto,
      { targetUserId: string; paymentId: string; status: string }
    >({
      query: ({ targetUserId, paymentId, status }) => ({
        url: `/roster/talent/${targetUserId}/payments/${paymentId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [{ type: "TalentPayments", id: targetUserId }],
    }),
    getTalentTimeline: builder.query<{ items: TimelineEventDto[] }, string>({
      query: (targetUserId) => `/roster/talent/${targetUserId}/timeline`,
      transformResponse: (response: { data: { items: TimelineEventDto[] } }) => response.data,
      providesTags: (_result, _error, targetUserId) => [
        { type: "TalentContracts", id: targetUserId },
        { type: "TalentPayments", id: targetUserId },
        { type: "TalentNotes", id: targetUserId },
      ],
    }),
  }),
});

export interface TalentNoteDto {
  id: string;
  body: string;
  createdAt: string;
  authorUserId: string;
  authorName: string;
}

export interface TalentDocumentDto {
  id: string;
  docType: "PAN" | "GST" | "BANK_DETAILS" | "OTHER";
  fileName: string;
  createdAt: string;
  uploadedByUserId: string;
  uploadedByName: string;
}

export interface TalentContractDto {
  id: string;
  fileName: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "RENEWED" | "EXPIRED" | "TERMINATED" | "ARCHIVED";
  commissionPercent: number;
  createdAt: string;
  uploadedByUserId: string;
  uploadedByName: string;
}

export interface TalentPaymentDto {
  id: string;
  amount: number;
  paymentDate: string;
  status: "PENDING" | "PAID" | "VOIDED";
  paymentReference: string | null;
  dealId: string | null;
  dealTitle: string | null;
  fileName: string | null;
  createdAt: string;
  uploadedByUserId: string;
  uploadedByName: string;
}

export interface TimelineEventDto {
  id: string;
  type: "INVITED" | "ACCEPTED" | "PROFILE_COMPLETED" | "MANAGER_ASSIGNED" | "CAMPAIGN" | "CONTRACT_RENEWED" | "PAYMENT" | "REVIEW" | "LONG_TERM";
  title: string;
  description: string;
  date: string;
}

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
  useAssignManagerToRosterEntryMutation,
  useUnassignManagerFromRosterEntryMutation,
  useGetAssignedRosterQuery,
  useGetManagerAssignedRosterQuery,
  useGetTalentNotesQuery,
  useCreateTalentNoteMutation,
  useDeleteTalentNoteMutation,
  useGetTalentDocumentsQuery,
  useCreateTalentDocumentMutation,
  useGetTalentDocumentDownloadUrlMutation,
  useDeleteTalentDocumentMutation,
  useGetTalentContractsQuery,
  useCreateTalentContractMutation,
  useGetTalentContractDownloadUrlMutation,
  useUpdateTalentContractStatusMutation,
  useRenewTalentContractMutation,
  useGetTalentPaymentsQuery,
  useCreateTalentPaymentMutation,
  useGetTalentPaymentDownloadUrlMutation,
  useUpdateTalentPaymentStatusMutation,
  useGetTalentTimelineQuery,
} = rosterApi;
