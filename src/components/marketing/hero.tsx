import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ProposalPreviewCard } from "@/components/marketing/proposal-preview-card";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-sidebar text-sidebar-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 size-[32rem] rounded-full bg-primary/20 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            For creators, freelancers, brands &amp; agencies
          </p>
          <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Where the creator economy gets to work.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-sidebar-foreground/70">
            Castway is the professional network built around real collaboration: build a profile,
            discover paid opportunities, connect with the right people, and move a proposal into a
            real conversation — without switching tools.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}>
              Sign in
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how-it-works"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="animate-in fade-in slide-in-from-bottom-8 rotate-2 duration-700 hover:rotate-0 [transition:transform_300ms]">
            <ProposalPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}
