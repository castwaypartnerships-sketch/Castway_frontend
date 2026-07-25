export type BrandAgencyLinkStatus = "PENDING" | "ACCEPTED" | "REMOVED";

export interface BrandAgencyLinkDto {
  id: string;
  status: BrandAgencyLinkStatus;
  createdAt: string;
  brand: { userId: string; username: string; name: string; avatarUrl: string | null } | null;
  agency: { userId: string; username: string; name: string; avatarUrl: string | null } | null;
}
