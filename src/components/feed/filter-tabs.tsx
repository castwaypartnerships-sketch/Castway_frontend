import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClipboardList, Plus } from "lucide-react";

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
  onNewProposal?: () => void;
}

export function FeedFilterTabs({ value, onValueChange, onNewProposal }: FeedFilterTabsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Tabs value={value} onValueChange={(next) => onValueChange(next as FeedFilter)}>
        <TabsList>
          {FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex items-center gap-2">
        <Link href="/feed/mine" className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5")}>
          <ClipboardList className="size-4" />
          My Posts
        </Link>
        <Button size="sm" className="gap-1.5" onClick={onNewProposal}>
          <Plus className="size-4" />
          Create Post
        </Button>
      </div>
    </div>
  );
}
