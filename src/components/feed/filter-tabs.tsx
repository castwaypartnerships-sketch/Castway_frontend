import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

export type FeedFilter = "ALL" | "PARTNERSHIP" | "PROJECT" | "HIRING" | "COLLABORATION";

const FILTERS: { value: FeedFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "PROJECT", label: "Project" },
  { value: "HIRING", label: "Hiring" },
  { value: "COLLABORATION", label: "Collaboration" },
];

interface FeedFilterTabsProps {
  value: FeedFilter;
  onValueChange: (value: FeedFilter) => void;
}

export function FeedFilterTabs({ value, onValueChange }: FeedFilterTabsProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border">
      <div className="flex flex-1 items-center gap-6">
        {FILTERS.map((filter) => {
          const isActive = filter.value === value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onValueChange(filter.value)}
              className={cn(
                "border-b-2 pb-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-[#a7d9b5] font-bold text-[#2d4a35] dark:border-[#daf0dd] dark:text-[#daf0dd]"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <Link
        href="/home/mine"
        className={cn(buttonVariants({ size: "sm", variant: "outline" }), "mb-2 gap-1.5")}
      >
        <ClipboardList className="size-4" />
        My Posts
      </Link>
    </div>
  );
}
