import { api } from "@/lib/redux/api";

export interface SessionUser {
  id: string;
  email: string;
  role: string | null;
  isAdmin: boolean;
}

const SESSION_AFFECTING_TAGS = [
  "Session",
  "Dashboard",
  "Feed",
  "SavedFeed",
  "Connections",
  "PendingConnections",
  "SuggestedConnections",
  "Opportunities",
  "SavedOpportunities",
  "Conversations",
  "NotificationPreferences",
] as const;

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSession: builder.query<{ user: SessionUser | null }, void>({
      query: () => "/auth/session",
      transformResponse: (response: { data: { user: SessionUser | null } }) => response.data,
      providesTags: ["Session"],
    }),
    signup: builder.mutation<void, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/signup", method: "POST", body }),
      invalidatesTags: [...SESSION_AFFECTING_TAGS],
    }),
    login: builder.mutation<void, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: [...SESSION_AFFECTING_TAGS],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: [...SESSION_AFFECTING_TAGS],
    }),
  }),
});

export const { useGetSessionQuery, useSignupMutation, useLoginMutation, useLogoutMutation } = authApi;
