export type OpportunityType =
  | "HIRING"
  | "COLLABORATION"
  | "BRAND_DEAL"
  | "FREELANCE_GIG"
  | "SPONSORSHIP"
  | "AMBASSADORSHIP"
  | "UGC_CONTENT"
  | "EVENT_APPEARANCE";
export type OpportunityStatus = "DRAFT" | "OPEN" | "PAUSED" | "CLOSED" | "ARCHIVED" | "DELETED";

export interface Opportunity {
  id: string;
  /** Null for opportunities ingested from an external `source` instead of
   * posted by a Castway user. */
  postedByUserId: string | null;
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
  /** Null when `source` is set — external listings have no Castway poster. */
  poster: { userId: string; username: string; name: string; avatarUrl: string | null } | null;
  viewerHasApplied: boolean;
  /** Set only for opportunities ingested by an external scraper (e.g.
   * "linkedin"); null for user-posted opportunities. When set, link out to
   * `sourceUrl` instead of the internal apply flow. */
  source: string | null;
  sourceUrl: string | null;
  /** Hiring company/brand as scraped from `source`; null for user-posted
   * opportunities. */
  company: string | null;
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
