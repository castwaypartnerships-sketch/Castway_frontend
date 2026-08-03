"use client";

import { useState, useEffect, useRef } from "react";

export function TrustedBy() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );

  // 1. Check for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // 2. Intersection Observer for Tagline sweep
  useEffect(() => {
    if (prefersReducedMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const isSweepActive = isIntersecting || prefersReducedMotion;

  const highlightStyle: React.CSSProperties = {
    display: "inline-block",
    backgroundImage: "linear-gradient(var(--verified-profile-bg), var(--verified-profile-bg))",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left center",
    backgroundSize: isSweepActive ? "100% 100%" : "0% 100%",
    transition: prefersReducedMotion ? "none" : "background-size 1.1s cubic-bezier(0.65, 0, 0.35, 1)",
    padding: "8px 16px",
    borderRadius: "10px",
  };

  return (
    <section ref={sectionRef} className="w-full border-y border-border/40 bg-muted/20 py-7 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-8 flex flex-col items-center justify-center text-center">

        {/* Main Tagline */}
        <h2
          className="text-[28px] sm:text-[30px] font-bold tracking-[-0.02em] text-foreground leading-[1.3]"
        >
          <span style={highlightStyle}>
            {"\"Built for the next generation of creators.\""}
          </span>
        </h2>

      </div>
    </section>
  );
}
