import type { Metadata } from "next";
import Link from "next/link";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "For Professionals",
  description:
    "Creators, freelancers, and agencies — build one profile and get discovered on Castway.",
};

export default function ProfessionalsPage() {
  return (
    <MarketingStubPage
      eyebrow="Product"
      title="For Professionals"
      description="One profile for creators, freelancers, and agencies to get discovered, connect, and land work."
    >

      <div className="space-y-8 mt-8">
        <h2 className="text-2xl font-bold">Your Portfolio, Network, and Invoices in One Place</h2>
        <p className="text-lg text-muted-foreground">
          Castway is designed specifically for the workflow of modern independent professionals. Whether you're a YouTuber, a freelance graphic designer, or a boutique marketing agency, we give you the tools to thrive.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary font-bold">1</div>
            <h3 className="font-bold mb-2">Showcase Your Work</h3>
            <p className="text-sm text-muted-foreground">Connect your social accounts to automatically pull in your best content and real-time metrics.</p>
          </div>
          <div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary font-bold">2</div>
            <h3 className="font-bold mb-2">Find Opportunities</h3>
            <p className="text-sm text-muted-foreground">Browse a curated feed of inbound campaigns from verified brands looking for talent like you.</p>
          </div>
          <div>
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary font-bold">3</div>
            <h3 className="font-bold mb-2">Get Paid Safely</h3>
            <p className="text-sm text-muted-foreground">Never chase an invoice again. Our escrow system ensures funds are secured before you start working.</p>
          </div>
        </div>
      </div>
    </MarketingStubPage>
  );
}
