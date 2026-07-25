import { api } from "@/lib/redux/api";
import type {
  Campaign,
  CampaignAnalytics,
  CampaignShortlistItem,
  CampaignShortlistSummary,
  CampaignWriteInput,
  ShortlistComment,
} from "@/lib/types/campaign";

export const campaignsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query<{ items: Campaign[] }, void>({
      query: () => "/campaigns",
      transformResponse: (response: { data: { items: Campaign[] } }) => response.data,
      providesTags: ["Campaigns"],
    }),
    getMyShortlists: builder.query<{ items: CampaignShortlistSummary[] }, void>({
      query: () => "/campaigns/shortlisted/me",
      transformResponse: (response: { data: { items: CampaignShortlistSummary[] } }) => response.data,
      providesTags: ["CampaignShortlist"],
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
    // Shortlist Team Collaboration — internal review thread on one
    // shortlisted creator, shared by the Brand owner and every teammate.
    getShortlistComments: builder.query<{ items: ShortlistComment[] }, { campaignId: string; creatorUserId: string }>(
      {
        query: ({ campaignId, creatorUserId }) => `/campaigns/${campaignId}/shortlist/${creatorUserId}/comments`,
        transformResponse: (response: { data: { items: ShortlistComment[] } }) => response.data,
        providesTags: (_r, _e, { campaignId, creatorUserId }) => [
          { type: "ShortlistComments", id: `${campaignId}:${creatorUserId}` },
        ],
      },
    ),
    addShortlistComment: builder.mutation<
      ShortlistComment,
      { campaignId: string; creatorUserId: string; content: string }
    >({
      query: ({ campaignId, creatorUserId, content }) => ({
        url: `/campaigns/${campaignId}/shortlist/${creatorUserId}/comments`,
        method: "POST",
        body: { content },
      }),
      transformResponse: (response: { data: ShortlistComment }) => response.data,
      invalidatesTags: (_r, _e, { campaignId, creatorUserId }) => [
        { type: "ShortlistComments", id: `${campaignId}:${creatorUserId}` },
      ],
    }),
    getCampaignAnalytics: builder.query<CampaignAnalytics, string>({
      query: (id) => `/campaigns/${id}/analytics`,
      transformResponse: (response: { data: CampaignAnalytics }) => response.data,
      providesTags: (_r, _e, id) => [{ type: "CampaignShortlist", id }],
    }),
    // Co-Management for Brand Clients — an Agency's view of one linked
    // brand's campaigns, and creating a campaign attributed to that brand.
    getClientCampaigns: builder.query<{ items: Campaign[] }, string>({
      query: (brandUserId) => `/campaigns/clients/${brandUserId}`,
      transformResponse: (response: { data: { items: Campaign[] } }) => response.data,
      providesTags: ["Campaigns"],
    }),
    createCampaignOnBehalf: builder.mutation<Campaign, { brandUserId: string; input: CampaignWriteInput }>({
      query: ({ brandUserId, input }) => ({
        url: `/campaigns/on-behalf/${brandUserId}`,
        method: "POST",
        body: input,
      }),
      transformResponse: (response: { data: Campaign }) => response.data,
      invalidatesTags: ["Campaigns"],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetMyShortlistsQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useRemoveCampaignMutation,
  useGetCampaignShortlistQuery,
  useAddToShortlistMutation,
  useRemoveFromShortlistMutation,
  useGetShortlistCommentsQuery,
  useAddShortlistCommentMutation,
  useGetCampaignAnalyticsQuery,
  useGetClientCampaignsQuery,
  useCreateCampaignOnBehalfMutation,
} = campaignsApi;
