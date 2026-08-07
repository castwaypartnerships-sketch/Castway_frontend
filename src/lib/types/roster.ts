export type RosterEntryStatus = "PENDING" | "ACCEPTED" | "REMOVED";

export type TalentStatus = "AVAILABLE" | "IN_DEAL" | "BOOKED";

export interface RosterEntryDto {
  id: string;
  status: RosterEntryStatus;
  talentStatus: TalentStatus;
  publiclyListed: boolean;
  createdAt: string;
  agency: { userId: string; username: string; name: string; avatarUrl: string | null } | null;
  member: { userId: string; username: string; name: string; avatarUrl: string | null } | null;
  followers: string | null;
  primaryPlatform: string | null;
  responseRate: number | null;
  revenue: number | null;
  managedByName: string | null;
}
