import { api } from "@/lib/redux/api";
import type { Profile, ProfileUpdateInput } from "@/lib/types/profile";

/** `Profile` itself is role-agnostic — managed talent is always CREATOR or
 * FREELANCER (enforced at creation), and the edit form needs to know which
 * to conditionally render role-specific fields, the same way the self-serve
 * profile form does. */
export interface ManagedTalentProfile extends Profile {
  role: "CREATOR" | "FREELANCER";
}

/** Raw records, not the joined/enriched DTOs `application-api.ts`/`connections-api.ts`
 * return elsewhere (no `opportunity.title`/`counterpart.name`) — this is a read-only
 * oversight view, not a full activity feed, so the frontend links out by id rather
 * than the backend doing extra joins for it. See the design doc for why. */
export interface ManagedTalentActivityPost {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
}

export interface ManagedTalentActivityApplication {
  id: string;
  opportunityId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN" | "COMPLETED";
  createdAt: string;
}

export interface ManagedTalentActivityConnection {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED" | "REMOVED";
  createdAt: string;
}

export interface ManagedTalentActivity {
  posts: { total: number; recent: ManagedTalentActivityPost[] };
  applications: { total: number; recent: ManagedTalentActivityApplication[] };
  connections: { total: number; recent: ManagedTalentActivityConnection[] };
  messaging: { totalSent: number; lastSentAt: string | null };
}

export const managedTalentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getManagedTalent: builder.query<{ items: ManagedTalentProfile[] }, void>({
      query: () => "/managed-talent",
      transformResponse: (response: { data: { items: ManagedTalentProfile[] } }) => response.data,
      providesTags: ["ManagedTalent"],
    }),
    createManagedTalent: builder.mutation<
      { tempPassword: string; talentUserId: string },
      { email: string; username: string; name: string; role: "CREATOR" | "FREELANCER" }
    >({
      query: (body) => ({ url: "/managed-talent", method: "POST", body }),
      transformResponse: (response: { data: { tempPassword: string; talentUserId: string } }) => response.data,
      invalidatesTags: ["ManagedTalent"],
    }),
    updateManagedTalentProfile: builder.mutation<
      Profile,
      { talentUserId: string; input: ProfileUpdateInput }
    >({
      query: ({ talentUserId, input }) => ({
        url: `/managed-talent/${talentUserId}/profile`,
        method: "PATCH",
        body: input,
      }),
      transformResponse: (response: { data: Profile }) => response.data,
      invalidatesTags: ["ManagedTalent"],
    }),
    releaseManagedTalent: builder.mutation<void, string>({
      query: (talentUserId) => ({ url: `/managed-talent/${talentUserId}/release`, method: "POST" }),
      invalidatesTags: ["ManagedTalent"],
    }),
    getManagedTalentActivity: builder.query<ManagedTalentActivity, string>({
      query: (talentUserId) => `/managed-talent/${talentUserId}/activity`,
      transformResponse: (response: { data: ManagedTalentActivity }) => response.data,
    }),
  }),
});

export const {
  useGetManagedTalentQuery,
  useCreateManagedTalentMutation,
  useUpdateManagedTalentProfileMutation,
  useReleaseManagedTalentMutation,
  useGetManagedTalentActivityQuery,
} = managedTalentApi;
