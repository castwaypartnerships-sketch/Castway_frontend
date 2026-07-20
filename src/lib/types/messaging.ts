export type ConversationContext = "GENERAL" | "BRAND_DEAL";

export interface ConversationListItem {
  id: string;
  lastMessageAt: string | null;
  createdAt: string;
  context: ConversationContext;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
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
  createdAt: string;
}
