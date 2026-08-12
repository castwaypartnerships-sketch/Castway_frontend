import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Report a Bug",
  description: "Found something broken on Castway? Let us know.",
};

export default function ReportBugPage() {
  return (
    <MarketingStubPage
      eyebrow="Support"
      title="Report a Bug"
      description="An in-app bug report form is coming. For now, email us with what you saw."
    >

      <div className="space-y-6 mt-8">
        <p className="text-lg mb-4">Found something that isn't working right? Let us know so we can fix it.</p>
        
        <div className="bg-card border border-border/60 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">What happened?</label>
              <input type="text" className="w-full h-10 rounded-md border border-border bg-background px-3" placeholder="Brief description of the issue" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Steps to reproduce</label>
              <textarea className="w-full h-24 rounded-md border border-border bg-background p-3" placeholder="1. Go to page... 2. Click button..." disabled></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Browser / Device</label>
              <input type="text" className="w-full h-10 rounded-md border border-border bg-background px-3" placeholder="e.g. Chrome 114 on MacOS" disabled />
            </div>
            <button type="button" disabled className="px-4 py-2 bg-primary text-primary-foreground rounded-md opacity-50 cursor-not-allowed">Submit Report</button>
          </div>
        </div>
      </div>
    </MarketingStubPage>
  );
}
