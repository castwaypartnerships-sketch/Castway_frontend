import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about Castway.",
};

export default function FaqsPage() {
  return (
    <MarketingStubPage
      eyebrow="Resources"
      title="FAQs"
      description="A dedicated FAQ page is coming. Most common questions are already answered in the Help Center."
      >

      <div className="space-y-8 mt-8">
        <div>
          <h3 className="text-xl font-bold mb-2">How do I create an account?</h3>
          <p className="text-muted-foreground">Click the "Sign Up" button in the top right corner and follow the prompts. You can sign up as a creator, agency, or brand.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Is Castway free to use?</h3>
          <p className="text-muted-foreground">Creating a profile is completely free. We charge a small service fee only when you successfully land paid opportunities through the platform.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">How do payments work?</h3>
          <p className="text-muted-foreground">All payments are held securely in escrow once a contract is signed and released automatically upon successful delivery of the agreed-upon work.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Can agencies manage multiple talent profiles?</h3>
          <p className="text-muted-foreground">Yes! Our agency plan allows you to seamlessly switch between your roster's profiles and handle campaigns on their behalf.</p>
        </div>
      </div>
    </MarketingStubPage>
  );
}
