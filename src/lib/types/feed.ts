/**
 * Domain types for the Feed screen, kept close to (but not 1:1 with) the
 * backend's `Post` Prisma model (`backend/prisma/schema.prisma`). A proposal-
 * shaped post (budget/deadline set, authored by a role allowed to post
 * opportunities) is now backed by a real linked `Opportunity` record —
 * `proposal.opportunityId`, when present, is what "Apply Proposal" applies
 * against via the same `/opportunities/:id/apply` endpoint `OpportunityCard`
 * uses. It's optional because older posts (or ones from a role that can't
 * post opportunities) can still have `budget`/`deadlineLabel` set for display
 * with no backing Opportunity — those render the info cards but no Apply
 * button. `proposal` itself stays optional so a plain text update (category
 * `GENERAL`) and a proposal-style post can share one card component.
 */

export type PostCategory =
  | "GENERAL"
  | "HIRING"
  | "COLLABORATION"
  | "BRAND_DEAL"
  | "PARTNERSHIP"
  | "PROJECT";

export interface FeedAuthor {
  userId: string;
  username: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  verified: boolean;
}

export interface FeedProposalDetails {
  budgetLabel: string;
  deadlineLabel: string;
  opportunityId?: string;
}

export interface FeedItem {
  id: string;
  author: FeedAuthor;
  category: PostCategory;
  title: string;
  description: string;
  tags: string[];
  proposal?: FeedProposalDetails;
  likeCount: number;
  commentCount: number;
  viewerHasLiked: boolean;
  viewerHasSaved: boolean;
  createdAt: string;
}

export interface ProfileCompletionTask {
  id: string;
  label: string;
  done: boolean;
  bonusLabel?: string;
}

export interface ProfileCompletion {
  percent: number;
  tasks: ProfileCompletionTask[];
}

export type ConnectionSuggestionStatus = "none" | "pending" | "connected";

export interface SuggestedConnection {
  userId: string;
  username: string;
  name: string;
  role: string;
  location: string;
  avatarUrl: string | null;
  verified: boolean;
  status: ConnectionSuggestionStatus;
}
