import { api } from "@/lib/redux/api";
import type { RevenueSplitDto, RevenueSplitParty } from "@/lib/types/revenue-split";

export const revenueSplitsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRevenueSplitsForDeal: builder.query<{ items: RevenueSplitDto[] }, string>({
      query: (rosterDealId) => `/revenue-splits/deal/${rosterDealId}`,
      transformResponse: (response: { data: { items: RevenueSplitDto[] } }) => response.data,
      providesTags: ["RevenueSplits"],
    }),
    proposeRevenueSplit: builder.mutation<RevenueSplitDto, { rosterDealId: string; parties: RevenueSplitParty[] }>({
      query: (body) => ({ url: "/revenue-splits", method: "POST", body }),
      transformResponse: (response: { data: RevenueSplitDto }) => response.data,
      invalidatesTags: ["RevenueSplits"],
    }),
    approveRevenueSplit: builder.mutation<RevenueSplitDto, string>({
      query: (id) => ({ url: `/revenue-splits/${id}/approve`, method: "POST" }),
      transformResponse: (response: { data: RevenueSplitDto }) => response.data,
      invalidatesTags: ["RevenueSplits"],
    }),
  }),
});

export const {
  useGetRevenueSplitsForDealQuery,
  useProposeRevenueSplitMutation,
  useApproveRevenueSplitMutation,
} = revenueSplitsApi;
