import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "What we're building next at Castway.",
};

export default function RoadmapPage() {
  return (
    <MarketingStubPage
      eyebrow="Product"
      title="Roadmap"
      description="A public roadmap is coming. We're currently prioritizing based on direct feedback from early users."
      >

      <div className="space-y-10 mt-8">
        <div className="relative pl-8 border-l-2 border-primary/30">
          <div className="absolute w-4 h-4 rounded-full bg-primary -left-[9px] top-1"></div>
          <h3 className="text-xl font-bold mb-1">Q4 2026: Advanced Analytics</h3>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-muted-foreground">
            <li>Cross-platform audience insights</li>
            <li>Campaign ROI tracking for brands</li>
            <li>Exportable reporting dashboards</li>
          </ul>
        </div>
        <div className="relative pl-8 border-l-2 border-muted">
          <div className="absolute w-4 h-4 rounded-full bg-muted -left-[9px] top-1"></div>
          <h3 className="text-xl font-bold mb-1 text-muted-foreground">Q1 2027: Integrated Contracts</h3>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-muted-foreground opacity-70">
            <li>E-signature support directly in proposals</li>
            <li>Customizable legal templates</li>
            <li>Automated tax form collection</li>
          </ul>
        </div>
        <div className="relative pl-8 border-l-2 border-muted">
          <div className="absolute w-4 h-4 rounded-full bg-muted -left-[9px] top-1"></div>
          <h3 className="text-xl font-bold mb-1 text-muted-foreground">Q2 2027: Mobile App Launch</h3>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-muted-foreground opacity-70">
            <li>Native iOS and Android applications</li>
            <li>Push notifications for direct messages</li>
            <li>On-the-go campaign approvals</li>
          </ul>
        </div>
      </div>
    </MarketingStubPage>
  );
}
