import { api } from "@/lib/redux/api";
import type { Application, ApplicationStatus } from "@/lib/types/application";

export const applicationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyApplications: builder.query<{ items: Application[] }, void>({
      query: () => "/applications/mine",
      transformResponse: (response: { data: { items: Application[] } }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((item) => ({ type: "Applications" as const, id: item.id })),
              { type: "Applications" as const, id: "MINE" },
            ]
          : [{ type: "Applications" as const, id: "MINE" }],
    }),
    withdrawApplication: builder.mutation<void, string>({
      query: (applicationId) => ({ url: `/applications/${applicationId}/withdraw`, method: "POST" }),
      invalidatesTags: (_result, _error, applicationId) => [{ type: "Applications", id: applicationId }],
      // Flip the status locally right away — otherwise the badge sits on
      // "Pending" until the POST resolves and the invalidated query refetches,
      // which reads as "nothing happened" for a beat.
      onQueryStarted: async (applicationId, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          applicationsApi.util.updateQueryData("getMyApplications", undefined, (draft) => {
            const item = draft.items.find((application) => application.id === applicationId);
            if (item) item.status = "WITHDRAWN";
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    getApplicationsForOpportunity: builder.query<{ items: Application[] }, string>({
      query: (opportunityId) => `/opportunities/${opportunityId}/applications`,
      transformResponse: (response: { data: { items: Application[] } }) => response.data,
      providesTags: (_result, _error, opportunityId) => [{ type: "Applications", id: opportunityId }],
    }),
    getRosterApplications: builder.query<{ items: Application[] }, void>({
      query: () => "/applications/roster",
      transformResponse: (response: { data: { items: Application[] } }) => response.data,
      providesTags: [{ type: "Applications", id: "ROSTER" }],
    }),
    setApplicationStatus: builder.mutation<void, { applicationId: string; opportunityId: string; status: ApplicationStatus }>({
      query: ({ applicationId, status }) => ({
        url: `/applications/${applicationId}/status`,
        method: "POST",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { opportunityId }) => [{ type: "Applications", id: opportunityId }],
    }),
  }),
});

export const {
  useGetMyApplicationsQuery,
  useWithdrawApplicationMutation,
  useGetApplicationsForOpportunityQuery,
  useGetRosterApplicationsQuery,
  useSetApplicationStatusMutation,
} = applicationsApi;
