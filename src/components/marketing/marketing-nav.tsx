import Link from "next/link";
import { NavThemeToggle } from "@/components/marketing/nav-theme-toggle";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex size-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white transition-transform group-hover:scale-105 dark:bg-white dark:text-black">
            C
          </span>
          <span className="text-base font-semibold tracking-tight text-foreground">
            Castway
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-8 text-[13px] font-medium text-muted-foreground md:flex">
          <Link href="/opportunities" className="transition-colors hover:text-foreground">
            Product
          </Link>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#who-its-for" className="transition-colors hover:text-foreground">
            For creators
          </a>
          <a href="#who-its-for" className="transition-colors hover:text-foreground">
            For brands
          </a>
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-4">
          <NavThemeToggle />
          <Link
            href="/login"
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-black text-white hover:bg-black/90 px-4 py-2 text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all inline-flex items-center dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Create your profile
          </Link>
        </div>
      </div>
    </header>
  );
}
