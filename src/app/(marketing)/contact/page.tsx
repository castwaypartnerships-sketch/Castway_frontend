import type { Metadata } from "next";
import Link from "next/link";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Castway team.",
};

export default function ContactPage() {
  return (
    <MarketingStubPage
      eyebrow="Company"
      title="Contact Us"
      description="We're a small team and read everything that comes in."
    >

      <div className="space-y-8 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-3">General Inquiries</h3>
            <p className="text-muted-foreground mb-4">For press, partnerships, and general questions about Castway.</p>
            <a href="mailto:hello@castway.com" className="font-medium text-primary hover:underline">hello@castway.com</a>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Support</h3>
            <p className="text-muted-foreground mb-4">Having trouble with your account or a campaign? We're here to help.</p>
            <a href="mailto:support@castway.com" className="font-medium text-primary hover:underline">support@castway.com</a>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Enterprise Sales</h3>
            <p className="text-muted-foreground mb-4">Interested in custom solutions for large agencies or brands?</p>
            <a href="mailto:sales@castway.com" className="font-medium text-primary hover:underline">sales@castway.com</a>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Mailing Address</h3>
            <p className="text-muted-foreground">Castway Inc.<br/>548 Market St, Suite 36879<br/>San Francisco, CA 94104</p>
          </div>
        </div>
      </div>
    </MarketingStubPage>
  );
}
