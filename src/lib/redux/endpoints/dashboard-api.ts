import { api } from "@/lib/redux/api";

export interface DashboardSummary {
  postedOpportunitiesCount: number;
  applicationsSubmittedCount: number;
  connectionsCount: number;
  pendingConnectionRequestsCount: number;
  conversationsCount: number;
  unreadNotificationsCount: number;
  postsCount: number;
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardSummary, void>({
      query: () => "/dashboard",
      transformResponse: (response: { data: DashboardSummary }) => response.data,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
