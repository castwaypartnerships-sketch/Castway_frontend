import { api } from "@/lib/redux/api";
import type { FeedComment, FeedItem, PostCategory } from "@/lib/types/feed";
import { profileApi } from "@/lib/redux/endpoints/profile-api";
import { forceRefetchOnPageChange, mergePaginatedPage } from "@/lib/redux/pagination";

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
  imageUrl?: string;
  category?: PostCategory;
  visibility?: "PUBLIC" | "CONNECTIONS_ONLY";
  saveAsDraft?: boolean;
  title?: string;
  tags?: string[];
  budget?: string;
  applicationDeadline?: string;
  scheduledFor?: string;
}

/** Same fields as `CreatePostInput` minus the create-only `saveAsDraft`/
 * `scheduledFor` — editing a post never changes its DRAFT/SCHEDULED/PUBLISHED
 * status (that's Publish/Archive/Restore on the My Posts page), only its
 * content. Backend's `postUpdateSchema` is `postWriteSchema.partial()`, so
 * every field here is optional — send only what actually changed. */
export interface UpdatePostInput {
  content?: string;
  imageUrl?: string;
  category?: PostCategory;
  visibility?: "PUBLIC" | "CONNECTIONS_ONLY";
  title?: string;
  tags?: string[];
  budget?: string;
  applicationDeadline?: string;
}

