import { api } from "@/lib/redux/api";
import type { ProfileCompletion } from "@/lib/types/feed";
import type { PortfolioItemInput, Profile, ProfileUpdateInput } from "@/lib/types/profile";

interface ProfileMeResponse {
  profile: Profile | null;
  completion: ProfileCompletion;
}

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOwnProfile: builder.query<ProfileMeResponse, void>({
      query: () => "/profile/me",
      transformResponse: (response: { data: ProfileMeResponse }) => response.data,
      providesTags: ["Dashboard"],
    }),
    updateProfile: builder.mutation<ProfileMeResponse, ProfileUpdateInput>({
      query: (body) => ({ url: "/profile/me", method: "PATCH", body }),
      transformResponse: (response: { data: ProfileMeResponse }) => response.data,
      invalidatesTags: ["Dashboard"],
    }),
    addPortfolioItem: builder.mutation<{ profile: Profile }, PortfolioItemInput>({
      query: (body) => ({ url: "/profile/portfolio", method: "POST", body }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard"],
    }),
    updatePortfolioItem: builder.mutation<
      { profile: Profile },
      { itemId: string; patch: Partial<PortfolioItemInput> }
    >({
      query: ({ itemId, patch }) => ({
        url: `/profile/portfolio/${itemId}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard"],
    }),
    removePortfolioItem: builder.mutation<{ profile: Profile }, string>({
      query: (itemId) => ({ url: `/profile/portfolio/${itemId}`, method: "DELETE" }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetOwnProfileQuery,
  useUpdateProfileMutation,
  useAddPortfolioItemMutation,
  useUpdatePortfolioItemMutation,
  useRemovePortfolioItemMutation,
} = profileApi;
