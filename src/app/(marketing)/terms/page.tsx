import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions that govern your use of the Castway platform — for creators, brands, and agencies.",
};

const EFFECTIVE_DATE = "August 1, 2026";

/* ------------------------------------------------------------------ */
/*  Section helper                                                     */
/* ------------------------------------------------------------------ */

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-24" id={`section-${number}`}>
      <h2 className="flex items-baseline gap-3 font-heading text-lg font-bold tracking-tight sm:text-xl">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 pl-10 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TermsPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Legal
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Terms of Service
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              These terms govern your use of Castway. Please read them carefully
              before creating an account.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Effective date: {EFFECTIVE_DATE}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-8 space-y-12">
        <Section number="1" title="Acceptance of Terms">
          <p>
            By accessing or using the Castway platform (&quot;Service&quot;),
            you agree to be bound by these Terms of Service
            (&quot;Terms&quot;). If you do not agree to these Terms, do not
            use the Service. These Terms constitute a legally binding
            agreement between you and Castway Inc. (&quot;Castway,&quot;
            &quot;we,&quot; &quot;our&quot;).
          </p>
          <p>
            We may modify these Terms at any time. Material changes will be
            communicated via email or in-app notification. Your continued use
            of the Service after changes take effect constitutes acceptance.
          </p>
        </Section>

        <Section number="2" title="Eligibility">
          <p>
            You must be at least 16 years old and legally able to enter
            contracts to use Castway. If you are using the platform on behalf
            of an organization (e.g., a brand or agency), you represent that
            you have the authority to bind that organization to these Terms.
          </p>
        </Section>

        <Section number="3" title="Account Registration">
          <p>
            To access most features, you must create an account. You agree to
            provide accurate, current, and complete information during
            registration and to keep your account details up to date.
          </p>
          <p>
            You are responsible for safeguarding your account credentials and
            for all activity that occurs under your account. Notify us
            immediately at{" "}
            <a
              href="mailto:security@castway.com"
              className="text-primary hover:underline"
            >
              security@castway.com
            </a>{" "}
            if you suspect unauthorized access.
          </p>
        </Section>

        <Section number="4" title="User Roles">
          <p>
            Castway supports multiple user roles — <strong>Creators</strong>,{" "}
            <strong>Brands</strong>, and <strong>Agencies</strong>. Each role
            has specific capabilities:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Creators</strong> can build profiles, browse
              opportunities, submit proposals, and receive payments for
              completed work.
            </li>
            <li>
              <strong>Brands</strong> can post campaigns, discover and connect
              with creators, manage proposals, and process payments.
            </li>
            <li>
              <strong>Agencies</strong> can manage creator rosters, respond to
              campaigns on behalf of their talent, and access team analytics.
            </li>
          </ul>
        </Section>

        <Section number="5" title="Content & Intellectual Property">
          <p>
            You retain ownership of all content you create and upload to
            Castway (&quot;User Content&quot;). By uploading, you grant
            Castway a non-exclusive, worldwide, royalty-free license to host,
            display, distribute, and reproduce your User Content solely for
            the purpose of operating and improving the Service.
          </p>
          <p>
            You represent that you have the right to share all content you
            upload and that it does not infringe any third-party rights. We
            reserve the right to remove content that violates these Terms or
            our Community Guidelines.
          </p>
          <p>
            The Castway name, logo, and all related marks are trademarks of
            Castway Inc. You may not use them without prior written consent.
          </p>
        </Section>

        <Section number="6" title="Prohibited Conduct">
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              Misrepresent your identity, audience metrics, or professional
              qualifications
            </li>
            <li>
              Use the platform to harass, spam, or engage in fraudulent
              activity
            </li>
            <li>
              Circumvent platform fees or payment processes
            </li>
            <li>
              Scrape, crawl, or use automated means to access the Service
              without written permission
            </li>
            <li>
              Upload malicious code, viruses, or any material designed to
              disrupt the Service
            </li>
            <li>
              Violate any applicable law or regulation
            </li>
          </ul>
          <p>
            Violation of these rules may result in account suspension or
            termination at our sole discretion.
          </p>
        </Section>

        <Section number="7" title="Payments & Fees">
          <p>
            Castway may charge service fees for certain transactions,
            including brand campaigns and premium features. Fees are disclosed
            before you commit to a transaction.
          </p>
          <p>
            For brand campaigns, payments are processed through our secure
            escrow system. Funds are held until deliverables are approved,
            then released to the creator&apos;s payout method within 3–5
            business days. Refund and dispute policies are outlined in our
            Payment Terms.
          </p>
        </Section>

        <Section number="8" title="Termination">
          <p>
            You may delete your account at any time from Settings → Account →
            Delete Account. We may suspend or terminate your account if you
            violate these Terms, engage in prohibited conduct, or at our
            discretion with reasonable notice.
          </p>
          <p>
            Upon termination, your right to use the Service ceases
            immediately. Sections that by their nature should survive
            termination (e.g., IP ownership, limitation of liability) will
            remain in effect.
          </p>
        </Section>

        <Section number="9" title="Disclaimers">
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
            AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
            IMPLIED. CASTWAY DOES NOT GUARANTEE UNINTERRUPTED ACCESS,
            ERROR-FREE OPERATION, OR SPECIFIC RESULTS FROM USING THE
            PLATFORM.
          </p>
          <p>
            Castway is a marketplace platform. We do not guarantee any
            particular outcomes from creator-brand collaborations, including
            engagement rates, sales, or campaign success.
          </p>
        </Section>

        <Section number="10" title="Limitation of Liability">
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, CASTWAY&apos;S TOTAL
            LIABILITY FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SERVICE
            SHALL NOT EXCEED THE AMOUNT YOU PAID TO CASTWAY IN THE 12 MONTHS
            PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
          </p>
          <p>
            CASTWAY SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
            CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST
            DATA, OR BUSINESS INTERRUPTION.
          </p>
        </Section>

        <Section number="11" title="Dispute Resolution">
          <p>
            Any dispute arising from these Terms or the Service shall be
            resolved through binding arbitration administered by the American
            Arbitration Association (AAA) under its Consumer Arbitration
            Rules. Arbitration will take place in San Francisco, CA, unless
            you and Castway agree otherwise.
          </p>
          <p>
            You agree to resolve disputes on an individual basis. Class
            actions and class arbitrations are not permitted.
          </p>
        </Section>

        <Section number="12" title="Governing Law">
          <p>
            These Terms are governed by the laws of the State of California,
            without regard to conflict of law principles.
          </p>
        </Section>

        <Section number="13" title="Contact">
          <p>
            Questions about these Terms? Contact us:
          </p>
          <ul className="space-y-1">
            <li>
              Email:{" "}
              <a
                href="mailto:legal@castway.com"
                className="text-primary hover:underline"
              >
                legal@castway.com
              </a>
            </li>
            <li>
              Mail: Castway Inc., 548 Market St, Suite 36879, San Francisco, CA
              94104
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
