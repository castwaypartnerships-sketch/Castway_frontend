"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";

const WORDMARK = "Castway";
const MIN_VISIBLE_MS = 2000;
const FILL_DURATION = 0.3;
const EXIT_DURATION = 0.7;

// Exposed so Hero can time its own text entrance to land right as the
// curtain lifts, instead of finishing (invisibly) underneath it.
export const INTRO_REVEAL_DELAY_S = (MIN_VISIBLE_MS + FILL_DURATION * 1000) / 1000;

// useLayoutEffect warns during SSR; fall back to useEffect there. Safe to use
// here (unlike a browser-storage check) because the initial `loading` state
// is always true on both server and client, so there's no hydration mismatch
// to race — this only trims the flash for prefers-reduced-motion users.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const count = useMotionValue(0);
  const [percent, setPercent] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      setLoading(false);
      return;
    }

    document.body.style.overflow = "hidden";
    // Creeps to 90% within the minimum visible window so it never looks
    // finished before the page actually is; the last 10% snaps in once
    // both the minimum time and the real page load have both landed.
    const controls = animate(count, 90, { duration: 1.4, ease: [0.65, 0, 0.35, 1] });
    const unsubscribe = count.on("change", (v) => setPercent(Math.round(v)));

    let minTimeDone = false;
    let pageLoaded = document.readyState === "complete";
    let dismissTimer: ReturnType<typeof setTimeout> | undefined;

    const dismiss = () => {
      animate(count, 100, { duration: FILL_DURATION, ease: "easeOut" });
      dismissTimer = setTimeout(() => {
        setLoading(false);
      }, FILL_DURATION * 1000);
    };

    const finishIfReady = () => {
      if (minTimeDone && pageLoaded) dismiss();
    };

    const minTimer = setTimeout(() => {
      minTimeDone = true;
      finishIfReady();
    }, MIN_VISIBLE_MS);

    const handleLoad = () => {
      pageLoaded = true;
      finishIfReady();
    };
    if (!pageLoaded) window.addEventListener("load", handleLoad);

    return () => {
      controls.stop();
      unsubscribe();
      clearTimeout(minTimer);
      clearTimeout(dismissTimer);
      window.removeEventListener("load", handleLoad);
    };
  }, [count]);

  useEffect(() => {
    if (!loading) document.body.style.overflow = "";
  }, [loading]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loading-screen"
          exit={{ y: "-100%" }}
          transition={{ duration: EXIT_DURATION, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background"
        >
          <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />

          {/* Per-letter mask reveal */}
          <div className="flex overflow-hidden">
            {WORDMARK.split("").map((char, i) => (
              <span key={i} className="inline-block overflow-hidden py-1">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block font-serif text-5xl sm:text-6xl font-bold tracking-tight text-foreground"
                >
                  {char}
                </motion.span>
              </span>
            ))}
          </div>

          {/* Drawn baseline, echoing the hairline dividers used between sections */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.65, ease: [0.65, 0, 0.35, 1] }}
            className="h-px w-40 origin-center bg-border"
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            Preparing your workspace
            <span className="font-mono text-foreground/70 tabular-nums">{percent}%</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
