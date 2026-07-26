import { api } from "@/lib/redux/api";
import type { VerificationRequest } from "@/lib/types/verification";

// Admin-only review (list pending/claim/approve/reject) lives in the
// standalone `admin/` app, not here — this file only covers what a
// regular user needs for their own verification status.
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
  }),
});

export const { useGetOwnVerificationQuery, useSubmitVerificationMutation } = verificationApi;
