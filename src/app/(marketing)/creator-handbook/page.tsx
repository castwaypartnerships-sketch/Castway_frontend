import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Creator Handbook",
  description: "Best practices and playbooks for creators on Castway.",
};

export default function CreatorHandbookPage() {
  return (
    <MarketingStubPage
      eyebrow="Resources"
      title="Creator Handbook"
      description="A full handbook of best practices for pitching, negotiating, and delivering great work is coming soon."
      >

      <div className="space-y-8 mt-8">
        <p className="text-lg">Welcome to the Creator Handbook. Here you'll find best practices for turning your audience into a sustainable business using Castway.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <a href="#" className="block p-6 bg-card border border-border/60 rounded-xl hover:border-primary transition-colors">
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">Chapter 1</span>
            <h3 className="text-xl font-bold mb-2">Building a Standout Profile</h3>
            <p className="text-sm text-muted-foreground">Learn how to curate your portfolio, highlight your best metrics, and write a bio that attracts top brands.</p>
          </a>
          
          <a href="#" className="block p-6 bg-card border border-border/60 rounded-xl hover:border-primary transition-colors">
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">Chapter 2</span>
            <h3 className="text-xl font-bold mb-2">Pricing Your Deliverables</h3>
            <p className="text-sm text-muted-foreground">A guide to calculating your rates based on engagement, reach, and production costs.</p>
          </a>
          
          <a href="#" className="block p-6 bg-card border border-border/60 rounded-xl hover:border-primary transition-colors">
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">Chapter 3</span>
            <h3 className="text-xl font-bold mb-2">Writing Winning Proposals</h3>
            <p className="text-sm text-muted-foreground">Templates and strategies for pitching brands, standing out in the inbox, and closing deals.</p>
          </a>
          
          <a href="#" className="block p-6 bg-card border border-border/60 rounded-xl hover:border-primary transition-colors">
            <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">Chapter 4</span>
            <h3 className="text-xl font-bold mb-2">Client Management 101</h3>
            <p className="text-sm text-muted-foreground">How to handle revisions, communicate timelines, and ensure a smooth approval process.</p>
          </a>
        </div>
      </div>
    </MarketingStubPage>
  );
}
