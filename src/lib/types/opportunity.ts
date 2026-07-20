export type OpportunityType = "HIRING" | "COLLABORATION" | "BRAND_DEAL" | "FREELANCE_GIG";
export type OpportunityStatus = "DRAFT" | "OPEN" | "PAUSED" | "CLOSED" | "ARCHIVED" | "DELETED";

export interface Opportunity {
  id: string;
  postedByUserId: string;
  title: string;
  description: string;
  type: OpportunityType;
  category: string | null;
  skillsRequired: string[];
  location: string | null;
  isRemote: boolean;
  budget: string | null;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
  poster: { userId: string; username: string; name: string; avatarUrl: string | null };
}

export interface OpportunityWriteInput {
  title: string;
  description: string;
  type: OpportunityType;
  category?: string;
  skillsRequired?: string[];
  location?: string;
  isRemote?: boolean;
  budget?: string;
}
