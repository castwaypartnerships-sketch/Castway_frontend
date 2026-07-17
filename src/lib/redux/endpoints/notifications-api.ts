import { api } from "@/lib/redux/api";
import type { AppNotification } from "@/lib/types/notification";

interface NotificationsResponse {
  items: AppNotification[];
  page: number;
  pageSize: number;
  total: number;
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => "/notifications",
      transformResponse: (response: { data: NotificationsResponse }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: "Notifications" as const, id: item.id })),
              { type: "Notifications" as const, id: "LIST" },
            ]
          : [{ type: "Notifications" as const, id: "LIST" }],
    }),
    markNotificationRead: builder.mutation<void, string>({
      query: (notificationId) => ({ url: `/notifications/${notificationId}/read`, method: "POST" }),
      invalidatesTags: (_result, _error, notificationId) => [
        { type: "Notifications", id: notificationId },
        "Dashboard",
      ],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: "/notifications/read-all", method: "POST" }),
      invalidatesTags: [{ type: "Notifications", id: "LIST" }, "Dashboard"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
