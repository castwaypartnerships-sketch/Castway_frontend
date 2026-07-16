import type { FreelancerDashboardSummary } from "@/lib/redux/endpoints/dashboard-api";
import { TalentSummaryView } from "./talent-summary-view";

export function FreelancerDashboard({ data }: { data: FreelancerDashboardSummary }) {
  return (
    <TalentSummaryView
      data={data}
      subtitle="Your gigs and applications across Castway."
      ctaHref="/opportunities"
      ctaLabel="Browse gigs"
    />
  );
}
