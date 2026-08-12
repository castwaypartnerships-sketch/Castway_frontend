import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Security",
  description: "How Castway protects your data and your account.",
};

export default function SecurityPage() {
  return (
    <MarketingStubPage
      eyebrow="Legal"
      title="Security"
      description="Protecting your data is a baseline requirement, not an afterthought."
    >

      <div className="space-y-6 mt-8">
        <p className="text-lg">Security is fundamental to our platform. We employ industry-standard measures to keep your data and transactions safe.</p>
        
        <div className="space-y-8 mt-8">
          <div>
            <h3 className="text-xl font-bold mb-2">Data Encryption</h3>
            <p className="text-muted-foreground">All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Our database volumes, backups, and replicas are fully encrypted.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
            <p className="text-muted-foreground">We do not store credit card numbers on our servers. All payments are securely processed by Stripe, a certified PCI Service Provider Level 1.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Access Control</h3>
            <p className="text-muted-foreground">We enforce strict role-based access control (RBAC). Your private data, messages, and draft campaigns are strictly siloed and only accessible by authorized users within your organization.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">Vulnerability Disclosure</h3>
            <p className="text-muted-foreground">If you are a security researcher and have found a vulnerability, please responsibly disclose it to <a href="mailto:security@castway.com" className="text-primary hover:underline">security@castway.com</a>.</p>
          </div>
        </div>
      </div>
    </MarketingStubPage>
  );
}
