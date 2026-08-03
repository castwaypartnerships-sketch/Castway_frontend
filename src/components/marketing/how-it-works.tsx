"use client";

import { motion } from "framer-motion";
import { staggerContainer, revealItem } from "@/components/marketing/reveal-variants";

const STEPS = [
  {
    number: "01",
    title: "Create your profile",
    description: "Link your social channels, showcase your best work in high resolution, specify your core skills, and list your rates to go live.",
  },
  {
    number: "02",
    title: "Connect & Discover",
    description: "Find brands, agencies, freelancers, and creators who match your goals. Browse active listings, filter by niche and budget, and reach out directly to the right people.",
  },
  {
    number: "03",
    title: "Collaborate & Grow",
    description: "Manage opportunities, conversations, and projects from one place. Track progress, stay aligned with your collaborators, and keep every deal moving forward.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 md:px-8 py-24 md:py-32 border-t border-border/30">
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
          HOW IT WORKS
        </motion.span>
        <motion.h2
          variants={revealItem}
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground font-serif"
        >
          Three steps. One workspace.
        </motion.h2>
        <motion.p
          variants={revealItem}
          className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl"
        >
          We&apos;ve removed the friction from creator deal flow. Build your profile, negotiate terms,
          and clear invoices without jumping between tools.
        </motion.p>
      </motion.div>

      {/* Steps arrive left-to-right, matching reading order of the sequence
          they describe — a different beat than the bottom-rise used
          elsewhere on the page. */}
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
        {STEPS.map((step, idx) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col space-y-4"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 + 0.15, type: "spring", stiffness: 200, damping: 14 }}
              className="font-mono text-5xl sm:text-6xl font-extrabold text-neutral-200 dark:text-neutral-800 tracking-tighter select-none origin-left"
            >
              {step.number}
            </motion.span>
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {step.title}
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
