import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: "The standards that keep Castway safe, respectful, and productive.",
};

export default function CommunityGuidelinesPage() {
  return (
    <MarketingStubPage
      eyebrow="Resources"
      title="Community Guidelines"
      description="We're finalizing our published guidelines. In short: be honest, be respectful, and don't misrepresent your work."
      >

      <div className="space-y-6 mt-8">
        <p className="text-lg text-muted-foreground">Castway is a professional network. We expect all users—creators, brands, and agencies—to maintain a respectful, safe, and professional environment.</p>
        
        <div className="space-y-6 mt-8">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-bold text-lg">1. Professionalism & Respect</h3>
            <p className="mt-2 text-muted-foreground">Treat all members with respect. Harassment, discrimination, hate speech, and abusive language will not be tolerated and will result in immediate account termination.</p>
          </div>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-bold text-lg">2. Authenticity</h3>
            <p className="mt-2 text-muted-foreground">Do not misrepresent your identity, your brand, or your audience metrics. Fake accounts, inflated stats, and impersonation undermine trust in the ecosystem.</p>
          </div>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-bold text-lg">3. Spam & Soliciation</h3>
            <p className="mt-2 text-muted-foreground">Avoid sending unsolicited bulk messages, irrelevant mass proposals, or using automated scripts to contact users. Keep outreach targeted and relevant.</p>
          </div>
          
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-bold text-lg">4. Honor Commitments</h3>
            <p className="mt-2 text-muted-foreground">If you agree to a campaign, deliver the work as promised. If you are a brand, process payments promptly upon approval. Chronic unreliability harms the entire community.</p>
          </div>
        </div>
      </div>
    </MarketingStubPage>
  );
}
