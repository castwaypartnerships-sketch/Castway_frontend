export type RevenueSplitStatus = "PENDING_APPROVAL" | "APPROVED";

export interface RevenueSplitParty {
  userId: string;
  percent: number;
}

export interface RevenueSplitDto {
  id: string;
  rosterDealId: string;
  parties: RevenueSplitParty[];
  status: RevenueSplitStatus;
  createdBy: string;
  approvedByUserIds: string[];
  createdAt: string;
  updatedAt: string;
}
