import Link from "next/link";
import { NavThemeToggle } from "@/components/marketing/nav-theme-toggle";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="Castway" className="size-full object-cover" />
          </span>
          <span className="hidden text-base font-semibold tracking-tight text-foreground sm:inline">
            Castway
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-8 text-[13px] font-medium text-muted-foreground md:flex">
          <a href="#what-is-castway" className="transition-colors hover:text-foreground">
            Product
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
        </nav>

        {/* Right Side Controls */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <NavThemeToggle />
          <Link
            href="/login"
            className="whitespace-nowrap text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center whitespace-nowrap rounded-full bg-black px-3 py-2 text-xs font-semibold tracking-wide text-white shadow-sm transition-all hover:bg-black/90 hover:shadow sm:px-4 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            <span className="sm:hidden">Sign up</span>
            <span className="hidden sm:inline">Create your profile</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
