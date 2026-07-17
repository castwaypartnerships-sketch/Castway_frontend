import { api } from "@/lib/redux/api";
import type { ProposalTemplate, ProposalTemplateWriteInput } from "@/lib/types/proposal-template";

export const proposalTemplatesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProposalTemplates: builder.query<{ items: ProposalTemplate[] }, void>({
      query: () => "/proposal-templates",
      transformResponse: (response: { data: { items: ProposalTemplate[] } }) => response.data,
      providesTags: ["ProposalTemplates"],
    }),
    createProposalTemplate: builder.mutation<ProposalTemplate, ProposalTemplateWriteInput>({
      query: (body) => ({ url: "/proposal-templates", method: "POST", body }),
      transformResponse: (response: { data: ProposalTemplate }) => response.data,
      invalidatesTags: ["ProposalTemplates"],
    }),
    updateProposalTemplate: builder.mutation<
      ProposalTemplate,
      { id: string; patch: Partial<ProposalTemplateWriteInput> }
    >({
      query: ({ id, patch }) => ({ url: `/proposal-templates/${id}`, method: "PATCH", body: patch }),
      transformResponse: (response: { data: ProposalTemplate }) => response.data,
      invalidatesTags: ["ProposalTemplates"],
    }),
    removeProposalTemplate: builder.mutation<void, string>({
      query: (id) => ({ url: `/proposal-templates/${id}`, method: "DELETE" }),
      invalidatesTags: ["ProposalTemplates"],
    }),
  }),
});

export const {
  useGetProposalTemplatesQuery,
  useCreateProposalTemplateMutation,
  useUpdateProposalTemplateMutation,
  useRemoveProposalTemplateMutation,
} = proposalTemplatesApi;
