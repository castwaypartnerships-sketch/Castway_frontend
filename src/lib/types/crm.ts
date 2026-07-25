export type DealStage = "NEW_CONTACT" | "NEGOTIATING" | "DEAL_CLOSED" | "PAST_COLLAB" | "LOST";

export interface BrandRelationshipNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface BrandRelationshipDto {
  id: string;
  stage: DealStage;
  notes: BrandRelationshipNote[];
  createdAt: string;
  updatedAt: string;
  brand: { userId: string; username: string; name: string; avatarUrl: string | null } | null;
}
