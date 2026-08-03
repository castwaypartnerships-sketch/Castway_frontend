import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Understand how Castway uses cookies and similar tracking technologies to improve your experience.",
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

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              How we use cookies and similar technologies to deliver, improve,
              and personalize Castway.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Effective date: {EFFECTIVE_DATE}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-8 space-y-12">
        <Section number="1" title="What Are Cookies?">
          <p>
            Cookies are small text files placed on your device when you visit a
            website. They help websites remember your preferences, understand
            how you use the service, and improve your overall experience.
            Similar technologies include web beacons, pixels, and local
            storage.
          </p>
        </Section>

        <Section number="2" title="Types of Cookies We Use">
          <p>We use the following categories of cookies:</p>

          {/* Cookie table */}
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/50">
                  <th className="px-4 py-3 font-semibold text-foreground">Category</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Purpose</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground">Essential</td>
                  <td className="px-4 py-3">
                    Required for the platform to function — authentication,
                    security, and session management.
                  </td>
                  <td className="px-4 py-3">Session — 1 year</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground">Functional</td>
                  <td className="px-4 py-3">
                    Remember your preferences (theme, language, layout) to
                    enhance usability.
                  </td>
                  <td className="px-4 py-3">1 year</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground">Analytics</td>
                  <td className="px-4 py-3">
                    Understand how users interact with Castway — page visits,
                    feature usage, and performance metrics.
                  </td>
                  <td className="px-4 py-3">Up to 2 years</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-foreground">Marketing</td>
                  <td className="px-4 py-3">
                    Deliver relevant ads and measure campaign effectiveness
                    across platforms.
                  </td>
                  <td className="px-4 py-3">Up to 2 years</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section number="3" title="Third-Party Cookies">
          <p>
            Some cookies are set by third-party services we use for analytics,
            advertising, and platform functionality. These include:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Google Analytics</strong> — aggregated usage statistics
            </li>
            <li>
              <strong>Stripe</strong> — secure payment processing
            </li>
            <li>
              <strong>Intercom</strong> — customer support chat
            </li>
            <li>
              <strong>Meta Pixel</strong> — advertising measurement (optional)
            </li>
          </ul>
          <p>
            Each third-party provider has its own privacy and cookie policy.
            We recommend reviewing them for full transparency.
          </p>
        </Section>

        <Section number="4" title="Managing Your Cookie Preferences">
          <p>
            You have several options for controlling cookies:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Browser settings:</strong> Most browsers allow you to
              block or delete cookies. Check your browser&apos;s help menu for
              instructions.
            </li>
            <li>
              <strong>Cookie consent banner:</strong> When you first visit
              Castway, you can accept or customize cookie categories via our
              consent banner.
            </li>
            <li>
              <strong>Opt-out links:</strong> For analytics, visit the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Analytics Opt-out Browser Add-on
              </a>
              .
            </li>
          </ul>
          <p>
            Note: Disabling essential cookies may prevent you from using core
            platform features like login and messaging.
          </p>
        </Section>

        <Section number="5" title="Do Not Track">
          <p>
            Some browsers offer a &quot;Do Not Track&quot; (DNT) signal. There
            is currently no industry standard for how websites should respond
            to DNT signals. Castway does not currently respond to DNT signals
            but respects your cookie preferences as set via our consent banner.
          </p>
        </Section>

        <Section number="6" title="Updates to This Policy">
          <p>
            We may update this Cookie Policy periodically to reflect changes
            in our practices or for legal, operational, or regulatory reasons.
            The &quot;Effective date&quot; at the top indicates the latest
            revision.
          </p>
        </Section>

        <Section number="7" title="Contact Us">
          <p>
            If you have questions about our use of cookies, please contact us:
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
