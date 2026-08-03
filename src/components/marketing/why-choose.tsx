"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, Sparkles, Plus, ArrowRight, UserCheck } from "lucide-react";
import { TiltCard } from "@/components/marketing/tilt-card";
import { staggerContainer, revealItem } from "@/components/marketing/reveal-variants";

export function WhyChoose() {
  return (
    <section className="mx-auto max-w-7xl px-6 md:px-8 py-24 md:py-32 border-t border-border/30">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16"
      >
        <motion.span
          variants={revealItem}
          className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1.5 rounded-full mb-4"
        >
          WHY CHOOSE CASTWAY
        </motion.span>
        <motion.h2
          variants={revealItem}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground font-serif"
        >
          Built for the next wave of collaboration.
        </motion.h2>
        <motion.p
          variants={revealItem}
          className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl"
        >
          More than a portfolio, it&apos;s a fully integrated workspace that simplifies compliance,
          speeds up payments, and protects your work.
        </motion.p>
        <motion.div variants={revealItem} className="mt-6">
          <Link
            href="/login"
            className="rounded-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 px-6 py-3 text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5"
          >
            Get Started
            <ArrowRight className="size-3.5" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Asymmetric 12-Column Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Card 1: Verified Profiles (col-span-4) */}
        <TiltCard className="md:col-span-4 rounded-3xl p-6 bg-[var(--verified-profile-bg)] border border-[#d2e3d4] dark:border-[#1d3322] flex flex-col justify-between min-h-[260px] text-left">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex size-8">
                <span className="size-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px]">MR</span>
                <span className="absolute bottom-0 right-0 flex size-3 items-center justify-center rounded-full bg-white dark:bg-black text-[7px] border border-emerald-500"><UserCheck className="size-2 text-emerald-500" /></span>
              </span>
              <div>
                <p className="font-semibold text-emerald-950 dark:text-emerald-100 text-xs">Mila Rivers</p>
                <p className="text-[9px] text-emerald-800/70 dark:text-emerald-400/70">Verified Fashion Partner</p>
              </div>
            </div>
            <span className="text-[8px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">AUTHENTIC</span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 mb-1.5">Verified profiles</h3>
            <p className="text-xs sm:text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-400/80">
              Build immediate trust with clients. Every profile syncs live metrics, platform verifications, and actual transaction histories.
            </p>
          </div>
        </TiltCard>

        {/* Card 2: Growth (col-span-8) */}
        <TiltCard className="md:col-span-8 rounded-3xl p-6 bg-[#132c1c] border border-[#193724] dark:bg-[#07130b] text-white flex flex-col justify-between min-h-[260px] text-left relative">
          <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-40">
            <TrendingUp className="size-16 text-emerald-500" />
          </div>
          <div className="flex items-start gap-4">
            <div>
              <span className="inline-flex rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase mb-3">Live Growth</span>
              <p className="text-4xl font-extrabold tracking-tight text-white">+242%</p>
              <p className="text-[10px] text-emerald-300">Audience expansion this quarter</p>
            </div>
          </div>
          
          {/* Mockup Line Chart SVG */}
          <div className="h-20 w-full mt-4 flex items-end">
            <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0 25 C10 20, 20 22, 30 15 C40 10, 50 18, 60 8 C70 5, 80 12, 90 2 C95 1, 100 0, 100 0 L100 30 L0 30 Z" fill="currentColor" fillOpacity="0.08" />
              <path d="M0 25 C10 20, 20 22, 30 15 C40 10, 50 18, 60 8 C70 5, 80 12, 90 2 C95 1, 100 0, 100 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="90" cy="2" r="1.5" fill="currentColor" />
            </svg>
          </div>

          <div className="mt-3">
            <h3 className="text-sm font-bold mb-1">Track your expansion</h3>
            <p className="text-xs leading-relaxed text-emerald-300/80">
              Live API integrations with your channels keep your profile synced and show clients your metrics at all times.
            </p>
          </div>
        </TiltCard>

        {/* Card 3: Bold typography text card (col-span-5) */}
        <TiltCard className="md:col-span-5 rounded-3xl p-6 bg-[#eaf1ec] border border-[#d2dfd6] dark:bg-[#15271a] dark:border-[#243f2d] flex flex-col justify-between min-h-[240px] text-left">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="size-4" />
          </span>
          <div className="my-4">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-tight text-emerald-950 dark:text-emerald-100">
              Your work.<br />Your worth.<br /><span className="font-bold">One profile.</span>
            </h3>
          </div>
          <p className="text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-400/80">
            A single premium URL to host your portfolios, rates, connections, and payouts without juggling multiple web tools.
          </p>
        </TiltCard>

        {/* Card 4: Stat callout (col-span-3) */}
        <TiltCard className="md:col-span-3 rounded-3xl p-6 bg-[#f3f7f4] border border-[#e2eae4] dark:bg-[#0e1b12] dark:border-[#1c3322] flex flex-col justify-center items-center text-center min-h-[240px]">
          <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground font-mono">24k+</p>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 uppercase tracking-wide">CREATORS</p>
          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed max-w-[150px]">
            Building their digital businesses on Castway daily.
          </p>
        </TiltCard>

        {/* Card 5: "Join us now" illustrated card (col-span-4) */}
        <TiltCard className="md:col-span-4 rounded-3xl p-6 bg-[#1c3322] border border-[#25422d] text-white flex flex-col justify-between min-h-[240px] text-left">
          <div className="flex -space-x-2.5 overflow-hidden">
            {["AR", "MS", "JD", "KC"].map((initial, i) => (
              <span 
                key={i} 
                className={`size-7 rounded-full bg-emerald-500 border border-[#1c3322] flex items-center justify-center font-bold text-[8px] text-white`}
              >
                {initial}
              </span>
            ))}
            <span className="size-7 rounded-full bg-emerald-600 border border-[#1c3322] flex items-center justify-center font-bold text-[8px] text-white"><Plus className="size-3" /></span>
          </div>
          
          <div className="my-4">
            <h3 className="text-base font-bold text-white mb-1.5">Join us now!</h3>
            <p className="text-xs leading-relaxed text-emerald-200">
              Apply to verified creator projects, build connections, and claim your workspace in Delhi, Mumbai, and Bangalore.
            </p>
          </div>

          <Link 
            href="/login"
            className="w-full text-center bg-white text-emerald-950 hover:bg-emerald-50 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
          >
            Apply for access <ArrowRight className="size-3" />
          </Link>
        </TiltCard>

        {/* Card 6: Everything in one workspace (col-span-7) */}
        <TiltCard className="md:col-span-7 rounded-3xl p-6 bg-[#f8faf8] border border-[#e2e8e3] dark:bg-[#09110b] dark:border-[#15261a] flex flex-col justify-between min-h-[260px] text-left">
          <div>
            <span className="inline-flex rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-4">
              Integrated Workspace
            </span>
            <h3 className="text-sm font-bold text-foreground mb-1.5">Everything in one workspace</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Manage the complete partnership lifecycle. From initial application pitches to escrow milestones and automated payout clears.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mt-5">
            {[
              "Proposals & Briefs",
              "Milestone Escrow",
              "Instant Bank Cashouts",
              "Unified Inboxes",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 border border-border/40 rounded-xl p-2.5 bg-card shadow-2xs">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <span className="text-[10px] font-medium text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </TiltCard>

        {/* Card 7: Skills-first discovery (col-span-5) */}
        <TiltCard className="md:col-span-5 rounded-3xl p-6 bg-[#d2ded4] border border-[#b8ccbc] dark:bg-[#16271c] dark:border-[#223d2b] text-emerald-950 dark:text-emerald-100 flex flex-col justify-between min-h-[260px] text-left">
          <div>
            <span className="inline-flex rounded-full bg-white dark:bg-neutral-800 px-2.5 py-1 text-[9px] font-bold text-emerald-800 dark:text-emerald-400 uppercase mb-4 border border-emerald-950/5">
              Discovery Engine
            </span>
            <h3 className="text-sm font-bold mb-1.5">Skills-first discovery</h3>
            <p className="text-xs leading-relaxed opacity-85">
              Brands find partners based on verified performance capabilities, niche skills, and past deliverables, rather than vanity subscriber metrics.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-5">
            {[
              "UGC Tech",
              "Video Editor",
              "Art Director",
              "Motion Designer",
              "SEO Analyst",
              "Colorist",
              "TikTok Reels",
            ].map((skill) => (
              <span 
                key={skill} 
                className="text-[9px] font-semibold bg-white dark:bg-neutral-800 border border-emerald-950/5 text-emerald-900 dark:text-emerald-300 rounded-full px-2.5 py-1"
              >
                {skill}
              </span>
            ))}
          </div>
        </TiltCard>

      </div>
    </section>
  );
}
