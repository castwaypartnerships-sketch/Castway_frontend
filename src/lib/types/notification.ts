export type NotificationType =
  | "CONNECTION_REQUEST"
  | "CONNECTION_ACCEPTED"
  | "NEW_MESSAGE"
  | "OPPORTUNITY_APPLICATION"
  | "APPLICATION_STATUS_CHANGE"
  | "POST_LIKE"
  | "POST_COMMENT"
  | "REVIEW_RECEIVED"
  | "SKILL_ENDORSED"
  | "ROSTER_INVITE"
  | "ROSTER_INVITE_ACCEPTED"
  | "CAMPAIGN_SHORTLISTED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}
