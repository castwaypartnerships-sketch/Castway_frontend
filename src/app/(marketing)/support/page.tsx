import type { Metadata } from "next";
import Link from "next/link";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Contact Support",
  description: "Reach the Castway support team.",
};

export default function SupportPage() {
  return (
    <MarketingStubPage
      eyebrow="Support"
      title="Contact Support"
      description="Need help with your account? We're here."
    >

      <div className="space-y-8 mt-8">
        <p className="text-lg text-muted-foreground">We're committed to making sure you have a smooth experience. Here are the best ways to get help.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-border/60 rounded-xl">
            <h3 className="text-xl font-bold mb-2">Help Center</h3>
            <p className="text-sm text-muted-foreground mb-4">Browse our comprehensive guides and articles for immediate answers to most questions.</p>
            <a href="/help" className="text-primary hover:underline text-sm font-medium">Visit Help Center →</a>
          </div>
          
          <div className="p-6 border border-border/60 rounded-xl">
            <h3 className="text-xl font-bold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-4">Our support team aims to reply to all inquiries within 24 hours.</p>
            <a href="mailto:support@castway.com" className="text-primary hover:underline text-sm font-medium">support@castway.com →</a>
          </div>
        </div>

        <div className="bg-muted/20 p-6 rounded-xl mt-8">
          <h3 className="font-bold mb-2">Premium Support for Agencies & Enterprise</h3>
          <p className="text-sm text-muted-foreground">If you are on an Enterprise plan, you can reach out directly to your dedicated account manager via Slack or your priority support channel.</p>
        </div>
      </div>
    </MarketingStubPage>
  );
}
