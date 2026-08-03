import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trust & Safety",
  description:
    "Learn how Castway keeps the platform safe — our community guidelines, moderation policies, and reporting processes.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const PRINCIPLES = [
  {
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: "Verified Identities",
    description:
      "We verify creator and brand identities to prevent impersonation, fake profiles, and fraudulent activity.",
  },
  {
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
    title: "Transparent Moderation",
    description:
      "Every moderation decision is reviewable. We explain our actions and provide an appeals process.",
  },
  {
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
    title: "Proactive Detection",
    description:
      "Automated systems monitor for policy violations, spam, and suspicious behavior 24/7.",
  },
  {
    icon: (
      <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: "Secure Payments",
    description:
      "Escrow-based payments protect both creators and brands — funds release only when work is approved.",
  },
];

const GUIDELINES = [
  {
    title: "Be Authentic",
    description:
      "Represent yourself honestly. Do not inflate audience metrics, fabricate credentials, or misrepresent your work history.",
  },
  {
    title: "Be Respectful",
    description:
      "Treat everyone with dignity. Harassment, hate speech, discrimination, and bullying are strictly prohibited.",
  },
  {
    title: "Be Professional",
    description:
      "Honor commitments. Deliver work on time, communicate proactively, and resolve disagreements constructively.",
  },
  {
    title: "Protect Privacy",
    description:
      "Do not share private conversations, personal data, or confidential campaign details without consent.",
  },
  {
    title: "No Spam or Scams",
    description:
      "Do not send unsolicited messages, use bots, or engage in phishing, pyramid schemes, or deceptive practices.",
  },
  {
    title: "Respect Intellectual Property",
    description:
      "Only upload content you own or have permission to use. Do not copy or plagiarize other creators' work.",
  },
];

const REPORTING_STEPS = [
  {
    step: "1",
    title: "Report",
    description:
      "Click the ⋯ menu on any profile, post, or message and select \"Report.\" Choose the category that best describes the issue.",
  },
  {
    step: "2",
    title: "Review",
    description:
      "Our Trust & Safety team reviews every report — typically within 24 hours. We may follow up with you for additional context.",
  },
  {
    step: "3",
    title: "Action",
    description:
      "If a violation is confirmed, we take appropriate action — from warnings and content removal to temporary or permanent account suspension.",
  },
  {
    step: "4",
    title: "Appeal",
    description:
      "If you disagree with a moderation decision, you can file an appeal. Appeals are reviewed by a different team member for fairness.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TrustSafetyPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Safety
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Trust & Safety
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              A professional, respectful, and secure environment for every
              creator, brand, and agency on Castway.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Our Safety Principles
        </h2>
        <p className="mt-2 text-muted-foreground">
          The foundations of a trustworthy platform.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                {p.icon}
              </div>
              <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Community Guidelines
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            These guidelines apply to all users — creators, brands, and
            agencies. Violations may result in content removal, account
            restrictions, or permanent bans.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
            {GUIDELINES.map((g) => (
              <div
                key={g.title}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
              >
                <h3 className="font-semibold tracking-tight">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {g.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reporting Process */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          How Reporting Works
        </h2>
        <p className="mt-2 text-muted-foreground">
          See something that shouldn&apos;t be here? Here&apos;s what happens
          when you report it.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl">
          {REPORTING_STEPS.map((s) => (
            <div key={s.step} className="relative">
              {/* Connector line (hidden on last) */}
              <div className="absolute left-[1.125rem] top-12 hidden h-[calc(100%-3rem)] w-px bg-border/60 lg:block" />

              <div className="flex items-start gap-4 lg:flex-col lg:items-start">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Questions or concerns?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Our Trust & Safety team is available to help. Reach out and
            we&apos;ll respond within 24 hours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="mailto:safety@castway.com"
              className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black/90 hover:shadow dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              Contact Trust & Safety
            </a>
            <Link
              href="/help"
              className="inline-flex items-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              Help Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
