import { api } from "@/lib/redux/api";
import type { EndorsementCounts } from "@/lib/types/profile";

export const endorsementsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    endorseSkill: builder.mutation<
      { counts: EndorsementCounts },
      { userId: string; username: string; skill: string }
    >({
      query: ({ userId, skill }) => ({ url: `/endorsements/${userId}`, method: "POST", body: { skill } }),
      transformResponse: (response: { data: { counts: EndorsementCounts } }) => response.data,
      invalidatesTags: (_result, _error, { username }) => [{ type: "Endorsements", id: username }],
    }),
  }),
});

export const { useEndorseSkillMutation } = endorsementsApi;
