import { api } from "@/lib/redux/api";

export interface SessionUser {
  id: string;
  email: string;
  role: string | null;
  isAdmin: boolean;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  /** Meaningful only for AGENCY_MANAGER (see backend lib/rbac/permissions.ts)
   * — always [] for every other role. */
  permissions: string[];
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
    verifyEmail: builder.mutation<void, { code: string }>({
      query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
      invalidatesTags: ["Session"],
    }),
    resendOtp: builder.mutation<void, void>({
      query: () => ({ url: "/auth/resend-otp", method: "POST" }),
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation<void, { email: string; code: string; newPassword: string }>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
  }),
});

export const {
  useGetSessionQuery,
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
