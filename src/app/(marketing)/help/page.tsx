import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Get answers to your questions about Castway — account setup, billing, campaigns, and more. Browse FAQs or contact our support team.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const HELP_CATEGORIES = [
  {
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    title: "Account & Profile",
    description: "Sign up, profile setup, verification, and account settings.",
    articles: 14,
  },
  {
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
    title: "Billing & Payments",
    description: "Subscription plans, invoicing, payment methods, and refunds.",
    articles: 9,
  },
  {
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Campaigns & Opportunities",
    description: "Creating, managing, and tracking brand campaigns.",
    articles: 18,
  },
  {
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v4.519Z" />
      </svg>
    ),
    title: "Messaging & Connections",
    description: "Connecting with creators/brands, messaging, and proposals.",
    articles: 11,
  },
  {
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: "Privacy & Security",
    description: "Data protection, two-factor auth, and content ownership.",
    articles: 8,
  },
  {
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.048.58.024 1.194-.14 1.743" />
      </svg>
    ),
    title: "Integrations & API",
    description: "Connect third-party tools, webhooks, and developer API.",
    articles: 6,
  },
];

const POPULAR_QUESTIONS = [
  {
    q: "How do I verify my creator profile?",
    a: "Navigate to Settings → Profile → Verification. Upload a government-issued ID and we'll review within 24–48 hours. Verified profiles see up to 40% more brand inquiries.",
  },
  {
    q: "Can I use Castway for free?",
    a: "Yes — Castway offers a free tier that includes a full profile, up to 5 active applications per month, and messaging. Upgrade to Pro for unlimited applications, advanced analytics, and priority support.",
  },
  {
    q: "How do payments work for brand campaigns?",
    a: "Payments are held in escrow when a brand approves your proposal. Once deliverables are submitted and approved, funds are released to your connected payout method within 3–5 business days.",
  },
  {
    q: "How do I report inappropriate content or behavior?",
    a: 'Click the ⋯ menu on any profile, post, or message and select "Report." Our Trust & Safety team reviews every report within 24 hours and takes action per our community guidelines.',
  },
  {
    q: "Can agencies manage multiple creators on one account?",
    a: "Yes — agency accounts support unlimited team members and creator roster management. Each creator maintains their own profile while the agency handles outreach, contracts, and analytics.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HelpPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Support
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Help Center
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Find answers, explore guides, or get in touch with our team — we&apos;re
              here to help you succeed.
            </p>

            {/* Search */}
            <div className="mt-10 flex justify-center">
              <div className="relative w-full max-w-md">
                <svg
                  className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Describe your issue..."
                  className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Browse Topics
        </h2>
        <p className="mt-2 text-muted-foreground">
          Select a category to find relevant articles and guides.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md cursor-pointer"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                {cat.icon}
              </div>
              <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors">
                {cat.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {cat.description}
              </p>
              <p className="mt-3 text-xs font-medium text-primary">
                {cat.articles} articles →
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-muted-foreground">
            Quick answers to the most common questions.
          </p>

          <div className="mt-10 space-y-4 max-w-3xl">
            {POPULAR_QUESTIONS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border/60 bg-card shadow-sm transition-all open:shadow-md"
              >
                <summary className="flex cursor-pointer items-center justify-between p-5 text-sm font-semibold tracking-tight list-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="border-t border-border/40 px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Still need help?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Our support team typically responds within a few hours during
              business days.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="mailto:support@castway.com"
                className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black/90 hover:shadow dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                Email Support
              </a>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                Browse Guides
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
