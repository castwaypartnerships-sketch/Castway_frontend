import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "About Castway",
  description:
    "Castway is one profile for every kind of professional relationship — built for the modern creator economy.",
};

export default function AboutPage() {
  return (
    <MarketingStubPage
      eyebrow="Company"
      title="About Castway"
      description="One profile. Every kind of professional relationship. Built for the modern creator economy."
    >

      <div className="space-y-6 mt-8">
        <p className="text-lg">
          Castway was founded with a simple idea: the creator economy is growing rapidly, but the tools used to manage professional relationships are stuck in the past.
        </p>
        <p>
          Before Castway, creators, agencies, and brands were forced to rely on a messy combination of spreadsheets, disjointed email threads, and fragmented direct messages. 
          We built this platform to bring everyone onto a single, unified system.
        </p>
        <p>
          Today, thousands of professionals use Castway to manage their rosters, discover new talent, pitch campaigns, and get paid securely. We're a small, 
          fully remote team distributed across 8 countries, united by our passion for empowering independent creators.
        </p>
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Our Core Team</h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Jane Doe</strong> - Co-founder & CEO</li>
            <li><strong>John Smith</strong> - Co-founder & CTO</li>
            <li><strong>Emily Chen</strong> - Head of Product</li>
          </ul>
        </div>
      </div>
    </MarketingStubPage>
  );
}
