"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { staggerContainer, revealItem } from "@/components/marketing/reveal-variants";

interface TabItem {
  id: string;
  title: string;
  badgeText: string;
  bgColor: string;
  shadowColor: string;
  heading: string;
  description: string;
  checklist: string[];
  illustration: string;
}

const TABS: TabItem[] = [
  {
    id: "creators",
    title: "Creators",
    badgeText: "Creators",
    bgColor: "bg-[#e8c9d4] text-[#4d2d38]",
    shadowColor: "shadow-[6px_6px_0px_#e8c9d4]",
    heading: "Everything you need to grow your creator business.",
    description: "Build a premium digital home that showcases your best collaborations, syncs live metrics, and manages direct brand deal pitches in one place.",
    checklist: [
      "Portfolio & media kit",
      "Brand deal inbox",
      "Instant payouts",
      "Analytics & audience insights",
      "Track your growth",
    ],
    illustration: "/illustrations/Learning-amico.svg",
  },
  {
    id: "agencies",
    title: "Agencies",
    badgeText: "Agencies",
    bgColor: "bg-[#dbebfa] text-[#1c3852]",
    shadowColor: "shadow-[6px_6px_0px_#dbebfa]",
    heading: "Scale every campaign with confidence.",
    description: "Co-pitch campaigns, assign briefs to talent rosters, handle high-volume invoices, and report clean analytics data back to brands instantly.",
    checklist: [
      "Manage your whole roster",
      "Pitch as a team",
      "Assign and track work",
      "Get paid, then pay out",
      "Win bigger deals",
    ],
    illustration: "/illustrations/Seminar-pana.svg",
  },
  {
    id: "brands",
    title: "Brands",
    badgeText: "Brands",
    bgColor: "bg-[#daf0dd] text-[#1a3821]",
    shadowColor: "shadow-[6px_6px_0px_#daf0dd]",
    heading: "Launch campaigns that deliver results.",
    description: "Post open roles, benchmark incoming applications side-by-side, automate compliance, and monitor return on ad spend across multiple platforms.",
    checklist: [
      "Discover the right fit",
      "Post a job, get real pitches",
      "Compare talent side by side",
      "Track spend across every campaign",
      "Skip the back-and-forth",
    ],
    illustration: "/illustrations/Coworking-rafiki.svg",
  },
  {
    id: "freelancers",
    title: "Freelancers",
    badgeText: "Freelancers",
    bgColor: "bg-[#faf0e3] text-[#453623]",
    shadowColor: "shadow-[6px_6px_0px_#faf0e3]",
    heading: "Work smarter. Deliver faster.",
    description: "Present your technical skills-first profile, negotiate milestones, manage multiple client deal flow tracks, and establish a verified transaction record.",
    checklist: [
      "Skills-first profile",
      "Browse real jobs",
      "Pitch and apply direct",
      "One inbox for every deal",
      "Build a track record",
    ],
    illustration: "/illustrations/Online_Review-pana.svg",
  },
];

