import type { PostCategory } from "@/lib/types/feed";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<PostCategory, { label: string; className: string }> = {
  PARTNERSHIP: { label: "Partnership", className: "bg-primary/10 text-primary" },
  PROJECT: { label: "Project", className: "bg-primary/10 text-primary" },
  HIRING: { label: "Hiring", className: "bg-success/15 text-success" },
  COLLABORATION: { label: "Collaboration", className: "bg-accent text-accent-foreground" },
  BRAND_DEAL: { label: "Brand Deal", className: "bg-accent text-accent-foreground" },
  GENERAL: { label: "General", className: "bg-muted text-muted-foreground" },
};

export function CategoryBadge({ category, className }: { category: PostCategory; className?: string }) {
  const meta = CATEGORY_META[category];

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function categoryLabel(category: PostCategory): string {
  return CATEGORY_META[category].label;
}
