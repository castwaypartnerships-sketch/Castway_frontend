import { BadgeCheck, CalendarDays, DollarSign, Heart, MessageCircle } from "lucide-react";

/**
 * The hero's signature element: an illustrative example of a real Feed
 * post, styled with the exact same tokens as `PostCard` (the live
 * component under `(app)/feed`). Deliberately static/example content, not
 * a data-fetching component — a marketing page previewing the product's
 * own UI is more honest (and more distinctive) than a stock illustration.
 */
export function ProposalPreviewCard() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          SC
        </span>
        <div>
          <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
            Sophia Chen
            <BadgeCheck className="size-3.5 text-primary" />
          </p>
          <p className="text-xs text-muted-foreground">Senior Product Designer at Stripe</p>
        </div>
        <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
          Partnership
        </span>
      </div>

      <p className="mt-3.5 text-sm font-semibold text-primary">
        Launching a design co-op for mobile checkout
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        Looking for 2 frontend creative technologists specialized in WebGL to co-design an
        open-source checkout flow.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <DollarSign className="size-3.5 text-primary" />
          <p className="text-xs font-medium text-foreground">$18,000</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
          <CalendarDays className="size-3.5 text-primary" />
          <p className="text-xs font-medium text-foreground">Aug 1</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1 text-xs">
            <Heart className="size-3.5" /> 125
          </span>
          <span className="flex items-center gap-1 text-xs">
            <MessageCircle className="size-3.5" /> 18
          </span>
        </div>
        <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
          Apply Proposal
        </span>
      </div>
    </div>
  );
}
