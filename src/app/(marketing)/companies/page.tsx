import type { Metadata } from "next";
import Link from "next/link";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "For Companies",
  description:
    "Brands and agencies — find, manage, and campaign with the right talent on Castway.",
};

export default function CompaniesPage() {
  return (
    <MarketingStubPage
      eyebrow="Product"
      title="For Companies"
      description="Find the right talent, run campaigns, and manage every relationship in one place."
    >

      <div className="space-y-8 mt-8">
        <h2 className="text-2xl font-bold">Scale Your Influencer and Freelance Operations</h2>
        <p className="text-lg text-muted-foreground">
          For brands and agencies, Castway acts as a CRM, campaign manager, and payment gateway all rolled into one platform.
        </p>
        
        <div className="space-y-6 mt-8">
          <div className="flex gap-4">
            <div className="mt-1 shrink-0"><div className="w-2 h-2 bg-primary rounded-full"></div></div>
            <div>
              <h3 className="font-bold">Discover Vetted Talent</h3>
              <p className="text-sm text-muted-foreground mt-1">Search our directory using advanced filters for audience demographics, past performance, and specific skill sets.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="mt-1 shrink-0"><div className="w-2 h-2 bg-primary rounded-full"></div></div>
            <div>
              <h3 className="font-bold">Streamline Campaign Logistics</h3>
              <p className="text-sm text-muted-foreground mt-1">Review proposals, manage deliverables, and communicate with creators through threaded, contextual messaging.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="mt-1 shrink-0"><div className="w-2 h-2 bg-primary rounded-full"></div></div>
            <div>
              <h3 className="font-bold">Simplified Payouts</h3>
              <p className="text-sm text-muted-foreground mt-1">Pay hundreds of creators globally with a single click. We handle the tax forms and currency conversions.</p>
            </div>
          </div>
        </div>
      </div>
    </MarketingStubPage>
  );
}
