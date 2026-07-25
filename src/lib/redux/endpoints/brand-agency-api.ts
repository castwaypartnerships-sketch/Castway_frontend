import { api } from "@/lib/redux/api";
import type { BrandAgencyLinkDto } from "@/lib/types/brand-agency";

export const brandAgencyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyAgencyLinks: builder.query<{ items: BrandAgencyLinkDto[] }, void>({
      query: () => "/brand-agency",
      transformResponse: (response: { data: { items: BrandAgencyLinkDto[] } }) => response.data,
      providesTags: ["BrandAgencyLinks"],
    }),
    getPendingAgencyInvites: builder.query<{ items: BrandAgencyLinkDto[] }, void>({
      query: () => "/brand-agency/pending",
      transformResponse: (response: { data: { items: BrandAgencyLinkDto[] } }) => response.data,
      providesTags: ["BrandAgencyLinks"],
    }),
    getClientBrands: builder.query<{ items: BrandAgencyLinkDto[] }, void>({
      query: () => "/brand-agency/clients",
      transformResponse: (response: { data: { items: BrandAgencyLinkDto[] } }) => response.data,
      providesTags: ["BrandAgencyLinks"],
    }),
    inviteAgency: builder.mutation<void, string>({
      query: (username) => ({ url: "/brand-agency/invite", method: "POST", body: { username } }),
      invalidatesTags: ["BrandAgencyLinks"],
    }),
    acceptAgencyInvite: builder.mutation<void, string>({
      query: (id) => ({ url: `/brand-agency/${id}/accept`, method: "POST" }),
      invalidatesTags: ["BrandAgencyLinks"],
    }),
    declineAgencyInvite: builder.mutation<void, string>({
      query: (id) => ({ url: `/brand-agency/${id}/decline`, method: "POST" }),
      invalidatesTags: ["BrandAgencyLinks"],
    }),
    removeAgencyLink: builder.mutation<void, string>({
      query: (id) => ({ url: `/brand-agency/${id}`, method: "DELETE" }),
      invalidatesTags: ["BrandAgencyLinks"],
    }),
  }),
});

export const {
  useGetMyAgencyLinksQuery,
  useGetPendingAgencyInvitesQuery,
  useGetClientBrandsQuery,
  useInviteAgencyMutation,
  useAcceptAgencyInviteMutation,
  useDeclineAgencyInviteMutation,
  useRemoveAgencyLinkMutation,
} = brandAgencyApi;