export const feedApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Infinite-scroll pagination: the cache key ignores `page` (see
    // `serializeQueryArgs`) so every page for a given category lands in the
    // same cache entry, and `merge` appends each new page's items onto it
    // instead of replacing it — the standard RTK Query pagination recipe.
    getFeed: builder.query<FeedResponse, { category?: PostCategory; page?: number } | void>({
      query: (args) => ({
        url: "/feed",
        params: {
          ...(args?.category ? { category: args.category } : {}),
          page: args?.page ?? 1,
        },
      }),
      transformResponse: (response: { data: FeedResponse }) => response.data,
      serializeQueryArgs: ({ queryArgs }) => ({ category: queryArgs?.category }),
      merge: mergePaginatedPage,
      forceRefetch: forceRefetchOnPageChange,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: "Feed" as const, id: item.id })),
              { type: "Feed" as const, id: "LIST" },
            ]
          : [{ type: "Feed" as const, id: "LIST" }],
    }),
    getPostsByAuthor: builder.query<FeedResponse, { userId: string; page?: number }>({
      query: ({ userId, page }) => ({
        url: `/feed/author/${userId}`,
        params: { page: page ?? 1 },
      }),
      transformResponse: (response: { data: FeedResponse }) => response.data,
      serializeQueryArgs: ({ queryArgs }) => ({ userId: queryArgs.userId }),
      merge: mergePaginatedPage,
      forceRefetch: forceRefetchOnPageChange,
      providesTags: (result, _error, { userId }) =>
        result
          ? [
              ...result.items.map((item) => ({ type: "Feed" as const, id: item.id })),
              { type: "Feed" as const, id: `AUTHOR-${userId}` },
            ]
          : [{ type: "Feed" as const, id: `AUTHOR-${userId}` }],
    }),
    // The create response is the raw `Post` row, not the author/like/save-
    // enriched `FeedItem` the list view needs — so this doesn't try to use
    // the response body at all; it just invalidates the list to refetch it
    // through the DTO that adds that enrichment.
    createPost: builder.mutation<void, CreatePostInput>({
      query: (body) => ({ url: "/feed", method: "POST", body }),
      invalidatesTags: [{ type: "Feed", id: "LIST" }, { type: "Feed", id: "MINE" }],
    }),
    updatePost: builder.mutation<void, { postId: string; input: UpdatePostInput }>({
      query: ({ postId, input }) => ({ url: `/feed/${postId}`, method: "PATCH", body: input }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: "Feed", id: postId },
        { type: "Feed", id: "MINE" },
        { type: "Feed", id: "LIST" },
      ],
    }),
    getMyPosts: builder.query<FeedResponse, void>({
      query: () => "/feed/mine",
      transformResponse: (response: { data: FeedResponse }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: "Feed" as const, id: item.id })),
              { type: "Feed" as const, id: "MINE" },
            ]
          : [{ type: "Feed" as const, id: "MINE" }],
    }),
    publishPost: builder.mutation<void, string>({
      query: (postId) => ({ url: `/feed/${postId}/publish`, method: "POST" }),
      invalidatesTags: (_result, _error, postId) => [
        { type: "Feed", id: postId },
        { type: "Feed", id: "MINE" },
        { type: "Feed", id: "LIST" },
      ],
    }),
    archivePost: builder.mutation<void, string>({
      query: (postId) => ({ url: `/feed/${postId}/archive`, method: "POST" }),
      invalidatesTags: (_result, _error, postId) => [
        { type: "Feed", id: postId },
        { type: "Feed", id: "MINE" },
        { type: "Feed", id: "LIST" },
      ],
    }),
    unarchivePost: builder.mutation<void, string>({
      query: (postId) => ({ url: `/feed/${postId}/unarchive`, method: "POST" }),
      invalidatesTags: (_result, _error, postId) => [
        { type: "Feed", id: postId },
        { type: "Feed", id: "MINE" },
        { type: "Feed", id: "LIST" },
      ],
    }),
    deletePost: builder.mutation<void, string>({
      query: (postId) => ({ url: `/feed/${postId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, postId) => [
        { type: "Feed", id: postId },
        { type: "Feed", id: "MINE" },
        { type: "Feed", id: "LIST" },
      ],
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
    // Same merge-by-page pagination recipe as `getFeed` above, keyed by
    // `postId` so every page for a given post lands in one cache entry.
    getComments: builder.query<CommentsResponse, { postId: string; page?: number }>({
      query: ({ postId, page }) => ({ url: `/feed/${postId}/comments`, params: { page: page ?? 1 } }),
      transformResponse: (response: { data: CommentsResponse }) => response.data,
      serializeQueryArgs: ({ queryArgs }) => ({ postId: queryArgs.postId }),
      merge: mergePaginatedPage,
      forceRefetch: forceRefetchOnPageChange,
      providesTags: (_result, _error, { postId }) => [{ type: "Comments", id: postId }],
    }),
    // Replies are fetched per-thread on demand ("View N replies"), not
    // bundled into `getComments` — keyed by the parent (top-level) comment id.
    getReplies: builder.query<{ items: FeedComment[] }, string>({
      query: (parentCommentId) => `/feed/comments/${parentCommentId}/replies`,
      transformResponse: (response: { data: { items: FeedComment[] } }) => response.data,
      providesTags: (_result, _error, parentCommentId) => [{ type: "Replies", id: parentCommentId }],
    }),
    addComment: builder.mutation<FeedComment, { postId: string; content: string; parentCommentId?: string }>({
      query: ({ postId, content, parentCommentId }) => ({
        url: `/feed/${postId}/comments`,
        method: "POST",
        body: { content, parentCommentId },
      }),
      transformResponse: (response: { data: FeedComment }) => response.data,
      // Optimistic append so the comment/reply renders instantly instead of
      // waiting on the POST round trip plus the invalidation refetch after
      // it — same pattern as `sendMessage` in messages-api.ts.
      // `getOwnProfile` is safe to read here since `AppSidebar` (mounted on
      // every protected page) always has it fetched by the time a comment
      // box is on screen.
      async onQueryStarted({ postId, content, parentCommentId }, { dispatch, getState, queryFulfilled }) {
        const profile = profileApi.endpoints.getOwnProfile.select()(getState()).data?.profile;
        if (!profile) return;

        const optimisticComment: FeedComment = {
          id: `optimistic-${Date.now()}`,
          postId,
          content,
          parentCommentId: parentCommentId ?? null,
          replyCount: 0,
          createdAt: new Date().toISOString(),
          author: {
            userId: profile.userId,
            username: profile.username,
            name: profile.name,
            avatarUrl: profile.avatarUrl,
          },
        };

        const patches = [
          parentCommentId
            ? dispatch(
                feedApi.util.updateQueryData("getReplies", parentCommentId, (draft) => {
                  draft.items.push(optimisticComment);
                }),
              )
            : dispatch(
                feedApi.util.updateQueryData("getComments", { postId }, (draft) => {
                  draft.items.push(optimisticComment);
                  draft.total += 1;
                }),
              ),
        ];
        // Bump the parent's visible reply count too, if its top-level list
        // happens to already be cached (e.g. the thread being replied to is
        // on screen right now).
        if (parentCommentId) {
          patches.push(
            dispatch(
              feedApi.util.updateQueryData("getComments", { postId }, (draft) => {
                const parent = draft.items.find((c) => c.id === parentCommentId);
                if (parent) parent.replyCount += 1;
              }),
            ),
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: (_result, _error, { postId, parentCommentId }) => [
        { type: "Comments", id: postId },
        { type: "Feed", id: postId },
        ...(parentCommentId ? [{ type: "Replies" as const, id: parentCommentId }] : []),
      ],
    }),
    deleteComment: builder.mutation<void, { commentId: string; postId: string; parentCommentId?: string }>({
      query: ({ commentId }) => ({ url: `/feed/comments/${commentId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { postId, commentId, parentCommentId }) => [
        { type: "Comments", id: postId },
        { type: "Feed", id: postId },
        // Invalidate the thread this comment replied into (if any) and, in
        // case it was itself a top-level comment with replies, its own
        // now-deleted (cascaded) thread too.
        { type: "Replies", id: parentCommentId ?? commentId },
      ],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetPostsByAuthorQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useGetMyPostsQuery,
  usePublishPostMutation,
  useArchivePostMutation,
  useUnarchivePostMutation,
  useDeletePostMutation,
  useToggleLikeMutation,
  useGetSavedPostsQuery,
  useToggleSavePostMutation,
  useGetPostQuery,
  useGetCommentsQuery,
  useGetRepliesQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
} = feedApi;
