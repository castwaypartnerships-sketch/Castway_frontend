export type ConnectionStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED" | "REMOVED";

export interface ConnectionListItem {
  id: string;
  status: ConnectionStatus;
  createdAt: string;
  counterpart: {
    userId: string;
    username: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    location: string | null;
    accountRole: string;
    followerCount: number;
    mutualConnectionsCount: number;
  };
}
