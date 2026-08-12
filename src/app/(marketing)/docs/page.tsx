import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Guides and references for using Castway.",
};

export default function DocsPage() {
  return (
    <MarketingStubPage
      eyebrow="Resources"
      title="Documentation"
      description="Full documentation is on the way. For now, the Help Center covers the most common questions."
      >

      <div className="space-y-6 mt-8">
        <p className="text-lg">Castway provides a robust API for agencies and enterprise brands to integrate our platform with their internal tools.</p>
        
        <div className="mt-8 space-y-4">
          <div className="p-4 border border-border/40 rounded-lg flex justify-between items-center bg-muted/10">
            <div>
              <h4 className="font-bold">Authentication</h4>
              <p className="text-sm text-muted-foreground">Learn how to generate and use API keys safely.</p>
            </div>
            <button className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded">View</button>
          </div>
          
          <div className="p-4 border border-border/40 rounded-lg flex justify-between items-center bg-muted/10">
            <div>
              <h4 className="font-bold">Campaigns API</h4>
              <p className="text-sm text-muted-foreground">Programmatically create campaigns and review applicants.</p>
            </div>
            <button className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded">View</button>
          </div>
          
          <div className="p-4 border border-border/40 rounded-lg flex justify-between items-center bg-muted/10">
            <div>
              <h4 className="font-bold">Webhooks</h4>
              <p className="text-sm text-muted-foreground">Listen for events like new proposals, messages, or payments.</p>
            </div>
            <button className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded">View</button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Full interactive API documentation is coming soon. Please contact your enterprise rep for current endpoints.</p>
      </div>
    </MarketingStubPage>
  );
}
