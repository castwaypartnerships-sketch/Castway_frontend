import { api } from "@/lib/redux/api";
import type { RosterDealDto, RosterDealStage } from "@/lib/types/roster-deal";

export const rosterDealsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRosterDeals: builder.query<{ items: RosterDealDto[] }, void>({
      query: () => "/roster-deals",
      transformResponse: (response: { data: { items: RosterDealDto[] } }) => response.data,
      providesTags: ["RosterDeals"],
    }),
    createRosterDeal: builder.mutation<RosterDealDto, { memberUserId: string; title: string; brandUserId?: string }>({
      query: (body) => ({ url: "/roster-deals", method: "POST", body }),
      transformResponse: (response: { data: RosterDealDto }) => response.data,
      invalidatesTags: ["RosterDeals"],
    }),
    updateRosterDealStage: builder.mutation<RosterDealDto, { id: string; stage: RosterDealStage }>({
      query: ({ id, stage }) => ({ url: `/roster-deals/${id}/stage`, method: "PATCH", body: { stage } }),
      transformResponse: (response: { data: RosterDealDto }) => response.data,
      invalidatesTags: ["RosterDeals"],
    }),
    addRosterDealNote: builder.mutation<RosterDealDto, { id: string; text: string }>({
      query: ({ id, text }) => ({ url: `/roster-deals/${id}/notes`, method: "POST", body: { text } }),
      transformResponse: (response: { data: RosterDealDto }) => response.data,
      invalidatesTags: ["RosterDeals"],
    }),
    removeRosterDeal: builder.mutation<void, string>({
      query: (id) => ({ url: `/roster-deals/${id}`, method: "DELETE" }),
      invalidatesTags: ["RosterDeals"],
    }),
  }),
});

export const {
  useGetRosterDealsQuery,
  useCreateRosterDealMutation,
  useUpdateRosterDealStageMutation,
  useAddRosterDealNoteMutation,
  useRemoveRosterDealMutation,
} = rosterDealsApi;
