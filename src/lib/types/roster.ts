export type RosterEntryStatus = "PENDING" | "ACCEPTED" | "REMOVED";

export interface RosterEntryDto {
  id: string;
  status: RosterEntryStatus;
  createdAt: string;
  agency: { userId: string; username: string; name: string; avatarUrl: string | null } | null;
  member: { userId: string; username: string; name: string; avatarUrl: string | null } | null;
}
