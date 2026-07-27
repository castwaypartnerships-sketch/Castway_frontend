"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Create your profile",
    description: "Link your social channels, showcase your best work in high resolution, specify your core skills, and list your rates to go live.",
  },
  {
    number: "02",
    title: "Send & accept proposals",
    description: "Apply directly to active campaign briefs, or send custom collaboration proposals to the exact creators you want to hire.",
  },
  {
    number: "03",
    title: "Get paid instantly",
    description: "Submit deliverables, verify campaign milestones, and trigger secure escrow payouts the moment your submission is approved.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="max-w-3xl mb-16">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1.5 rounded-full mb-4 inline-block">
          HOW IT WORKS
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mt-3 font-serif">
          Three steps. One workspace.
        </h2>
        <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl">
          We&apos;ve removed the friction from creator deal flow. Build your profile, negotiate terms, 
          and clear invoices without jumping between tools.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
        {STEPS.map((step, idx) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            className="flex flex-col space-y-4"
          >
            <span className="font-mono text-5xl sm:text-6xl font-extrabold text-neutral-200 dark:text-neutral-800 tracking-tighter select-none">
              {step.number}
            </span>
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
