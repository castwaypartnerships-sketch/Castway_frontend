export type RosterDealStage = "NEW_LEAD" | "NEGOTIATING" | "DEAL_CLOSED" | "BOOKED" | "LOST";

export interface RosterDealNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface RosterDealDto {
  id: string;
  title: string;
  stage: RosterDealStage;
  notes: RosterDealNote[];
  createdAt: string;
  updatedAt: string;
  member: { userId: string; username: string; name: string; avatarUrl: string | null } | null;
  brand: { userId: string; username: string; name: string; avatarUrl: string | null } | null;
}
