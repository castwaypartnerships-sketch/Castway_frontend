import { Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ResponseTimeSignal } from "@/lib/types/profile";

/** Response-Time / Reliability Signal (Freelancer-only) — the backend only
 * ever populates this for FREELANCER profiles, so a non-null value here is
 * itself the role gate; no client-side role check needed. */
export function ResponseTimeBadge({ responseTime }: { responseTime: ResponseTimeSignal | null }) {
  if (!responseTime || responseTime.averageMinutes === null) return null;

  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="size-3" />
      {responseTime.label}
    </Badge>
  );
}
