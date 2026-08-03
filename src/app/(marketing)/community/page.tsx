import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creator Community",
  description:
    "Join the Castway creator community — connect with fellow creators, attend events, share wins, and grow together.",
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const COMMUNITY_PILLARS = [
  {
    emoji: "💬",
    title: "Discussion Forums",
    description:
      "Share strategies, ask questions, and get feedback from creators at every stage of their journey.",
  },
  {
    emoji: "🎯",
    title: "Niche Groups",
    description:
      "Find your people — join groups for tech reviewers, lifestyle creators, podcasters, and more.",
  },
  {
    emoji: "🎤",
    title: "Live Events",
    description:
      "Monthly AMAs, workshops, and networking sessions with top creators and industry leaders.",
  },
  {
    emoji: "🏆",
    title: "Creator Spotlights",
    description:
      "Get featured for your achievements — from landing your first brand deal to hitting milestones.",
  },
];

const UPCOMING_EVENTS = [
  {
    title: "Creator Economy AMA: Pricing Strategies",
    date: "Aug 14, 2026",
    time: "2:00 PM EST",
    type: "Live AMA",
    typeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Workshop: Building a Portfolio That Converts",
    date: "Aug 21, 2026",
    time: "1:00 PM EST",
    type: "Workshop",
    typeColor: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    title: "Castway Community Mixer — August Edition",
    date: "Aug 28, 2026",
    time: "6:00 PM EST",
    type: "Networking",
    typeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
];

const STATS = [
  { value: "50K+", label: "Community Members" },
  { value: "120+", label: "Niche Groups" },
  { value: "24", label: "Events This Year" },
  { value: "4.9★", label: "Avg. Event Rating" },
];

const FEATURED_CREATORS = [
  {
    name: "Ava Mitchell",
    handle: "@avamitchell",
    niche: "Tech & SaaS Reviews",
    achievement: "Landed 12 brand deals in 3 months",
  },
  {
    name: "Carlos Reyes",
    handle: "@carlosreyes",
    niche: "Fitness & Wellness",
    achievement: "Grew audience from 2K to 45K on Castway",
  },
  {
    name: "Fatima Al-Rashid",
    handle: "@fatimar",
    niche: "Finance & Investing",
    achievement: "Top-rated proposal writer — 92% acceptance rate",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CommunityPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Community
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Creator Community
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Connect, learn, and grow with thousands of creators, freelancers,
              and industry professionals building the future of work.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black/90 hover:shadow dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                Join the Community
              </Link>
              <a
                href="#events"
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                View Events
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          What&apos;s Inside
        </h2>
        <p className="mt-2 text-muted-foreground">
          Everything you need to connect and level up.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {COMMUNITY_PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <span className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted text-2xl">
                {pillar.emoji}
              </span>
              <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section
        id="events"
        className="scroll-mt-20 border-t border-border/40 bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Upcoming Events
          </h2>
          <p className="mt-2 text-muted-foreground">
            Live sessions, workshops, and mixers — all free for Castway members.
          </p>

          <div className="mt-10 space-y-4 max-w-3xl">
            {UPCOMING_EVENTS.map((event) => (
              <div
                key={event.title}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${event.typeColor}`}
                    >
                      {event.type}
                    </span>
                  </div>
                  <h3 className="font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.date} · {event.time}
                  </p>
                </div>
                <button className="shrink-0 self-start rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:self-center">
                  RSVP
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Creators */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Creator Spotlights
        </h2>
        <p className="mt-2 text-muted-foreground">
          Celebrating community members who are crushing it.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {FEATURED_CREATORS.map((creator) => (
            <div
              key={creator.handle}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              {/* Avatar placeholder */}
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold text-primary">
                {creator.name[0]}
              </div>
              <h3 className="font-semibold tracking-tight">
                {creator.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {creator.handle}
              </p>
              <span className="mt-2 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {creator.niche}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-primary font-medium">
                🎉 {creator.achievement}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Join CTA */}
      <section className="border-t border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-8 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to join?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Create your free Castway profile and unlock access to the community,
            events, and thousands of creator connections.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black/90 hover:shadow dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Create Your Profile
          </Link>
        </div>
      </section>
    </div>
  );
}
