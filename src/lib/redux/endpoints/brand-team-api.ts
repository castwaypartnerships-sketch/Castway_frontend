import { api } from "@/lib/redux/api";

export interface BrandTeamMemberDto {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
}

export const brandTeamApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBrandTeam: builder.query<{ items: BrandTeamMemberDto[] }, void>({
      query: () => "/brand-team",
      transformResponse: (response: { data: { items: BrandTeamMemberDto[] } }) => response.data,
      providesTags: ["BrandTeam"],
    }),
    createBrandTeamMember: builder.mutation<
      { tempPassword: string; memberUserId: string },
      { email: string; username: string; name: string }
    >({
      query: (body) => ({ url: "/brand-team", method: "POST", body }),
      transformResponse: (response: { data: { tempPassword: string; memberUserId: string } }) => response.data,
      invalidatesTags: ["BrandTeam"],
    }),
    removeBrandTeamMember: builder.mutation<void, string>({
      query: (memberUserId) => ({ url: `/brand-team/${memberUserId}`, method: "DELETE" }),
      invalidatesTags: ["BrandTeam"],
    }),
  }),
});

export const { useGetBrandTeamQuery, useCreateBrandTeamMemberMutation, useRemoveBrandTeamMemberMutation } =
  brandTeamApi;
