"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Bell, Calendar, ChevronRight, DollarSign, MessageSquare, Play, Sparkles, TrendingUp } from "lucide-react";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of the Hero section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Scale mockup from 1 to 1.08 and translate upwards slightly
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.9]);

  return (
    <section 
      ref={heroRef}
      className="relative flex flex-col items-center overflow-hidden bg-background pt-16 pb-24 md:pt-24 md:pb-36"
    >
      {/* Decorative gradient blur background */}
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        {/* Onboarding Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-8 shadow-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          The Network for Creator Business
        </div>

        {/* Serif Headline */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl tracking-tight leading-[1.1] text-foreground max-w-4xl text-balance">
          Where the creator economy{" "}
          <span className="font-bold block sm:inline text-black dark:text-white">
            Does business.
          </span>
        </h1>

        {/* Subtitle / Description */}
        <p className="mt-8 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
          Castway is the unified workspace built for professional collaboration. 
          Manage your portfolio, message clients, sign contracts, and track instant payouts — all in one home.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="w-full sm:w-auto rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 px-8 py-3.5 text-sm font-semibold tracking-wide shadow-md transition-all inline-flex items-center justify-center gap-2 group"
          >
            Create your profile
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto rounded-full border border-black/10 hover:border-black/20 dark:border-white/10 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 px-8 py-3.5 text-sm font-semibold tracking-wide text-foreground transition-all inline-flex items-center justify-center"
          >
            See how it works
          </a>
        </div>
      </div>

      {/* Dashboard Mockup on Sage-Green Background Panel */}
      <div className="mx-auto mt-20 w-full max-w-6xl px-6 md:px-8">
        <div className="rounded-3xl bg-[#e3eae4] dark:bg-[#1a261d] p-4 sm:p-6 md:p-8 shadow-inner">
          <motion.div
            style={{ scale, y, opacity }}
            className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0c140e] shadow-2xl transition-shadow hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]"
          >
            {/* HERO_MEDIA_PLACEHOLDER — swap with real product screenshot */}
            <div className="aspect-[16/10] w-full flex flex-col text-left select-none text-[11px] sm:text-xs">
              
              {/* Mockup Top Navigation Bar */}
              <div className="flex h-11 items-center justify-between border-b border-border/40 bg-muted/20 px-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-red-400/80" />
                    <span className="size-2.5 rounded-full bg-yellow-400/80" />
                    <span className="size-2.5 rounded-full bg-green-400/80" />
                  </div>
                  <span className="ml-4 font-mono text-[10px] text-muted-foreground/60 hidden sm:inline">castway.co/alexrivers</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px]"><Bell className="size-3 text-muted-foreground" /></span>
                  <span className="h-4 w-px bg-border/40" />
                  <div className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-emerald-500 font-bold text-[8px] text-white flex items-center justify-center">AR</span>
                    <span className="font-medium text-foreground hidden sm:inline">Alex Rivers</span>
                  </div>
                </div>
              </div>

              {/* Mockup Workspace Layout */}
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="hidden sm:flex w-44 flex-col border-r border-border/40 bg-muted/10 p-3.5 space-y-4">
                  <div className="space-y-1">
                    <div className="rounded-lg bg-emerald-500/10 px-2.5 py-1.5 font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                      <Sparkles className="size-3.5" /> Workspace
                    </div>
                    <div className="px-2.5 py-1.5 text-muted-foreground hover:bg-muted/40 rounded-lg transition-colors flex items-center gap-2">
                      <Calendar className="size-3.5" /> Opportunities
                    </div>
                    <div className="px-2.5 py-1.5 text-muted-foreground hover:bg-muted/40 rounded-lg transition-colors flex items-center gap-2 justify-between">
                      <span className="flex items-center gap-2"><MessageSquare className="size-3.5" /> Inbox</span>
                      <span className="rounded bg-emerald-500 px-1 py-0.5 text-[8px] font-bold text-white">3</span>
                    </div>
                  </div>
                  <div className="h-px bg-border/40" />
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-muted-foreground/60 tracking-wider uppercase px-2">Active deals</div>
                    <div className="px-2 py-1 hover:bg-muted/40 rounded-md transition-colors flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-amber-400" /> Nike Summer
                    </div>
                    <div className="px-2 py-1 hover:bg-muted/40 rounded-md transition-colors flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Spotify Pods
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-4 sm:p-6 overflow-hidden space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-foreground">Creator Dashboard</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Syncing metrics from YouTube & Instagram</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Portfolio
                    </span>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-border/40 bg-card p-3 sm:p-4 space-y-1">
                      <div className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="size-3.5 text-emerald-500" /> Revenue</div>
                      <div className="text-base sm:text-lg font-bold text-foreground">$14,820</div>
                      <div className="text-[9px] text-emerald-500 flex items-center gap-0.5 font-medium">
                        <TrendingUp className="size-2.5" /> +18.4%
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-card p-3 sm:p-4 space-y-1">
                      <div className="text-muted-foreground flex items-center gap-1.5"><Sparkles className="size-3.5 text-purple-500" /> Active Deals</div>
                      <div className="text-base sm:text-lg font-bold text-foreground">6 deals</div>
                      <div className="text-[9px] text-muted-foreground font-medium">3 pending signature</div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-card p-3 sm:p-4 space-y-1">
                      <div className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="size-3.5 text-blue-500" /> Engagement</div>
                      <div className="text-base sm:text-lg font-bold text-foreground">7.42%</div>
                      <div className="text-[9px] text-emerald-500 flex items-center gap-0.5 font-medium">
                        <TrendingUp className="size-2.5" /> +2.1%
                      </div>
                    </div>
                  </div>

                  {/* Campaigns / Proposals */}
                  <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                    <div className="border-b border-border/40 bg-muted/10 px-4 py-2.5 font-semibold text-foreground flex justify-between items-center">
                      <span>Recent Applications</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer flex items-center gap-0.5">View all <ChevronRight className="size-3" /></span>
                    </div>
                    <div className="divide-y divide-border/30">
                      <div className="px-4 py-3 flex items-center justify-between hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="flex size-7 items-center justify-center rounded-lg bg-black text-[10px] font-bold text-white">N</span>
                          <div>
                            <div className="font-semibold text-foreground">Nike Activewear Campaign</div>
                            <div className="text-[10px] text-muted-foreground">Proposal submitted · June 24</div>
                          </div>
                        </div>
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">Reviewing</span>
                      </div>
                      <div className="px-4 py-3 flex items-center justify-between hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-[10px] font-bold text-white">S</span>
                          <div>
                            <div className="font-semibold text-foreground">Spotify Podcasting Spotlight</div>
                            <div className="text-[10px] text-muted-foreground">Contract signed · Payout pending</div>
                          </div>
                        </div>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">Accepted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
