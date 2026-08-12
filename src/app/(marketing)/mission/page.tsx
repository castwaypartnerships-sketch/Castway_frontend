import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Our Mission",
  description:
    "Castway's mission is to give every creator, freelancer, agency, and brand a single, honest place to work together.",
};

export default function MissionPage() {
  return (
    <MarketingStubPage
      eyebrow="Company"
      title="Our Mission"
      description="Give every professional relationship in the creator economy a home."
    >

      <div className="space-y-8 mt-8">
        <h2 className="text-2xl font-bold">Empowering the Independent Economy</h2>
        <p className="text-lg">
          Our mission is to build the definitive operating system for professional relationships in the creator space. 
          We believe that talent should be able to focus on creating, not administration.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          <div className="p-6 bg-muted/20 rounded-xl">
            <h3 className="font-bold mb-2">Transparency First</h3>
            <p className="text-sm text-muted-foreground">We believe in clear communication, upfront pricing, and honest metrics. No hidden fees or algorithm manipulation.</p>
          </div>
          <div className="p-6 bg-muted/20 rounded-xl">
            <h3 className="font-bold mb-2">Creator Ownership</h3>
            <p className="text-sm text-muted-foreground">Your audience is yours. Your data is yours. We provide the tools, but you own your business.</p>
          </div>
          <div className="p-6 bg-muted/20 rounded-xl">
            <h3 className="font-bold mb-2">Meaningful Connections</h3>
            <p className="text-sm text-muted-foreground">We optimize for long-term professional relationships over short-term transactional gigs.</p>
          </div>
        </div>
      </div>
    </MarketingStubPage>
  );
}
