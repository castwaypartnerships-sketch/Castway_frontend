export type ConversationContext = "GENERAL" | "BRAND_DEAL";

export type DealInquiryStatus = "NEW" | "RESPONDED" | "ACCEPTED" | "DECLINED";

export interface ConversationListItem {
  id: string;
  lastMessageAt: string | null;
  createdAt: string;
  context: ConversationContext;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  opportunityId: string | null;
  opportunityTitle: string | null;
  dealBudget: string | null;
  dealStatus: DealInquiryStatus | null;
  otherParticipant: {
    userId: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    lastSeenAt: string | null;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachmentUrl: string | null;
  readBy: string[];
  /** Set only when an Agency sent this on the sender's behalf. */
  actingAgencyUserId: string | null;
  createdAt: string;
}
