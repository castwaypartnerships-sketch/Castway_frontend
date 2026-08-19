import { api } from "@/lib/redux/api";

export interface TeamMemberDto {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
  roleLabel: string | null;
  permissions: string[];
}

export interface TeamInviteDto {
  id: string;
  email: string;
  roleLabel: string;
  permissions: string[];
  status: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  expiresAt: string;
  createdAt: string;
}

export interface InviteTeamMemberInput {
  email: string;
  roleLabel: string;
  permissions: string[];
}

export const teamApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTeamMembers: builder.query<{ items: TeamMemberDto[] }, void>({
      query: () => "/team/members",
      transformResponse: (response: { data: { items: TeamMemberDto[] } }) => response.data,
      providesTags: ["RosterManagers"],
    }),
    getTeamInvites: builder.query<{ items: TeamInviteDto[] }, void>({
      query: () => "/team/invites",
      transformResponse: (response: { data: { items: TeamInviteDto[] } }) => response.data,
      providesTags: ["TeamInvites"],
    }),
    inviteTeamMember: builder.mutation<TeamInviteDto, InviteTeamMemberInput>({
      query: (body) => ({ url: "/team/invite", method: "POST", body }),
      transformResponse: (response: { data: TeamInviteDto }) => response.data,
      invalidatesTags: ["TeamInvites"],
    }),
    revokeTeamInvite: builder.mutation<void, string>({
      query: (id) => ({ url: `/team/invites/${id}`, method: "DELETE" }),
      invalidatesTags: ["TeamInvites"],
    }),
    updateTeamMemberPermissions: builder.mutation<void, { memberId: string; permissions: string[] }>({
      query: ({ memberId, permissions }) => ({
        url: `/team/members/${memberId}/permissions`,
        method: "PATCH",
        body: { permissions },
      }),
      invalidatesTags: ["RosterManagers"],
    }),
    removeTeamMember: builder.mutation<void, string>({
      query: (memberId) => ({ url: `/team/members/${memberId}`, method: "DELETE" }),
      invalidatesTags: ["RosterManagers"],
    }),
    // Public — no auth. The accept page reads these before the person has
    // any account to sign in with.
    getTeamInviteByToken: builder.query<TeamInviteDto, string>({
      query: (token) => `/team/invite/${token}`,
      transformResponse: (response: { data: TeamInviteDto }) => response.data,
    }),
    acceptTeamInvite: builder.mutation<
      { managerUserId: string },
      { token: string; name: string; username: string; password: string }
    >({
      query: ({ token, ...body }) => ({ url: `/team/invite/${token}/accept`, method: "POST", body }),
      transformResponse: (response: { data: { managerUserId: string } }) => response.data,
    }),
  }),
});

export const {
  useGetTeamMembersQuery,
  useGetTeamInvitesQuery,
  useInviteTeamMemberMutation,
  useRevokeTeamInviteMutation,
  useUpdateTeamMemberPermissionsMutation,
  useRemoveTeamMemberMutation,
  useGetTeamInviteByTokenQuery,
  useAcceptTeamInviteMutation,
} = teamApi;
