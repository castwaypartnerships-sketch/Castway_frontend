"use client";

import { HelpCircle } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Hover-help affordance for a role-specific section — a small `?` icon next
 * to a heading that explains what the section is for and how to use it, for
 * features that only show up for one role and aren't self-evident from the
 * page alone. Pass `variant="dark"` when placed on a dark/tinted card
 * background where the default muted-foreground icon color reads too faint. */
export function SectionHelp({
  title,
  description,
  variant = "light",
}: {
  title: string;
  description: string;
  variant?: "light" | "dark";
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={`About ${title}`}
        className={cn(
          "inline-flex size-4.5 shrink-0 items-center justify-center rounded-full outline-none transition-colors",
          variant === "dark"
            ? "text-white/60 hover:text-white focus-visible:text-white"
            : "text-muted-foreground/70 hover:text-foreground focus-visible:text-foreground",
        )}
      >
        <HelpCircle className="size-4" />
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="flex-col items-start gap-0 text-left">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-background/80">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
