import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Features",
  description: "Everything Castway offers, in one place.",
};

const FEATURES = [
  {
    title: "One profile",
    description: "A single profile that carries your work, connections, and history across every relationship.",
  },
  {
    title: "Opportunities",
    description: "Browse and apply to opportunities, or post them if you're hiring talent.",
  },
  {
    title: "Connections & messaging",
    description: "Connect directly with the people and companies you work with, and keep every conversation in one inbox.",
  },
  {
    title: "Roster & campaign management",
    description: "Agencies and brands can manage rosters, shortlists, and campaigns without leaving the platform.",
  },
];

export default function FeaturesPage() {
  return (
    <MarketingStubPage
      eyebrow="Product"
      title="Features"
      description="What you can do on Castway today."
    >

      <div className="space-y-8 mt-8">
        <h2 className="text-2xl font-bold mb-6">Everything You Need to Run Your Business</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="border border-border/40 p-6 rounded-xl bg-card">
            <h3 className="text-xl font-bold mb-3">Dynamic Media Kits</h3>
            <p className="text-muted-foreground text-sm">Automatically updating stats from YouTube, Instagram, and TikTok. Shareable via a single professional link.</p>
          </div>
          
          <div className="border border-border/40 p-6 rounded-xl bg-card">
            <h3 className="text-xl font-bold mb-3">Campaign Pipeline</h3>
            <p className="text-muted-foreground text-sm">A Kanban-style board to track all your ongoing deals from 'Pitching' to 'Delivered' and 'Paid'.</p>
          </div>
          
          <div className="border border-border/40 p-6 rounded-xl bg-card">
            <h3 className="text-xl font-bold mb-3">Smart Contracts</h3>
            <p className="text-muted-foreground text-sm">Standardized, plain-English agreements that protect both parties, with digital signatures built-in.</p>
          </div>
          
          <div className="border border-border/40 p-6 rounded-xl bg-card">
            <h3 className="text-xl font-bold mb-3">Agency Dashboards</h3>
            <p className="text-sm text-muted-foreground">Specialized views for talent managers to handle multiple creator profiles, track revenue splits, and manage team permissions.</p>
          </div>
        </div>
      </div>
    </MarketingStubPage>
  );
}
