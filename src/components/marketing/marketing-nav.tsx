import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { NavThemeToggle } from "@/components/marketing/nav-theme-toggle";
import { cn } from "@/lib/utils";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            C
          </span>
          <span className="text-sm font-semibold text-foreground">Castway</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#who-its-for" className="transition-colors hover:text-foreground">
            Who it&apos;s for
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <NavThemeToggle />
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Sign in
          </Link>
          <Link href="/login" className={cn(buttonVariants({ size: "sm" }))}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
