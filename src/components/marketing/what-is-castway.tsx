"use client";

import { motion } from "framer-motion";
import { UserCheck, Globe, Zap, Briefcase } from "lucide-react";

const FEATURES = [
  {
    icon: UserCheck,
    title: "One profile every relationship",
    description: "Build a single, unified profile that serves as your live portfolio, media kit, and digital workspace. Showcase your rates and verify your stats automatically.",
  },
  {
    icon: Globe,
    title: "Global reach one network",
    description: "Connect with creators, brands, and top-tier agencies worldwide. Expand your collaboration opportunities beyond borders in a high-trust ecosystem.",
  },
  {
    icon: Zap,
    title: "Discover deal get paid",
    description: "Land curated opportunities tailored to your capabilities. Draft proposals, agree on milestones, and secure direct, instant payouts upon approval.",
  },
  {
    icon: Briefcase,
    title: "Built for real work",
    description: "Chat directly, sign contracts, manage briefs, and share content assets inside a single hub. Skip the tool-juggling and focus on creating.",
  },
];

export function WhatIsCastway() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 border-t border-border/30 bg-muted/10">
      <div className="max-w-3xl mb-16">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1.5 rounded-full mb-4 inline-block">
          WHAT CASTWAY IS
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mt-3 font-serif">
          One profile. Every kind of professional relationship.
        </h2>
        <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
          We&apos;re building a network designed specifically for how modern creator businesses transact.
          No fluff, no resume templates — just real connections and real work.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feat, idx) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="flex flex-col items-start space-y-4 p-6 rounded-2xl border border-border/40 bg-card shadow-xs transition-shadow hover:shadow-sm"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <feat.icon className="size-5" />
            </span>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {feat.title}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {feat.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
