export type VerificationStatus = "SUBMITTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export interface VerificationRequest {
  id: string;
  userId: string;
  status: VerificationStatus;
  note: string | null;
  reviewerId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
