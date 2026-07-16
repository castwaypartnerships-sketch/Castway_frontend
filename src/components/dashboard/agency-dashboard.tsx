import type { AgencyDashboardSummary } from "@/lib/redux/endpoints/dashboard-api";
import { HiringSummaryView } from "./hiring-summary-view";

export function AgencyDashboard({ data }: { data: AgencyDashboardSummary }) {
  return <HiringSummaryView data={data} subtitle="Your postings and roster activity at a glance." />;
}
