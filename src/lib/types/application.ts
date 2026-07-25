export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export interface Application {
  id: string;
  opportunityId: string;
  applicantUserId: string;
  message: string | null;
  status: ApplicationStatus;
  actingAgencyUserId: string | null;
  createdAt: string;
  updatedAt: string;
  opportunity: { id: string; title: string; type: string; budget: string | null };
  applicant: { userId: string; username: string; name: string; avatarUrl: string | null };
}
