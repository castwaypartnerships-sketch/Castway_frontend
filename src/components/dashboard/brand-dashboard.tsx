import type { BrandDashboardSummary } from "@/lib/redux/endpoints/dashboard-api";
import { HiringSummaryView } from "./hiring-summary-view";

export function BrandDashboard({ data }: { data: BrandDashboardSummary }) {
  return <HiringSummaryView data={data} subtitle="Your campaigns and applicants at a glance." />;
}
