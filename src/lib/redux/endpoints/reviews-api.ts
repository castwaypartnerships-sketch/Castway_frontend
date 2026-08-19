import { api } from "@/lib/redux/api";
import { forceRefetchOnPageChange, mergeNewestFirstPage } from "@/lib/redux/pagination";

export interface ReviewSummary {
  averageRating: number | null;
  reviewCount: number;
}

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  replyComment: string | null;
  repliedAt: string | null;
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
    // Infinite-scroll-style pagination (same recipe as `getFeed`): cache key
    // ignores `page`, `merge` prepends unseen items from a page-1 refetch
    // (e.g. after `submitReview` invalidates the tag) since reviews are
    // newest-first.
    getReviewsForUser: builder.query<ReviewsForUserResponse, { userId: string; page?: number }>({
      query: ({ userId, page }) => ({ url: `/reviews/user/${userId}`, params: { page: page ?? 1 } }),
      transformResponse: (response: { data: ReviewsForUserResponse }) => response.data,
      serializeQueryArgs: ({ queryArgs }) => ({ userId: queryArgs.userId }),
      // `mergeNewestFirstPage` only reconciles items/page/pageSize/total —
      // `summary` (average rating, count) needs its own assignment so a
      // fresh page-1 refetch (e.g. after `submitReview` invalidates the
      // tag) actually updates the displayed average instead of going stale.
      merge: (cache, newPage) => {
        mergeNewestFirstPage(cache, newPage);
        cache.summary = newPage.summary;
      },
      forceRefetch: forceRefetchOnPageChange,
      providesTags: (_result, _error, { userId }) => [{ type: "Reviews", id: userId }],
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
