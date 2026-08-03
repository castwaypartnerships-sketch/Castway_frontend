import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Castway collects, uses, and protects your personal information. Read our full privacy policy.",
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

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Your trust matters. This policy explains how we collect, use, and
              safeguard your information.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Effective date: {EFFECTIVE_DATE}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-8 space-y-12">
        <Section number="1" title="Information We Collect">
          <p>
            When you create a Castway account, we collect information you
            provide directly — including your name, email address, profile
            photo, professional bio, social media handles, portfolio links, and
            any media you upload to your media kit.
          </p>
          <p>
            We also collect usage data automatically, such as your IP address,
            browser type, device information, pages visited, features used, and
            timestamps. This data helps us improve the platform and
            personalize your experience.
          </p>
          <p>
            If you connect a third-party service (e.g., YouTube, Instagram,
            TikTok), we may receive publicly available audience metrics and
            content performance data to enhance your creator profile.
          </p>
        </Section>

        <Section number="2" title="How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Operate, maintain, and improve the Castway platform</li>
            <li>Match creators with relevant brand opportunities</li>
            <li>Process payments and manage billing</li>
            <li>Send transactional notifications (e.g., messages, proposals)</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Analyze aggregate usage trends and platform performance</li>
            <li>Detect and prevent fraud, abuse, and policy violations</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>
            We do not sell your personal information to third parties. We may
            share aggregated, de-identified data for research and analytics
            purposes.
          </p>
        </Section>

        <Section number="3" title="Information Sharing & Disclosure">
          <p>
            We may share your information with trusted service providers who
            assist us in operating the platform — including hosting, payment
            processing, email delivery, and analytics. These providers are
            contractually obligated to handle your data securely and only for
            the purposes we specify.
          </p>
          <p>
            Your public profile information (name, bio, portfolio, and
            audience metrics) is visible to other Castway users, including
            brands and agencies searching for talent. You can control profile
            visibility in your account settings.
          </p>
          <p>
            We may disclose information if required by law, subpoena, or court
            order, or if we reasonably believe disclosure is necessary to
            protect the rights, property, or safety of Castway, our users, or
            the public.
          </p>
        </Section>

        <Section number="4" title="Data Security">
          <p>
            We implement industry-standard technical and organizational
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction. These include
            encryption in transit (TLS 1.3), encryption at rest, access
            controls, and regular security audits.
          </p>
          <p>
            While we strive to protect your data, no method of electronic
            transmission or storage is 100% secure. We encourage you to use a
            strong, unique password and enable two-factor authentication on
            your account.
          </p>
        </Section>

        <Section number="5" title="Your Rights & Choices">
          <p>
            Depending on your jurisdiction, you may have the right to:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate or incomplete data</li>
            <li>Request deletion of your personal information</li>
            <li>Object to or restrict certain processing activities</li>
            <li>Withdraw consent where processing is based on consent</li>
            <li>Port your data to another service in a structured format</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:privacy@castway.com"
              className="text-primary hover:underline"
            >
              privacy@castway.com
            </a>
            . We will respond within 30 days.
          </p>
        </Section>

        <Section number="6" title="Data Retention">
          <p>
            We retain your personal information for as long as your account is
            active or as needed to provide services. If you delete your
            account, we will remove your personal data within 30 days, except
            where retention is required for legal, accounting, or fraud
            prevention purposes.
          </p>
          <p>
            Aggregated, anonymized data may be retained indefinitely for
            analytics and platform improvement.
          </p>
        </Section>

        <Section number="7" title="International Transfers">
          <p>
            Castway is headquartered in the United States. If you are
            accessing the platform from outside the U.S., your information may
            be transferred to, stored, and processed in the U.S. or other
            countries where our service providers operate. We ensure
            appropriate safeguards are in place, including Standard
            Contractual Clauses where applicable.
          </p>
        </Section>

        <Section number="8" title="Children's Privacy">
          <p>
            Castway is not intended for individuals under 16 years of age. We
            do not knowingly collect personal information from children. If we
            learn that we have collected data from a child under 16, we will
            promptly delete it.
          </p>
        </Section>

        <Section number="9" title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will
            notify you of material changes by posting a notice on the platform
            or sending you an email. Your continued use of Castway after
            changes become effective constitutes acceptance of the updated
            policy.
          </p>
        </Section>

        <Section number="10" title="Contact Us">
          <p>
            If you have questions or concerns about this Privacy Policy, please
            contact us:
          </p>
          <ul className="space-y-1">
            <li>
              Email:{" "}
              <a
                href="mailto:privacy@castway.com"
                className="text-primary hover:underline"
              >
                privacy@castway.com
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
