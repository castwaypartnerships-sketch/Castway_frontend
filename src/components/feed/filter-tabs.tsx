import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
      <Button size="sm" className="gap-1.5" onClick={onNewProposal}>
        <Plus className="size-4" />
        New Proposal
      </Button>
    </div>
  );
}
