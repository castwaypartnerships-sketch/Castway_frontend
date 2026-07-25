import { api } from "@/lib/redux/api";
import type { BrandRelationshipDto, DealStage } from "@/lib/types/crm";

export const crmApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBrandRelationships: builder.query<{ items: BrandRelationshipDto[] }, void>({
      query: () => "/crm",
      transformResponse: (response: { data: { items: BrandRelationshipDto[] } }) => response.data,
      providesTags: ["BrandRelationships"],
    }),
    addBrandRelationship: builder.mutation<BrandRelationshipDto, string>({
      query: (username) => ({ url: "/crm", method: "POST", body: { username } }),
      transformResponse: (response: { data: BrandRelationshipDto }) => response.data,
      invalidatesTags: ["BrandRelationships"],
    }),
    updateDealStage: builder.mutation<BrandRelationshipDto, { id: string; stage: DealStage }>({
      query: ({ id, stage }) => ({ url: `/crm/${id}/stage`, method: "PATCH", body: { stage } }),
      transformResponse: (response: { data: BrandRelationshipDto }) => response.data,
      invalidatesTags: ["BrandRelationships"],
    }),
    addRelationshipNote: builder.mutation<BrandRelationshipDto, { id: string; text: string }>({
      query: ({ id, text }) => ({ url: `/crm/${id}/notes`, method: "POST", body: { text } }),
      transformResponse: (response: { data: BrandRelationshipDto }) => response.data,
      invalidatesTags: ["BrandRelationships"],
    }),
    removeBrandRelationship: builder.mutation<void, string>({
      query: (id) => ({ url: `/crm/${id}`, method: "DELETE" }),
      invalidatesTags: ["BrandRelationships"],
    }),
  }),
});

export const {
  useGetBrandRelationshipsQuery,
  useAddBrandRelationshipMutation,
  useUpdateDealStageMutation,
  useAddRelationshipNoteMutation,
  useRemoveBrandRelationshipMutation,
} = crmApi;
