import { api } from "@/lib/redux/api";
import type { FeedComment, FeedItem, PostCategory } from "@/lib/types/feed";
import { profileApi } from "@/lib/redux/endpoints/profile-api";

interface FeedResponse {
  items: FeedItem[];
  page: number;
  pageSize: number;
  total: number;
}

interface CommentsResponse {
  items: FeedComment[];
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
    toggleSavePost: builder.mutation<{ saved: boolean }, string>({
      query: (postId) => ({ url: `/feed/${postId}/save`, method: "POST" }),
      transformResponse: (response: { data: { saved: boolean } }) => response.data,
      invalidatesTags: ["SavedFeed"],
    }),
    getPost: builder.query<FeedItem, string>({
      query: (postId) => `/feed/${postId}`,
      transformResponse: (response: { data: FeedItem }) => response.data,
      providesTags: (_result, _error, postId) => [{ type: "Feed", id: postId }],
    }),
    getComments: builder.query<CommentsResponse, string>({
      query: (postId) => `/feed/${postId}/comments`,
      transformResponse: (response: { data: CommentsResponse }) => response.data,
      providesTags: (_result, _error, postId) => [{ type: "Comments", id: postId }],
    }),
    addComment: builder.mutation<FeedComment, { postId: string; content: string }>({
      query: ({ postId, content }) => ({ url: `/feed/${postId}/comments`, method: "POST", body: { content } }),
      transformResponse: (response: { data: FeedComment }) => response.data,
      // Optimistic append so the comment renders instantly instead of
      // waiting on the POST round trip plus the invalidation refetch after
      // it — same pattern as `sendMessage` in messages-api.ts.
      // `getOwnProfile` is safe to read here since `AppSidebar` (mounted on
      // every protected page) always has it fetched by the time a comment
      // box is on screen.
      async onQueryStarted({ postId, content }, { dispatch, getState, queryFulfilled }) {
        const profile = profileApi.endpoints.getOwnProfile.select()(getState()).data?.profile;
        if (!profile) return;

        const patchResult = dispatch(
          feedApi.util.updateQueryData("getComments", postId, (draft) => {
            draft.items.push({
              id: `optimistic-${Date.now()}`,
              postId,
              content,
              createdAt: new Date().toISOString(),
              author: {
                userId: profile.userId,
                username: profile.username,
                name: profile.name,
                avatarUrl: profile.avatarUrl,
              },
            });
            draft.total += 1;
          }),
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Comments", id: postId },
        { type: "Feed", id: postId },
      ],
    }),
    deleteComment: builder.mutation<void, { commentId: string; postId: string }>({
      query: ({ commentId }) => ({ url: `/feed/comments/${commentId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Comments", id: postId },
        { type: "Feed", id: postId },
      ],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useCreatePostMutation,
  useToggleLikeMutation,
  useGetSavedPostsQuery,
  useToggleSavePostMutation,
  useGetPostQuery,
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
} = feedApi;
