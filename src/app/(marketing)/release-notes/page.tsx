import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Release Notes",
  description: "What's new on Castway.",
};

export default function ReleaseNotesPage() {
  return (
    <MarketingStubPage
      eyebrow="Resources"
      title="Release Notes"
      description="A public changelog is coming soon so you can follow along with what ships each week."
      >

      <div className="space-y-10 mt-8">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3">
            v1.2.0 <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full uppercase">Latest</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Released on August 10, 2026</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Added ability to save opportunity drafts before publishing.</li>
            <li>Introduced rich-text formatting for user bios and campaign briefs.</li>
            <li>Fixed a bug where agency dashboard metrics would occasionally desync.</li>
            <li>Improved image upload speeds by implementing edge caching.</li>
          </ul>
        </div>
        <div className="pt-8 border-t border-border/40">
          <h3 className="text-2xl font-bold">v1.1.5</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Released on July 22, 2026</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Added dark mode toggle in account settings.</li>
            <li>New notification preferences center.</li>
            <li>Resolved issue with message unread badges persisting incorrectly.</li>
          </ul>
        </div>
        <div className="pt-8 border-t border-border/40">
          <h3 className="text-2xl font-bold">v1.1.0</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Released on June 15, 2026</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Launched the Agency Roster management feature.</li>
            <li>Added multi-account switching.</li>
            <li>General performance improvements across the feed.</li>
          </ul>
        </div>
      </div>
    </MarketingStubPage>
  );
}
