import { api } from "@/lib/redux/api";

export interface NotificationPreferences {
  connectionRequests: boolean;
  messages: boolean;
  applicationUpdates: boolean;
  postActivity: boolean;
  reviewsAndEndorsements: boolean;
  connectionRequestsEmail: boolean;
  messagesEmail: boolean;
  applicationUpdatesEmail: boolean;
  postActivityEmail: boolean;
  reviewsAndEndorsementsEmail: boolean;
  rosterInvitesEmail: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  weeklyDigestOptIn: boolean;
}

export type Visibility = "PUBLIC" | "CONNECTIONS_ONLY";

export interface PrivacySettings {
  profileVisibility: Visibility;
  messagePermission: Visibility;
  acceptingConnectionRequests: boolean;
}

export const accountApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => "/account/notification-preferences",
      transformResponse: (response: { data: NotificationPreferences }) => response.data,
      providesTags: ["NotificationPreferences"],
    }),
    updateNotificationPreferences: builder.mutation<void, NotificationPreferences>({
      query: (body) => ({ url: "/account/notification-preferences", method: "PUT", body }),
      invalidatesTags: ["NotificationPreferences"],
    }),
    changePassword: builder.mutation<void, { currentPassword?: string; newPassword: string }>({
      query: (body) => ({ url: "/account/change-password", method: "POST", body }),
    }),
    requestEmailChange: builder.mutation<void, { newEmail: string }>({
      query: (body) => ({ url: "/account/request-email-change", method: "POST", body }),
    }),
    confirmEmailChange: builder.mutation<void, { code: string }>({
      query: (body) => ({ url: "/account/confirm-email-change", method: "POST", body }),
      invalidatesTags: ["Session"],
    }),
    deleteAccount: builder.mutation<void, void>({
      query: () => ({ url: "/account", method: "DELETE" }),
      invalidatesTags: ["Session"],
    }),
    getPrivacySettings: builder.query<PrivacySettings, void>({
      query: () => "/account/privacy-settings",
      transformResponse: (response: { data: PrivacySettings }) => response.data,
      providesTags: ["PrivacySettings"],
    }),
    updatePrivacySettings: builder.mutation<void, PrivacySettings>({
      query: (body) => ({ url: "/account/privacy-settings", method: "PUT", body }),
      invalidatesTags: ["PrivacySettings"],
    }),
    logoutEverywhere: builder.mutation<void, void>({
      query: () => ({ url: "/account/logout-everywhere", method: "POST" }),
    }),
  }),
});

export const {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useChangePasswordMutation,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useDeleteAccountMutation,
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
  useLogoutEverywhereMutation,
} = accountApi;
