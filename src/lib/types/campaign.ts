export type CampaignStatus = "DRAFT" | "ACTIVE" | "CLOSED";

export interface Campaign {
  id: string;
  brandUserId: string;
  name: string;
  goals: string | null;
  budget: string | null;
  deliverables: string[];
  timelineStart: string | null;
  timelineEnd: string | null;
  status: CampaignStatus;
  opportunityId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignWriteInput {
  name: string;
  goals?: string;
  budget?: string;
  deliverables?: string[];
  status?: CampaignStatus;
}

export interface CampaignShortlistItem {
  creatorUserId: string;
  profile: {
    username: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

export interface CampaignAnalytics {
  shortlistCount: number;
  applicantCount: number;
  applicantsByStatus: Record<string, number>;
}
