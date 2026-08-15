import { api } from "@/lib/redux/api";

export interface ReviewSummary {
  averageRating: number | null;
  reviewCount: number;
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { userId: string; username: string; name: string; avatarUrl: string | null };
}

interface ReviewsForUserResponse {
  summary: ReviewSummary;
  items: ReviewItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface SubmitReviewInput {
  revieweeUserId: string;
  rating: number;
  comment?: string;
}

export const reviewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReviewsForUser: builder.query<ReviewsForUserResponse, string>({
      query: (userId) => `/reviews/user/${userId}`,
      transformResponse: (response: { data: ReviewsForUserResponse }) => response.data,
      providesTags: (_result, _error, userId) => [{ type: "Reviews", id: userId }],
    }),
    submitReview: builder.mutation<void, SubmitReviewInput>({
      query: (body) => ({ url: "/reviews", method: "POST", body }),
      invalidatesTags: (_result, _error, arg) => [{ type: "Reviews", id: arg.revieweeUserId }],
    }),
    replyToReview: builder.mutation<void, { reviewId: string; revieweeUserId: string; replyComment: string }>({
      query: ({ reviewId, replyComment }) => ({
        url: `/reviews/${reviewId}/reply`,
        method: "PATCH",
        body: { replyComment },
      }),
      invalidatesTags: (_result, _error, { revieweeUserId }) => [{ type: "Reviews", id: revieweeUserId }],
    }),
  }),
});

export const {
  useGetReviewsForUserQuery,
  useSubmitReviewMutation,
  useReplyToReviewMutation,
} = reviewsApi;
