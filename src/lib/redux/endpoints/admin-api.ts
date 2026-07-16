import { api } from "@/lib/redux/api";

export interface AdminUserSummary {
  id: string;
  email: string;
  role: string | null;
  isAdmin: boolean;
  isVerified: boolean;
  suspendedAt: string | null;
  createdAt: string;
}

interface AdminUsersResponse {
  items: AdminUserSummary[];
  page: number;
  pageSize: number;
  total: number;
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<AdminUsersResponse, void>({
      query: () => "/admin/users",
      transformResponse: (response: { data: AdminUsersResponse }) => response.data,
      providesTags: ["AdminUsers"],
    }),
    setUserVerified: builder.mutation<void, { userId: string; verified: boolean }>({
      query: ({ userId, verified }) => ({
        url: `/admin/users/${userId}/verify`,
        method: "POST",
        body: { verified },
      }),
      invalidatesTags: ["AdminUsers"],
    }),
  }),
});

export const { useGetAdminUsersQuery, useSetUserVerifiedMutation } = adminApi;
