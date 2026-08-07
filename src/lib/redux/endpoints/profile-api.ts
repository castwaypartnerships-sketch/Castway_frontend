import { api } from "@/lib/redux/api";
import type { ProfileCompletion } from "@/lib/types/feed";
import type {
  Availability,
  CaseStudyInput,
  EducationInput,
  EndorsementCounts,
  ExperienceInput,
  PortfolioItemInput,
  Profile,
  ProfileOpenOpportunity,
  ProfileUpdateInput,
  RateCardItemInput,
  ResponseRateSignal,
  ResponseTimeSignal,
  SocialLinks,
  UnavailableRangeInput,
} from "@/lib/types/profile";
import type { ReviewSummary } from "@/lib/redux/endpoints/reviews-api";

export interface ProfileMeResponse {
  profile: Profile | null;
  completion: ProfileCompletion;
  isVerified: boolean;
  trustScore: number;
  reviewSummary: ReviewSummary;
  responseTime: ResponseTimeSignal | null;
  responseRate: ResponseRateSignal | null;
  openOpportunities: ProfileOpenOpportunity[];
  availability: Availability;
  endorsementCounts: EndorsementCounts;
  role?: string;
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
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    addPortfolioItem: builder.mutation<{ profile: Profile }, PortfolioItemInput>({
      query: (body) => ({ url: "/profile/portfolio", method: "POST", body }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard", "PublicProfile"],
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
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    removePortfolioItem: builder.mutation<{ profile: Profile }, string>({
      query: (itemId) => ({ url: `/profile/portfolio/${itemId}`, method: "DELETE" }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    addRateCardItem: builder.mutation<{ profile: Profile }, RateCardItemInput>({
      query: (body) => ({ url: "/profile/rate-card", method: "POST", body }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    updateRateCardItem: builder.mutation<
      { profile: Profile },
      { itemId: string; patch: Partial<RateCardItemInput> }
    >({
      query: ({ itemId, patch }) => ({
        url: `/profile/rate-card/${itemId}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    removeRateCardItem: builder.mutation<{ profile: Profile }, string>({
      query: (itemId) => ({ url: `/profile/rate-card/${itemId}`, method: "DELETE" }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    setRateCardVisibility: builder.mutation<{ profile: Profile }, boolean>({
      query: (visible) => ({ url: "/profile/rate-card/visibility", method: "PATCH", body: { visible } }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    addCaseStudy: builder.mutation<{ profile: Profile }, CaseStudyInput>({
      query: (body) => ({ url: "/profile/case-studies", method: "POST", body }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    updateCaseStudy: builder.mutation<
      { profile: Profile },
      { itemId: string; patch: Partial<CaseStudyInput> }
    >({
      query: ({ itemId, patch }) => ({
        url: `/profile/case-studies/${itemId}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    removeCaseStudy: builder.mutation<{ profile: Profile }, string>({
      query: (itemId) => ({ url: `/profile/case-studies/${itemId}`, method: "DELETE" }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    updateSubSpecializations: builder.mutation<{ profile: Profile }, string[]>({
      query: (tags) => ({ url: "/profile/sub-specializations", method: "PATCH", body: { tags } }),
      transformResponse: (response: { data: Profile }) => ({ profile: response.data }),
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    addUnavailableRange: builder.mutation<{ profile: Profile }, UnavailableRangeInput>({
      query: (body) => ({ url: "/profile/me/unavailable-ranges", method: "POST", body }),
      transformResponse: (response: { data: { profile: Profile } }) => response.data,
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    removeUnavailableRange: builder.mutation<{ profile: Profile }, string>({
      query: (rangeId) => ({ url: `/profile/me/unavailable-ranges/${rangeId}`, method: "DELETE" }),
      transformResponse: (response: { data: { profile: Profile } }) => response.data,
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    updateSocialLinks: builder.mutation<Profile, SocialLinks>({
      query: (body) => ({ url: "/profile/me/social-links", method: "PATCH", body }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    addExperience: builder.mutation<Profile, ExperienceInput>({
      query: (body) => ({ url: "/profile/me/experience", method: "POST", body }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    updateExperience: builder.mutation<Profile, { entryId: string; patch: Partial<ExperienceInput> }>({
      query: ({ entryId, patch }) => ({
        url: `/profile/me/experience/${entryId}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    removeExperience: builder.mutation<Profile, string>({
      query: (entryId) => ({ url: `/profile/me/experience/${entryId}`, method: "DELETE" }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    addEducation: builder.mutation<Profile, EducationInput>({
      query: (body) => ({ url: "/profile/me/education", method: "POST", body }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    updateEducation: builder.mutation<Profile, { entryId: string; patch: Partial<EducationInput> }>({
      query: ({ entryId, patch }) => ({
        url: `/profile/me/education/${entryId}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    removeEducation: builder.mutation<Profile, string>({
      query: (entryId) => ({ url: `/profile/me/education/${entryId}`, method: "DELETE" }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["Dashboard", "PublicProfile"],
    }),
    getTrendingSkills: builder.query<{ items: { skill: string; count: number }[] }, void>({
      query: () => "/profile/trending-skills",
      transformResponse: (response: { data: { items: { skill: string; count: number }[] } }) =>
        response.data,
    }),
    getProfileByUserId: builder.query<ProfileMeResponse, string>({
      query: (userId) => `/profile/user/${userId}`,
      transformResponse: (response: { data: ProfileMeResponse }) => response.data,
      providesTags: (_result, _error, userId) => [{ type: "PublicProfile", id: userId }],
    }),
  }),
});

export const {
  useGetOwnProfileQuery,
  useUpdateProfileMutation,
  useAddPortfolioItemMutation,
  useUpdatePortfolioItemMutation,
  useRemovePortfolioItemMutation,
  useAddRateCardItemMutation,
  useUpdateRateCardItemMutation,
  useRemoveRateCardItemMutation,
  useSetRateCardVisibilityMutation,
  useAddCaseStudyMutation,
  useUpdateCaseStudyMutation,
  useRemoveCaseStudyMutation,
  useUpdateSubSpecializationsMutation,
  useAddUnavailableRangeMutation,
  useRemoveUnavailableRangeMutation,
  useUpdateSocialLinksMutation,
  useAddExperienceMutation,
  useUpdateExperienceMutation,
  useRemoveExperienceMutation,
  useAddEducationMutation,
  useUpdateEducationMutation,
  useRemoveEducationMutation,
  useGetTrendingSkillsQuery,
  useGetProfileByUserIdQuery,
} = profileApi;
