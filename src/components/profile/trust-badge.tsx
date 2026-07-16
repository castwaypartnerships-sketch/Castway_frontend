import { BadgeCheck, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ReviewSummary } from "@/lib/redux/endpoints/reviews-api";

/** Verified is an admin-granted flag; trust score is a computed heuristic
 * (see `computeTrustScore` on the backend) — kept visually distinct so the
 * two aren't read as the same claim. */
export function TrustBadge({
  isVerified,
  trustScore,
  reviewSummary,
}: {
  isVerified: boolean;
  trustScore: number;
  reviewSummary?: ReviewSummary;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {isVerified ? (
        <Badge variant="default" className="gap-1">
          <BadgeCheck className="size-3" />
          Verified
        </Badge>
      ) : null}
      <Badge variant="secondary">Trust score {trustScore}</Badge>
      {reviewSummary && reviewSummary.reviewCount > 0 ? (
        <Badge variant="outline" className="gap-1">
          <Star className="size-3 fill-current" />
          {reviewSummary.averageRating?.toFixed(1)} ({reviewSummary.reviewCount})
        </Badge>
      ) : null}
    </div>
  );
}
