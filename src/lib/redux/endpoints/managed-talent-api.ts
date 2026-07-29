import { api } from "@/lib/redux/api";
import type { Profile, ProfileUpdateInput } from "@/lib/types/profile";

export const managedTalentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getManagedTalent: builder.query<{ items: Profile[] }, void>({
      query: () => "/managed-talent",
      transformResponse: (response: { data: { items: Profile[] } }) => response.data,
      providesTags: ["ManagedTalent"],
    }),
    createManagedTalent: builder.mutation<
      { tempPassword: string; talentUserId: string },
      { email: string; username: string; name: string; role: "CREATOR" | "FREELANCER" }
    >({
      query: (body) => ({ url: "/managed-talent", method: "POST", body }),
      transformResponse: (response: { data: { tempPassword: string; talentUserId: string } }) => response.data,
      invalidatesTags: ["ManagedTalent"],
    }),
    updateManagedTalentProfile: builder.mutation<
      Profile,
      { talentUserId: string; input: ProfileUpdateInput }
    >({
      query: ({ talentUserId, input }) => ({
        url: `/managed-talent/${talentUserId}/profile`,
        method: "PATCH",
        body: input,
      }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["ManagedTalent"],
    }),
    releaseManagedTalent: builder.mutation<void, string>({
      query: (talentUserId) => ({ url: `/managed-talent/${talentUserId}/release`, method: "POST" }),
      invalidatesTags: ["ManagedTalent"],
    }),
  }),
});

export const {
  useGetManagedTalentQuery,
  useCreateManagedTalentMutation,
  useUpdateManagedTalentProfileMutation,
  useReleaseManagedTalentMutation,
} = managedTalentApi;
