import { api } from "@/lib/redux/api";
import type { Opportunity, OpportunityWriteInput } from "@/lib/types/opportunity";

interface OpportunitiesResponse {
  items: Opportunity[];
  page: number;
  pageSize: number;
  total: number;
}

export const opportunitiesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOpportunities: builder.query<OpportunitiesResponse, { type?: string } | void>({
      query: (args) => ({ url: "/opportunities", params: args?.type ? { type: args.type } : undefined }),
      transformResponse: (response: { data: OpportunitiesResponse }) => response.data,
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
  useGetSavedOpportunitiesQuery,
  useCreateOpportunityMutation,
  useCreateBulkOpportunitiesMutation,
  useApplyToOpportunityMutation,
  useToggleSaveOpportunityMutation,
} = opportunitiesApi;
