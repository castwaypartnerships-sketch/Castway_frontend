import { api } from "@/lib/redux/api";
import type { FeedItem, PostCategory } from "@/lib/types/feed";

interface FeedResponse {
  items: FeedItem[];
  page: number;
  pageSize: number;
  total: number;
}

export const feedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<FeedResponse, { category?: PostCategory } | void>({
      query: (args) => ({
        url: "/feed",
        params: args?.category ? { category: args.category } : undefined,
      }),
      transformResponse: (response: { data: FeedResponse }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: "Feed" as const, id: item.id })),
              { type: "Feed" as const, id: "LIST" },
            ]
          : [{ type: "Feed" as const, id: "LIST" }],
    }),
    // No `invalidatesTags` here on purpose: a like toggle is reflected via
    // optimistic local UI state in `PostCard` (rolled back on failure)
    // rather than refetching the whole feed list for a one-field change.
    toggleLike: builder.mutation<{ liked: boolean }, string>({
      query: (postId) => ({ url: `/feed/${postId}/like`, method: "POST" }),
      transformResponse: (response: { data: { liked: boolean } }) => response.data,
    }),
    getSavedPosts: builder.query<{ items: FeedItem[] }, void>({
      query: () => "/feed/saved",
      transformResponse: (response: { data: { items: FeedItem[] } }) => response.data,
      providesTags: ["SavedFeed"],
    }),
  }),
});

export const { useGetFeedQuery, useToggleLikeMutation, useGetSavedPostsQuery } = feedApi;
