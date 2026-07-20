import { api } from "@/lib/redux/api";
import type { VerificationRequest } from "@/lib/types/verification";

interface PendingVerificationsResponse {
  items: VerificationRequest[];
  page: number;
  pageSize: number;
  total: number;
}

export const verificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOwnVerification: builder.query<VerificationRequest | null, void>({
      query: () => "/verification/me",
      transformResponse: (response: { data: VerificationRequest | null }) => response.data,
      providesTags: ["Verification"],
    }),
    submitVerification: builder.mutation<VerificationRequest, { note?: string }>({
      query: (body) => ({ url: "/verification/submit", method: "POST", body }),
      transformResponse: (response: { data: VerificationRequest }) => response.data,
      invalidatesTags: ["Verification"],
    }),
    getPendingVerifications: builder.query<PendingVerificationsResponse, void>({
      query: () => ({ url: "/verification/pending", params: { page: 1, pageSize: 50 } }),
      transformResponse: (response: { data: PendingVerificationsResponse }) => response.data,
      providesTags: ["PendingVerifications"],
    }),
    approveVerification: builder.mutation<void, string>({
      query: (id) => ({ url: `/verification/${id}/approve`, method: "POST" }),
      invalidatesTags: ["PendingVerifications"],
    }),
    rejectVerification: builder.mutation<void, string>({
      query: (id) => ({ url: `/verification/${id}/reject`, method: "POST" }),
      invalidatesTags: ["PendingVerifications"],
    }),
  }),
});

export const {
  useGetOwnVerificationQuery,
  useSubmitVerificationMutation,
  useGetPendingVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
} = verificationApi;
