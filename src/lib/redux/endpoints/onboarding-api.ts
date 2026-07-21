import { api } from "@/lib/redux/api";

export type Role = "CREATOR" | "FREELANCER" | "BRAND" | "AGENCY";

export interface OnboardingProfileInput {
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  creatorCategory?: string;
  location?: string;
  skills?: string[];
  services?: string[];
  businessEmail?: string;
  openForCollaboration?: boolean;
  lookingToHire?: boolean;
  availableForWork?: boolean;
}

export const onboardingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    assignRole: builder.mutation<{ role: Role }, Role>({
      query: (role) => ({ url: "/onboarding/role", method: "POST", body: { role } }),
      transformResponse: (response: { data: { role: Role } }) => response.data,
      invalidatesTags: ["Session"],
    }),
    completeOnboarding: builder.mutation<void, OnboardingProfileInput>({
      query: (body) => ({ url: "/onboarding/profile", method: "POST", body }),
      invalidatesTags: ["Session", "Dashboard"],
    }),
  }),
});

export const { useAssignRoleMutation, useCompleteOnboardingMutation } = onboardingApi;
