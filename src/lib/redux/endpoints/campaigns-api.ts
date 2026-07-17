import { api } from "@/lib/redux/api";
import type {
  Campaign,
  CampaignAnalytics,
  CampaignShortlistItem,
  CampaignWriteInput,
} from "@/lib/types/campaign";

export const campaignsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query<{ items: Campaign[] }, void>({
      query: () => "/campaigns",
      transformResponse: (response: { data: { items: Campaign[] } }) => response.data,
      providesTags: ["Campaigns"],
    }),
    getCampaign: builder.query<Campaign, string>({
      query: (id) => `/campaigns/${id}`,
      transformResponse: (response: { data: Campaign }) => response.data,
      providesTags: (_r, _e, id) => [{ type: "Campaigns", id }],
    }),
    createCampaign: builder.mutation<Campaign, CampaignWriteInput>({
      query: (body) => ({ url: "/campaigns", method: "POST", body }),
      transformResponse: (response: { data: Campaign }) => response.data,
      invalidatesTags: ["Campaigns"],
    }),
    updateCampaign: builder.mutation<Campaign, { id: string; patch: Partial<CampaignWriteInput> }>({
      query: ({ id, patch }) => ({ url: `/campaigns/${id}`, method: "PATCH", body: patch }),
      transformResponse: (response: { data: Campaign }) => response.data,
      invalidatesTags: (_r, _e, { id }) => [{ type: "Campaigns", id }, "Campaigns"],
    }),
    removeCampaign: builder.mutation<void, string>({
      query: (id) => ({ url: `/campaigns/${id}`, method: "DELETE" }),
      invalidatesTags: ["Campaigns"],
    }),
    getCampaignShortlist: builder.query<{ items: CampaignShortlistItem[] }, string>({
      query: (id) => `/campaigns/${id}/shortlist`,
      transformResponse: (response: { data: { items: CampaignShortlistItem[] } }) => response.data,
      providesTags: (_r, _e, id) => [{ type: "CampaignShortlist", id }],
    }),
    addToShortlist: builder.mutation<void, { campaignId: string; creatorUserId: string }>({
      query: ({ campaignId, creatorUserId }) => ({
        url: `/campaigns/${campaignId}/shortlist`,
        method: "POST",
        body: { creatorUserId },
      }),
      invalidatesTags: (_r, _e, { campaignId }) => [{ type: "CampaignShortlist", id: campaignId }],
    }),
    removeFromShortlist: builder.mutation<void, { campaignId: string; creatorUserId: string }>({
      query: ({ campaignId, creatorUserId }) => ({
        url: `/campaigns/${campaignId}/shortlist/${creatorUserId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { campaignId }) => [{ type: "CampaignShortlist", id: campaignId }],
    }),
    getCampaignAnalytics: builder.query<CampaignAnalytics, string>({
      query: (id) => `/campaigns/${id}/analytics`,
      transformResponse: (response: { data: CampaignAnalytics }) => response.data,
      providesTags: (_r, _e, id) => [{ type: "CampaignShortlist", id }],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useRemoveCampaignMutation,
  useGetCampaignShortlistQuery,
  useAddToShortlistMutation,
  useRemoveFromShortlistMutation,
  useGetCampaignAnalyticsQuery,
} = campaignsApi;
