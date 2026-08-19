import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Feature Requests",
  description: "Suggest and vote on what Castway should build next.",
};

export default function FeatureRequestsPage() {
  return (
    <MarketingStubPage
      eyebrow="Support"
      title="Feature Requests"
      description="A public voting board is coming. Until then, send ideas straight to the team."
      >

      <div className="space-y-8 mt-8">
        <p className="text-lg">Castway is built alongside our community. We rely on your feedback to decide what to build next.</p>
        
        <div className="bg-card border border-border/60 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Submit a Request</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Feature Title</label>
              <input type="text" className="w-full h-10 rounded-md border border-border bg-background px-3" placeholder="e.g. Media Kit Export to PDF" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description & Use Case</label>
              <textarea className="w-full h-24 rounded-md border border-border bg-background p-3" placeholder="How would this feature help your workflow?" disabled></textarea>
            </div>
            <button type="button" disabled className="px-4 py-2 bg-primary text-primary-foreground rounded-md opacity-50 cursor-not-allowed">Submit Request</button>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Top Requested Features (In Review)</h3>
          <ul className="space-y-3">
            <li className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
              <span>Instagram API Integration</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">2,412 votes</span>
            </li>
            <li className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
              <span>Custom Proposal Templates</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">1,894 votes</span>
            </li>
            <li className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
              <span>Calendar View for Campaigns</span>
              <span className="text-xs bg-muted px-2 py-1 rounded">943 votes</span>
            </li>
          </ul>
        </div>
      </div>
    </MarketingStubPage>
  );
}
