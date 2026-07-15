/**
 * Domain types for the Feed screen, kept close to (but not 1:1 with) the
 * backend's `Post` Prisma model (`backend/prisma/schema.prisma`). The
 * reference design's feed cards carry proposal-style metadata (budget,
 * application deadline, apply CTA) that today's `Post` model doesn't have —
 * that's closer to `Opportunity`. Modeling `proposal` as optional here lets
 * a plain text update (category `GENERAL`) and a proposal-style post share
 * one card component, and keeps the real Phase-4 API contract (Post +
 * Opportunity join, or a schema extension) an open, non-breaking decision.
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
