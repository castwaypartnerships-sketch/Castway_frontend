export type ConnectionStatus = "PENDING" | "ACCEPTED" | "REJECTED";

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
  };
}
