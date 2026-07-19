import { api } from "@/lib/redux/api";
import type { FeedItem, PostCategory } from "@/lib/types/feed";

interface FeedResponse {
  items: FeedItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface CreatePostInput {
  content: string;
  category?: PostCategory;
  title?: string;
  tags?: string[];
  budget?: string;
  applicationDeadline?: string;
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
    // The create response is the raw `Post` row, not the author/like/save-
    // enriched `FeedItem` the list view needs — so this doesn't try to use
    // the response body at all; it just invalidates the list to refetch it
    // through the DTO that adds that enrichment.
    createPost: builder.mutation<void, CreatePostInput>({
      query: (body) => ({ url: "/feed", method: "POST", body }),
      invalidatesTags: [{ type: "Feed", id: "LIST" }],
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

export const { useGetFeedQuery, useCreatePostMutation, useToggleLikeMutation, useGetSavedPostsQuery } = feedApi;
