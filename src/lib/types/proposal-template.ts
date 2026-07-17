export interface ProposalTemplate {
  id: string;
  ownerUserId: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalTemplateWriteInput {
  title: string;
  body: string;
}
