import { api } from "@/lib/redux/api";
import type { ApplicationStatus } from "@/lib/types/application";

export interface RecentApplication {
  applicationId: string;
  opportunityId: string;
  opportunityTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface RecentApplicant {
  applicationId: string;
  opportunityId: string;
  opportunityTitle: string;
  applicantUserId: string;
  applicantName: string;
  applicantAvatarUrl: string | null;
  status: ApplicationStatus;
  appliedAt: string;
}

interface TalentDashboardFields {
  applicationsSubmittedCount: number;
  savedOpportunitiesCount: number;
  connectionsCount: number;
  connectionsGrowthLast30Days: number;
  profileViewsCount: number;
  pendingConnectionRequestsCount: number;
  unreadNotificationsCount: number;
  postsCount: number;
  recentApplications: RecentApplication[];
}

interface HiringDashboardFields {
  postedOpportunitiesCount: number;
  activeOpportunitiesCount: number;
  totalApplicantsCount: number;
  connectionsCount: number;
  profileViewsCount: number;
  pendingConnectionRequestsCount: number;
  unreadNotificationsCount: number;
  recentApplicants: RecentApplicant[];
}

export interface CreatorDashboardSummary extends TalentDashboardFields {
  kind: "CREATOR";
}
export interface FreelancerDashboardSummary extends TalentDashboardFields {
  kind: "FREELANCER";
}
export interface BrandDashboardSummary extends HiringDashboardFields {
  kind: "BRAND";
}
export interface AgencyDashboardSummary extends HiringDashboardFields {
  kind: "AGENCY";
}

export type DashboardSummary =
  | CreatorDashboardSummary
  | FreelancerDashboardSummary
  | BrandDashboardSummary
  | AgencyDashboardSummary;

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