export function RoleTabs() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>("creators");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Smooth scrollYProgress using Framer Motion's useSpring to prevent trackpad/scroll wheel jitter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    mass: 0.5,
  });

  const TABS_KEYS = ["creators", "agencies", "brands", "freelancers"];

  // 1:1 direct scroll-progress transforms mapped linearly for stacking
  // Card 0 (Creators) starts fully in view (translateY: 0)
  const y0 = 0;

  // Card 1 (Agencies) slides from 100% to 0% as scroll progress goes 0.25 -> 0.50
  const y1 = useTransform(smoothProgress, [0, 0.25, 0.50, 1], ["100%", "100%", "0%", "0%"]);

  // Card 2 (Brands) slides from 100% to 0% as scroll progress goes 0.50 -> 0.75
  const y2 = useTransform(smoothProgress, [0, 0.50, 0.75, 1], ["100%", "100%", "0%", "0%"]);

  // Card 3 (Freelancers) slides from 100% to 0% as scroll progress goes 0.75 -> 1.00
  const y3 = useTransform(smoothProgress, [0, 0.75, 1.00], ["100%", "100%", "0%"]);

  // Tracks active index (>50% revealed segments) to update tab header badges
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    let index = 0;
    if (progress < 0.375) index = 0;
    else if (progress < 0.625) index = 1;
    else if (progress < 0.875) index = 2;
    else index = 3;

    const tabId = TABS_KEYS[index];
    if (activeTab !== tabId) {
      setActiveTab(tabId);
    }
  });

  const handleTabClick = (tabId: string) => {
    const index = TABS_KEYS.indexOf(tabId);
    if (index === -1 || !sectionRef.current) return;

    const element = sectionRef.current;
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Total scrollable height of the section wrapper
    const totalScrollable = element.offsetHeight - window.innerHeight;

    // Scroll directly to target progress offset representing the tab's start/midpoint
    const targetProgress = index === 0 ? 0.0 : index === 1 ? 0.38 : index === 2 ? 0.63 : 0.88;
    const targetScroll = rect.top + scrollTop + targetProgress * totalScrollable;

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <div ref={sectionRef} className="relative h-auto lg:h-[300vh] w-full">
      {/* Sticky Inner Viewport Pin — offset below the fixed nav (h-16) so the
          header never overlaps it, instead of eating into the pinned
          section's own height budget with a top margin (that pushed the
          min-h cards container past the bottom edge and got clipped). */}
      <div className="relative h-auto overflow-visible lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-hidden flex flex-col justify-center bg-background">
        <div className="mx-auto max-w-7xl w-full px-6 md:px-8 py-8 flex flex-col h-auto lg:h-full justify-center">

          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerContainer}
            className="flex flex-col items-center text-center max-w-3xl mx-auto mb-4 shrink-0"
          >
            <motion.span
              variants={revealItem}
              className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1.5 rounded-full mb-4"
            >
              BUILT FOR EVERY ROLE
            </motion.span>
            <motion.h2
              variants={revealItem}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground font-serif"
            >
              One network, four ways to work.
            </motion.h2>
            <motion.p
              variants={revealItem}
              className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed hidden sm:block"
            >
              Tailored workspaces matching your specific business goals, because creators, freelancers,
              brands, and agencies don&apos;t work the same way.
            </motion.p>
          </motion.div>

          {/* Tabs Selector Bar */}
          <div className="flex justify-center mb-4  shrink-0">
            <div className="inline-flex rounded-full bg-muted/60 p-1.5 border border-border/40">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === tab.id
                    ? "bg-white dark:bg-neutral-800 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </div>

          {/* Stacked Cards Container — sized by flex-1 off whatever the header
              and tabs bar leave behind, not a fixed height, so it can never
              force the pinned viewport to overflow on shorter screens. */}
          <div className="relative flex-1 w-full min-h-[380px] max-w-5xl mx-auto shadow-sm">
            {TABS.map((tab, idx) => {
              const yVal = idx === 0 ? y0 : idx === 1 ? y1 : idx === 2 ? y2 : y3;
              const zIndex = 10 + idx;

              return (
                <motion.div
                  key={tab.id}
                  style={{ y: yVal, zIndex, willChange: "transform" }}
                  className={`rounded-3xl border border-black/10 dark:border-white/10 p-5 sm:p-6 lg:p-8 w-full grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4 lg:gap-6 items-center shadow-[0_-8px_30px_rgba(0,0,0,0.06)] mobile-no-transform ${tab.bgColor} ${
                    activeTab === tab.id
                      ? "relative flex lg:absolute lg:inset-0 lg:grid"
                      : "absolute inset-0 hidden lg:grid"
                  }`}
                >
                  {/* Left Column (Details) */}
                  <div className="flex flex-col items-start text-left space-y-2.5">
                    {/* Badge with Tab-colored Shadow Offset */}
                    <span className={`inline-flex rounded-full bg-white text-black text-xs font-bold px-4 py-2 border border-black/10 transition-transform hover:-translate-y-0.5 ${tab.shadowColor}`}>
                      {tab.badgeText}
                    </span>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-tight font-serif">
                      {tab.heading}
                    </h3>

                    <p className="text-xs sm:text-sm leading-relaxed opacity-85 lg:line-clamp-2">
                      {tab.description}
                    </p>

                    {/* Checklist — two columns so 5 items take 3 short rows
                        instead of 5 tall ones, the single biggest lever for
                        fitting inside a fixed-height pinned viewport. */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 w-full">
                      {tab.checklist.map((item, index) => (
                        <li key={index} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
                          <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-white text-black border border-black/10">
                            <Check className="size-2.5" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <Link
                      href="/login"
                      className="rounded-full bg-black text-white hover:bg-black/90 px-6 py-2.5 text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all inline-flex items-center gap-2 group"
                    >
                      Join us now
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                  {/* Right Column (Illustration Card) */}
                  <div className="flex justify-center lg:justify-end w-full max-h-[30vh] lg:max-h-full">
                    <div className="w-full max-w-sm rounded-2xl border border-black/15 bg-white dark:bg-[#0c140e] shadow-lg aspect-[4/3] relative overflow-hidden transition-all hover:scale-[1.02] duration-300">
                      {/* TAB_MEDIA_PLACEHOLDER — swap with real illustration */}
                      <Image
                        src={tab.illustration}
                        alt={tab.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 384px"
                        className="object-contain p-6"
                        priority={idx === 0}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
      <style>{`
        @media (max-width: 1023px) {
          .mobile-no-transform {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
