import { api } from "@/lib/redux/api";
import type {
  Availability,
  EndorsementCounts,
  ProfileOpenOpportunity,
  ProfileSearchFilters,
  Profile,
  ResponseTimeSignal,
  ResponseRateSignal,
} from "@/lib/types/profile";
import type { ReviewSummary } from "@/lib/redux/endpoints/reviews-api";

export interface SearchProfileItem extends Profile {
  followerCount: number;
  verified: boolean;
  accountRole: string;
  isFollowing: boolean;
}

interface SearchProfilesResponse {
  items: SearchProfileItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PublicProfileResponse {
  profile: Profile;
  isVerified: boolean;
  trustScore: number;
  reviewSummary: ReviewSummary;
  responseTime: ResponseTimeSignal | null;
  responseRate: ResponseRateSignal | null;
  openOpportunities: ProfileOpenOpportunity[];
  availability: Availability;
  endorsementCounts: EndorsementCounts;
  postStats: { postsCount: number; totalLikes: number; totalComments: number };
  followerCount: number;
  followingCount: number;
  completedCollaborationsCount: number;
  viewerIsFollowing: boolean;
  role: string;
  /** Set only when this profile is a managed-talent sub-account (see
   * `ManagedTalentService`) — distinct from Roster's "Represented by". */
  managedByAgency: { userId: string; username: string; name: string; avatarUrl: string | null } | null;
}

export type MediaKitResponse = PublicProfileResponse;

export const searchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchProfiles: builder.query<SearchProfilesResponse, ProfileSearchFilters & { page?: number }>({
      query: (filters) => ({
        url: "/profile/search",
        params: {
          ...filters,
          skills: filters.skills?.length ? filters.skills.join(",") : undefined,
          subSpecializations: filters.subSpecializations?.length
            ? filters.subSpecializations.join(",")
            : undefined,
        },
      }),
      transformResponse: (response: { data: SearchProfilesResponse }) => response.data,
    }),
    getPublicProfile: builder.query<PublicProfileResponse, string>({
      query: (username) => `/profile/public/${username}`,
      transformResponse: (response: { data: PublicProfileResponse }) => response.data,
      providesTags: (_result, _error, username) => [{ type: "Endorsements", id: username }],
    }),
    getMediaKit: builder.query<MediaKitResponse, string>({
      query: (username) => `/profile/${username}/media-kit`,
      transformResponse: (response: { data: MediaKitResponse }) => response.data,
    }),
  }),
});

export const {
  useSearchProfilesQuery,
  useGetPublicProfileQuery,
  useLazyGetPublicProfileQuery,
  useGetMediaKitQuery,
} = searchApi;
