import { api } from "@/lib/redux/api";

export const followApi = api.injectEndpoints({
  endpoints: (builder) => ({
    toggleFollow: builder.mutation<{ following: boolean }, { userId: string; username: string }>({
      query: ({ userId }) => ({ url: `/follow/${userId}/toggle`, method: "POST" }),
      transformResponse: (response: { data: { following: boolean } }) => response.data,
      invalidatesTags: (_result, _error, { username }) => [{ type: "Endorsements", id: username }],
    }),
  }),
});

export const { useToggleFollowMutation } = followApi;
