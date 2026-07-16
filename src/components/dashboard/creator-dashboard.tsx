import type { CreatorDashboardSummary } from "@/lib/redux/endpoints/dashboard-api";
import { TalentSummaryView } from "./talent-summary-view";

export function CreatorDashboard({ data }: { data: CreatorDashboardSummary }) {
  return (
    <TalentSummaryView
      data={data}
      subtitle="Your activity across Castway."
      ctaHref="/opportunities"
      ctaLabel="Browse opportunities"
    />
  );
}
