import { api } from "@/lib/redux/api";
import type { ProfileCompletion } from "@/lib/types/feed";
import type {
  Availability,
  EducationInput,
  EndorsementCounts,
  ExperienceInput,
  PortfolioItemInput,
  Profile,
  ProfileUpdateInput,
  SocialLinks,
  UnavailableRangeInput,
} from "@/lib/types/profile";
import type { ReviewSummary } from "@/lib/redux/endpoints/reviews-api";

interface ProfileMeResponse {
  profile: Profile | null;
  completion: ProfileCompletion;
  isVerified: boolean;
  trustScore: number;
  reviewSummary: ReviewSummary;
  availability: Availability;
  endorsementCounts: EndorsementCounts;
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
    addUnavailableRange: builder.mutation<{ profile: Profile }, UnavailableRangeInput>({
      query: (body) => ({ url: "/profile/me/unavailable-ranges", method: "POST", body }),
      transformResponse: (response: { data: { profile: Profile } }) => response.data,
      invalidatesTags: ["Dashboard"],
    }),
    removeUnavailableRange: builder.mutation<{ profile: Profile }, string>({
      query: (rangeId) => ({ url: `/profile/me/unavailable-ranges/${rangeId}`, method: "DELETE" }),
      transformResponse: (response: { data: { profile: Profile } }) => response.data,
      invalidatesTags: ["Dashboard"],
    }),
    updateSocialLinks: builder.mutation<Profile, SocialLinks>({
      query: (body) => ({ url: "/profile/me/social-links", method: "PATCH", body }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard"],
    }),
    addExperience: builder.mutation<Profile, ExperienceInput>({
      query: (body) => ({ url: "/profile/me/experience", method: "POST", body }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard"],
    }),
    updateExperience: builder.mutation<Profile, { entryId: string; patch: Partial<ExperienceInput> }>({
      query: ({ entryId, patch }) => ({
        url: `/profile/me/experience/${entryId}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard"],
    }),
    removeExperience: builder.mutation<Profile, string>({
      query: (entryId) => ({ url: `/profile/me/experience/${entryId}`, method: "DELETE" }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard"],
    }),
    addEducation: builder.mutation<Profile, EducationInput>({
      query: (body) => ({ url: "/profile/me/education", method: "POST", body }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard"],
    }),
    updateEducation: builder.mutation<Profile, { entryId: string; patch: Partial<EducationInput> }>({
      query: ({ entryId, patch }) => ({
        url: `/profile/me/education/${entryId}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard"],
    }),
    removeEducation: builder.mutation<Profile, string>({
      query: (entryId) => ({ url: `/profile/me/education/${entryId}`, method: "DELETE" }),
      transformResponse: (response: { data: Profile }) => response.data,
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
  useAddUnavailableRangeMutation,
  useRemoveUnavailableRangeMutation,
  useUpdateSocialLinksMutation,
  useAddExperienceMutation,
  useUpdateExperienceMutation,
  useRemoveExperienceMutation,
  useAddEducationMutation,
  useUpdateEducationMutation,
  useRemoveEducationMutation,
} = profileApi;
