import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights, strategies, and stories from the Castway creator economy — tips for creators, brands, and agencies.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const FEATURED = {
  tag: "Featured",
  title: "The State of the Creator Economy in 2026",
  excerpt:
    "From micro-influencers to enterprise partnerships — a deep dive into the trends shaping how creators and brands collaborate this year.",
  author: "Castway Editorial",
  date: "Jul 28, 2026",
  readTime: "12 min read",
};

const POSTS = [
  {
    tag: "Creator Tips",
    title: "5 Mistakes Creators Make When Pricing Brand Deals",
    excerpt:
      "Under-pricing kills careers. Over-pricing kills momentum. Here's how to find the sweet spot every time.",
    author: "Priya Sharma",
    date: "Jul 22, 2026",
    readTime: "6 min read",
  },
  {
    tag: "Brand Strategy",
    title: "Why Nano-Creators Outperform Mega-Influencers on ROI",
    excerpt:
      "New data reveals that creators with 5K–50K followers drive 3.2× more engagement per dollar spent.",
    author: "Marcus Chen",
    date: "Jul 18, 2026",
    readTime: "8 min read",
  },
  {
    tag: "Product Update",
    title: "Introducing Campaign Analytics 2.0",
    excerpt:
      "Real-time dashboards, attribution tracking, and exportable reports — all in one place.",
    author: "Castway Team",
    date: "Jul 14, 2026",
    readTime: "4 min read",
  },
  {
    tag: "Agency Playbook",
    title: "How Top Agencies Scale Creator Campaigns to 100+ Partners",
    excerpt:
      "A behind-the-scenes look at the workflows, tools, and processes agencies use to manage massive rosters.",
    author: "Elena Vasquez",
    date: "Jul 10, 2026",
    readTime: "9 min read",
  },
  {
    tag: "Creator Tips",
    title: "Building a Media Kit That Actually Gets Responses",
    excerpt:
      "Your media kit is your first impression. Make it count with these proven layout and content strategies.",
    author: "Jordan Lee",
    date: "Jul 6, 2026",
    readTime: "7 min read",
  },
  {
    tag: "Industry Trends",
    title: "The Rise of Creator-Led Brands: What It Means for You",
    excerpt:
      "More creators are launching their own product lines. Here's how to position yourself for this shift.",
    author: "Aisha Patel",
    date: "Jul 2, 2026",
    readTime: "10 min read",
  },
];

const CATEGORIES = [
  "All",
  "Creator Tips",
  "Brand Strategy",
  "Agency Playbook",
  "Product Update",
  "Industry Trends",
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BlogPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Blog
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Insights & Stories
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Tips, trends, and deep dives from the creator economy — written for
              creators, brands, and agencies.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <div className="group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm transition-all hover:shadow-lg cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative p-8 sm:p-12 md:p-16">
            <span className="inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              {FEATURED.tag}
            </span>
            <h2 className="mt-5 font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl group-hover:text-primary transition-colors">
              {FEATURED.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {FEATURED.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground/80">{FEATURED.author}</span>
              <span className="text-border">·</span>
              <span>{FEATURED.date}</span>
              <span className="text-border">·</span>
              <span>{FEATURED.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 pt-12 md:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  i === 0
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post) => (
            <article
              key={post.title}
              className="group flex flex-col rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:border-primary/30 hover:shadow-md cursor-pointer"
            >
              {/* Gradient strip */}
              <div className="h-1.5 rounded-t-2xl bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />

              <div className="flex flex-1 flex-col p-6">
                <span className="self-start rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {post.tag}
                </span>
                <h3 className="mt-3 font-semibold tracking-tight leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/70">{post.author}</span>
                  <span className="text-border">·</span>
                  <span>{post.date}</span>
                  <span className="text-border">·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 flex justify-center">
          <button className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
            Load more articles
          </button>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="border-t border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Stay in the loop
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Get the latest creator economy insights delivered to your inbox every
            week. No spam, unsubscribe anytime.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="flex w-full max-w-sm gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                className="h-10 flex-1 rounded-full border border-border bg-card px-4 text-sm shadow-sm placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button className="inline-flex items-center rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black/90 hover:shadow dark:bg-white dark:text-black dark:hover:bg-white/90">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
