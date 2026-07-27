import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ClosingCta() {
  return (
    <section className="bg-[#e3eae4] dark:bg-[#101c13] text-foreground border-t border-border/30">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center">
        <h2 className="max-w-2xl text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-balance font-serif leading-tight">
          Your professional home in the creator economy starts here.
        </h2>
        <p className="max-w-md text-muted-foreground text-xs sm:text-sm leading-relaxed">
          Join thousands of creators, brands, and agencies building their businesses on Castway.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-[#1c3322] hover:bg-[#25422d] text-white px-8 py-3.5 text-xs font-semibold tracking-wide shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 group dark:bg-white dark:text-black dark:hover:bg-white/90"
        >
          Join us
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
