import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Press",
  description: "Media resources and press inquiries for Castway.",
};

export default function PressPage() {
  return (
    <MarketingStubPage
      eyebrow="Company"
      title="Press"
      description="Brand assets and a press kit are on the way. For media inquiries in the meantime, reach out directly."
      >

      <div className="space-y-8 mt-8">
        <div className="border-b border-border/40 pb-6">
          <p className="text-sm text-primary font-bold mb-1">October 12, 2026</p>
          <h3 className="text-xl font-bold mb-2">Castway Announces $5M Series A to Expand Agency Tools</h3>
          <p className="text-muted-foreground mb-4">The new funding round, led by Creator Ventures, will accelerate the development of our specialized suite for talent management agencies.</p>
          <a href="#" className="text-primary hover:underline text-sm font-medium">Read Press Release →</a>
        </div>
        <div className="border-b border-border/40 pb-6">
          <p className="text-sm text-primary font-bold mb-1">July 04, 2026</p>
          <h3 className="text-xl font-bold mb-2">Introducing Escrow Payments for Brand Campaigns</h3>
          <p className="text-muted-foreground mb-4">Castway launches a secure payment infrastructure ensuring creators get paid on time while protecting brands' campaign investments.</p>
          <a href="#" className="text-primary hover:underline text-sm font-medium">Read Press Release →</a>
        </div>
        <div className="border-b border-border/40 pb-6">
          <p className="text-sm text-primary font-bold mb-1">March 22, 2026</p>
          <h3 className="text-xl font-bold mb-2">Castway Surpasses 10,000 Active Creators on Platform</h3>
          <p className="text-muted-foreground mb-4">A major milestone for the ecosystem as thousands of independent professionals choose Castway as their primary professional home.</p>
          <a href="#" className="text-primary hover:underline text-sm font-medium">Read Press Release →</a>
        </div>
      </div>
    </MarketingStubPage>
  );
}
