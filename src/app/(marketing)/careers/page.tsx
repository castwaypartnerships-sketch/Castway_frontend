import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles at Castway.",
};

export default function CareersPage() {
  return (
    <MarketingStubPage
      eyebrow="Company"
      title="Careers"
      description="We're not actively listing open roles yet, but we're always happy to hear from people who care about the creator economy."
      >

      <div className="space-y-8 mt-8">
        <p className="text-lg mb-8">Join us in building the infrastructure for the creator economy.</p>
        
        <div className="border border-border/60 rounded-xl p-6 hover:border-primary/50 transition-colors">
          <h3 className="text-xl font-bold">Senior Full Stack Engineer</h3>
          <p className="text-muted-foreground mt-2 mb-4">Remote (US / Canada) • Full-time</p>
          <p className="text-sm">Help us scale our campaign matching engine and build real-time collaboration features using Next.js and Node.js.</p>
        </div>
        
        <div className="border border-border/60 rounded-xl p-6 hover:border-primary/50 transition-colors">
          <h3 className="text-xl font-bold">Product Designer</h3>
          <p className="text-muted-foreground mt-2 mb-4">Remote (Europe) • Full-time</p>
          <p className="text-sm">Design intuitive interfaces for complex workflows spanning creators, brands, and talent managers.</p>
        </div>

        <div className="border border-border/60 rounded-xl p-6 hover:border-primary/50 transition-colors">
          <h3 className="text-xl font-bold">Creator Success Manager</h3>
          <p className="text-muted-foreground mt-2 mb-4">New York, NY (Hybrid) • Full-time</p>
          <p className="text-sm">Work directly with top-tier talent to ensure they get the most out of the Castway platform.</p>
        </div>
      </div>
    </MarketingStubPage>
  );
}
