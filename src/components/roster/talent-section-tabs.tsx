"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/** Route-level tab strip shared by /roster (Represented) and /roster/managed
 * (Managed) — both are large, independently-tabbed pages in their own right,
 * so this is a thin navigation header rather than a client-state tab
 * (switching "tabs" here is a real route change), matching how "Talent"
 * groups both under one sidebar entry (see nav-items.ts). */
export function TalentSectionTabs() {
  const pathname = usePathname();
  const isManaged = pathname.startsWith("/roster/managed");

  return (
    <div className="flex items-center gap-1 border-b border-border/60">
      <Link
        href="/roster"
        className={cn(
          "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
          isManaged
            ? "border-transparent text-muted-foreground hover:text-foreground"
            : "border-foreground text-foreground",
        )}
      >
        Represented
      </Link>
      <Link
        href="/roster/managed"
        className={cn(
          "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
          isManaged
            ? "border-foreground text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )}
      >
        Managed
      </Link>
    </div>
  );
}
