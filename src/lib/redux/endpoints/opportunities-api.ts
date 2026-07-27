import { api } from "@/lib/redux/api";
import type { Opportunity, OpportunityWriteInput } from "@/lib/types/opportunity";

interface OpportunitiesResponse {
  items: Opportunity[];
  page: number;
  pageSize: number;
  total: number;
}

type LifecycleAction = "publish" | "pause" | "resume" | "close" | "reopen" | "archive";

export interface OpportunityFilters {
  type?: string;
  query?: string;
  category?: string;
  skills?: string[];
  isRemote?: boolean;
  page?: number;
}

export const opportunitiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Infinite-scroll pagination: same merge-by-page recipe as `getFeed` in
    // feed-api.ts — cache key ignores `page`, `merge` de-dupes and appends.
    getOpportunities: builder.query<OpportunitiesResponse, OpportunityFilters | void>({
      query: (args) => ({
        url: "/opportunities",
        params: {
          type: args?.type,
          query: args?.query,
          category: args?.category,
          skills: args?.skills?.length ? args.skills.join(",") : undefined,
          isRemote: args?.isRemote,
          page: args?.page ?? 1,
        },
      }),
      transformResponse: (response: { data: OpportunitiesResponse }) => response.data,
      serializeQueryArgs: ({ queryArgs }) => ({
        type: queryArgs?.type,
        query: queryArgs?.query,
        category: queryArgs?.category,
        skills: queryArgs?.skills,
        isRemote: queryArgs?.isRemote,
      }),
      merge: (currentCache, newPage) => {
        const seenIds = new Set(currentCache.items.map((item) => item.id));
        currentCache.items.push(...newPage.items.filter((item) => !seenIds.has(item.id)));
        currentCache.page = newPage.page;
        currentCache.pageSize = newPage.pageSize;
        currentCache.total = newPage.total;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: "Opportunities" as const, id: item.id })),
              { type: "Opportunities" as const, id: "LIST" },
            ]
          : [{ type: "Opportunities" as const, id: "LIST" }],
    }),
    getOpportunity: builder.query<Opportunity, string>({
      query: (opportunityId) => `/opportunities/${opportunityId}`,
      transformResponse: (response: { data: Opportunity }) => response.data,
      providesTags: (_result, _error, opportunityId) => [{ type: "Opportunities", id: opportunityId }],
    }),
    getMyOpportunities: builder.query<{ items: Opportunity[] }, void>({
      query: () => "/opportunities/mine",
      transformResponse: (response: { data: { items: Opportunity[] } }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: "Opportunities" as const, id: item.id })),
              { type: "Opportunities" as const, id: "MINE" },
            ]
          : [{ type: "Opportunities" as const, id: "MINE" }],
    }),
    updateOpportunity: builder.mutation<Opportunity, { id: string; input: Partial<OpportunityWriteInput> }>({
      query: ({ id, input }) => ({ url: `/opportunities/${id}`, method: "PATCH", body: input }),
      transformResponse: (response: { data: Opportunity }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Opportunities", id },
        { type: "Opportunities", id: "MINE" },
      ],
    }),
    deleteOpportunity: builder.mutation<void, string>({
      query: (id) => ({ url: `/opportunities/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Opportunities", id },
        { type: "Opportunities", id: "MINE" },
        { type: "Opportunities", id: "LIST" },
      ],
    }),
    transitionOpportunity: builder.mutation<Opportunity, { id: string; action: LifecycleAction }>({
      query: ({ id, action }) => ({ url: `/opportunities/${id}/${action}`, method: "POST" }),
      transformResponse: (response: { data: Opportunity }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Opportunities", id },
        { type: "Opportunities", id: "MINE" },
        { type: "Opportunities", id: "LIST" },
      ],
    }),
    getSavedOpportunities: builder.query<{ items: Opportunity[] }, void>({
      query: () => "/opportunities/saved",
      transformResponse: (response: { data: { items: Opportunity[] } }) => response.data,
      providesTags: ["SavedOpportunities"],
    }),
    createOpportunity: builder.mutation<Opportunity, OpportunityWriteInput>({
      query: (body) => ({ url: "/opportunities", method: "POST", body }),
      transformResponse: (response: { data: Opportunity }) => response.data,
      invalidatesTags: [{ type: "Opportunities", id: "LIST" }],
    }),
    createBulkOpportunities: builder.mutation<
      { created: Opportunity[]; errors: { index: number; error: string }[] },
      OpportunityWriteInput[]
    >({
      query: (opportunities) => ({ url: "/opportunities/bulk", method: "POST", body: { opportunities } }),
      transformResponse: (response: {
        data: { created: Opportunity[]; errors: { index: number; error: string }[] };
      }) => response.data,
      invalidatesTags: [{ type: "Opportunities", id: "LIST" }],
    }),
    applyToOpportunity: builder.mutation<void, { opportunityId: string; message?: string }>({
      query: ({ opportunityId, message }) => ({
        url: `/opportunities/${opportunityId}/apply`,
        method: "POST",
        body: { message },
      }),
    }),
    applyOnBehalfOfRosterMember: builder.mutation<
      void,
      { opportunityId: string; memberUserId: string; message?: string }
    >({
      query: ({ opportunityId, memberUserId, message }) => ({
        url: `/opportunities/${opportunityId}/apply-on-behalf/${memberUserId}`,
        method: "POST",
        body: { message },
      }),
    }),
    notifyRoster: builder.mutation<
      { notified: string[]; applied: string[]; errors: { memberUserId: string; error: string }[] },
      { opportunityId: string; memberUserIds: string[]; autoApply: boolean }
    >({
      query: ({ opportunityId, memberUserIds, autoApply }) => ({
        url: `/opportunities/${opportunityId}/notify-roster`,
        method: "POST",
        body: { memberUserIds, autoApply },
      }),
      transformResponse: (response: {
        data: { notified: string[]; applied: string[]; errors: { memberUserId: string; error: string }[] };
      }) => response.data,
    }),
    toggleSaveOpportunity: builder.mutation<{ saved: boolean }, string>({
      query: (opportunityId) => ({ url: `/opportunities/${opportunityId}/save`, method: "POST" }),
      transformResponse: (response: { data: { saved: boolean } }) => response.data,
      invalidatesTags: ["SavedOpportunities"],
    }),
  }),
});

export const {
  useGetOpportunitiesQuery,
  useGetOpportunityQuery,
  useGetMyOpportunitiesQuery,
  useUpdateOpportunityMutation,
  useDeleteOpportunityMutation,
  useTransitionOpportunityMutation,
  useGetSavedOpportunitiesQuery,
  useCreateOpportunityMutation,
  useCreateBulkOpportunitiesMutation,
  useApplyToOpportunityMutation,
  useApplyOnBehalfOfRosterMemberMutation,
  useNotifyRosterMutation,
  useToggleSaveOpportunityMutation,
} = opportunitiesApi;
