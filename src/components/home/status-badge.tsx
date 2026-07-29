import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/lib/types/application";

const STATUS_VARIANT: Record<ApplicationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  ACCEPTED: "default",
  REJECTED: "destructive",
  WITHDRAWN: "outline",
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
