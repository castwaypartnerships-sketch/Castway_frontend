"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { staggerContainer } from "@/components/marketing/reveal-variants";

// A settle-in (scale + fade, no translate) rather than the bottom-rise used
// everywhere else — the closing statement lands rather than arrives.
const settleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function ClosingCta() {
  return (
    <section className="bg-[#e3eae4] dark:bg-[#101c13] text-foreground border-t border-border/30">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 md:px-8 py-24 md:py-32 text-center"
      >
        <motion.h2
          variants={settleIn}
          className="max-w-2xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance font-serif leading-tight"
        >
          Your professional home starts here.
        </motion.h2>
        <motion.p variants={settleIn} className="max-w-md text-muted-foreground text-xs sm:text-sm leading-relaxed">
          Join thousands of creators, brands, and agencies building their businesses on Castway.
        </motion.p>
        <motion.div variants={settleIn}>
          <Link
            href="/login"
            className="rounded-full bg-[#1c3322] hover:bg-[#25422d] text-white px-8 py-3.5 text-xs font-semibold tracking-wide shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 group dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Join us
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
