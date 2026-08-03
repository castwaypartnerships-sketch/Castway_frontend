import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guides & Docs",
  description:
    "Learn everything about Castway — from setting up your creator profile to managing brand campaigns. Explore our guides, tutorials, and API documentation.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const GETTING_STARTED = [
  {
    title: "Create Your Profile",
    description:
      "Set up a compelling creator profile in under 5 minutes — add your portfolio, social links, and rates.",
    icon: "👤",
    href: "#",
  },
  {
    title: "Find Opportunities",
    description:
      "Browse brand campaigns, casting calls, and freelance gigs curated for your niche and audience size.",
    icon: "🔍",
    href: "#",
  },
  {
    title: "Submit Proposals",
    description:
      "Craft winning proposals with our guided template — include deliverables, timelines, and pricing.",
    icon: "📝",
    href: "#",
  },
  {
    title: "Manage Connections",
    description:
      "Build lasting professional relationships with brands, agencies, and fellow creators.",
    icon: "🤝",
    href: "#",
  },
];

const CATEGORIES = [
  {
    title: "For Creators",
    description:
      "Profile setup, portfolio tips, pricing strategies, and how to stand out to brands.",
    count: 24,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "For Brands",
    description:
      "Campaign creation, creator discovery, roster management, and measuring ROI.",
    count: 18,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "For Agencies",
    description:
      "Multi-client management, team workflows, talent pipelines, and reporting.",
    count: 12,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    title: "Platform & API",
    description:
      "Integrations, webhooks, REST API reference, and developer guides.",
    count: 15,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

const POPULAR_GUIDES = [
  {
    title: "The Complete Creator Onboarding Guide",
    readTime: "8 min read",
    tag: "Getting Started",
  },
  {
    title: "How to Price Your Content Packages",
    readTime: "6 min read",
    tag: "Monetization",
  },
  {
    title: "Building a Media Kit That Converts",
    readTime: "10 min read",
    tag: "Profile",
  },
  {
    title: "Understanding Campaign Analytics",
    readTime: "5 min read",
    tag: "Analytics",
  },
  {
    title: "Setting Up Brand Safety Filters",
    readTime: "4 min read",
    tag: "Brands",
  },
  {
    title: "Managing Your Creator Roster",
    readTime: "7 min read",
    tag: "Agencies",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function GuidesPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Documentation
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Guides & Docs
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Everything you need to build your presence, land opportunities, and
              grow your creator business on Castway.
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
                  placeholder="Search documentation..."
                  className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Getting Started
        </h2>
        <p className="mt-2 text-muted-foreground">
          New to Castway? Start here — four steps to your first opportunity.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GETTING_STARTED.map((item, i) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <span className="absolute -top-px left-6 h-px w-12 bg-gradient-to-r from-primary/60 to-transparent" />
              <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-muted text-xl">
                {item.icon}
              </div>
              <div className="mb-1 flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Browse by Category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Dive into the topic that matters most to you.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="group flex items-start gap-5 rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md cursor-pointer"
              >
                <div className="flex-1">
                  <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${cat.color}`}
                >
                  {cat.count} articles
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Popular Guides
        </h2>
        <p className="mt-2 text-muted-foreground">
          Most-read articles by the Castway community this month.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_GUIDES.map((guide) => (
            <div
              key={guide.title}
              className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md cursor-pointer"
            >
              <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {guide.tag}
              </span>
              <h3 className="mt-3 font-semibold tracking-tight leading-snug group-hover:text-primary transition-colors">
                {guide.title}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground">
                {guide.readTime}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Can&apos;t find what you need?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Our support team is here to help. Reach out and we&apos;ll get back
            to you within 24 hours.
          </p>
          <Link
            href="/help"
            className="mt-8 inline-flex items-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black/90 hover:shadow dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Visit Help Center
          </Link>
        </div>
      </section>
    </div>
  );
}
