"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      aria-label="Toggle workspace theme"
    >
      <span className="flex items-center gap-2">
        <Sun className="size-4 dark:hidden" />
        <Moon className="hidden size-4 dark:block" />
        <span className="dark:hidden">Light Workspace</span>
        <span className="hidden dark:inline">Dark Workspace</span>
      </span>
      <span className="relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full bg-sidebar-border transition-colors dark:bg-primary">
        <span className="inline-block size-3.5 translate-x-0.5 rounded-full bg-white transition-transform dark:translate-x-[15px]" />
      </span>
    </button>
  );
}
