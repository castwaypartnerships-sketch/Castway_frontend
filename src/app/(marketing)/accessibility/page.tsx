import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Castway's commitment to an accessible experience for everyone.",
};

export default function AccessibilityPage() {
  return (
    <MarketingStubPage
      eyebrow="Legal"
      title="Accessibility"
      description="We're working toward an experience that works for everyone, regardless of ability."
    >

      <div className="space-y-6 mt-8">
        <p className="text-lg">Castway is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards.</p>
        
        <h3 className="text-xl font-bold mt-6 mb-2">Conformance Status</h3>
        <p className="text-muted-foreground">
          The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. 
          Castway is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard yet.
        </p>
        
        <h3 className="text-xl font-bold mt-6 mb-2">Feedback</h3>
        <p className="text-muted-foreground">
          We welcome your feedback on the accessibility of Castway. Please let us know if you encounter accessibility barriers:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
          <li>Email: <a href="mailto:accessibility@castway.com" className="text-primary hover:underline">accessibility@castway.com</a></li>
        </ul>
        <p className="text-muted-foreground mt-4">We try to respond to feedback within 2 business days.</p>
      </div>
    </MarketingStubPage>
  );
}
