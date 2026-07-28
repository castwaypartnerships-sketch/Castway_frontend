"use client";

import { motion, type Variants } from "framer-motion";
import { UserCheck, Globe, Zap, Briefcase } from "lucide-react";
import { staggerContainer, revealItem } from "@/components/marketing/reveal-variants";

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

const HEADING = "One profile. Every kind of professional relationship.";

// Nested stagger: the heading itself is a normal reveal item within the
// section's stagger, but it's also its own stagger container for the
// word-by-word blur-into-focus effect — distinct from the plain rise used
// on every other section heading.
const wordContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const word: Variants = {
  hidden: { opacity: 0, filter: "blur(6px)", y: 10 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

export function WhatIsCastway() {
  return (
    <section className="mx-auto max-w-7xl px-6 md:px-8 py-24 mt-12 md:py-32 border-t border-border/30 bg-muted/10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="max-w-3xl mb-16"
      >
        <motion.span
          variants={revealItem}
          className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1.5 rounded-full mb-4 inline-block"
        >
          WHAT CASTWAY IS
        </motion.span>
        <motion.h2
          variants={wordContainer}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground font-serif"
        >
          {HEADING.split(" ").map((w, i) => (
            <motion.span key={i} variants={word} className="inline-block mr-[0.28em]">
              {w}
            </motion.span>
          ))}
        </motion.h2>
        <motion.p
          variants={revealItem}
          className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl"
        >
          We&apos;re building a network designed specifically for how modern creator businesses transact.
          No fluff, no resume templates — just real connections and real work.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feat, idx) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="h-full"
          >
            <motion.div
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="group relative flex h-full flex-col items-start space-y-4 overflow-hidden rounded-2xl border border-border/40 bg-card p-6 shadow-xs transition-colors duration-300 hover:border-emerald-500/30"
            >
              <motion.span
                variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -10, scale: 1.1 } }}
                transition={{ type: "spring", stiffness: 300, damping: 14 }}
                className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                <feat.icon className="size-5" />
              </motion.span>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {feat.description}
              </p>
              <motion.span
                variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-emerald-500"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
