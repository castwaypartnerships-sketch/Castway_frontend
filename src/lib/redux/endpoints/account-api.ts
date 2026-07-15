import { api } from "@/lib/redux/api";

export interface NotificationPreferences {
  connectionRequests: boolean;
  messages: boolean;
  applicationUpdates: boolean;
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
  }),
});

export const {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useChangePasswordMutation,
} = accountApi;
