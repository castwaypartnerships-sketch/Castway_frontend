import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClosingCta() {
  return (
    <section className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-24 text-center">
        <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-balance">
          Your next collaboration is one profile away.
        </h2>
        <p className="max-w-md text-sidebar-foreground/70">
          Sign in to set up your workspace and start browsing what&apos;s open right now.
        </p>
        <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}>
          Sign in
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
