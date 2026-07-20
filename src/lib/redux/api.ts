import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

export interface ApiErrorBody {
  error: string;
}

/**
 * The error shape every RTK Query hook in this app sees. Kept shaped like
 * `{ status, data: { error } }` on purpose — that's what components already
 * do `(err as { data?: { error?: string } })?.data?.error` against, so
 * existing call sites don't need to change. `isAuthError` is new: it's true
 * only for a confirmed 401 JSON response, never for a network blip or a
 * non-JSON body, so callers that need to tell "you're logged out" apart from
 * "we couldn't reach the server" (see `RouteGuard`) have something to check.
 */
export interface NormalizedApiError {
  status: number | "FETCH_ERROR" | "TIMEOUT_ERROR" | "PARSING_ERROR" | "CUSTOM_ERROR";
  data: ApiErrorBody;
  isAuthError: boolean;
}

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_ERROR_MESSAGE = "Couldn't reach the server. Check your connection and try again.";

/**
 * Normalizes every possible `fetchBaseQuery` failure into one shape. The
 * case this exists for: the backend's error handler always replies with
 * JSON, but things in front of it — a Vercel timeout, a cold start, a
 * proxy hiccup — can hand back an HTML error page instead. `fetchBaseQuery`
 * surfaces that as `PARSING_ERROR` with the raw HTML in `data`. Left
 * unhandled, that raw HTML/stack text could end up rendered as an "error
 * message," and — worse — any code that treats "the request errored" as
 * "the user is logged out" (see `RouteGuard`) would force a spurious
 * logout on what's actually a transient network problem. So: never pass
 * the raw body through, and only ever report `isAuthError` for a real,
 * JSON-confirmed 401.
 */
function normalizeError(error: FetchBaseQueryError): NormalizedApiError {
  switch (error.status) {
    case "PARSING_ERROR":
      return { status: error.status, data: { error: GENERIC_ERROR_MESSAGE }, isAuthError: false };
    case "FETCH_ERROR":
    case "TIMEOUT_ERROR":
      return { status: error.status, data: { error: NETWORK_ERROR_MESSAGE }, isAuthError: false };
    case "CUSTOM_ERROR":
      return { status: error.status, data: { error: GENERIC_ERROR_MESSAGE }, isAuthError: false };
    default: {
      const body = error.data as Partial<ApiErrorBody> | undefined;
      return {
        status: error.status,
        data: { error: body?.error ?? GENERIC_ERROR_MESSAGE },
        isAuthError: error.status === 401,
      };
    }
  }
}

const rawBaseQuery = fetchBaseQuery({ baseUrl: "/api" });

/**
 * Every request in the app funnels through this single `baseQuery` — the
 * one place responses get parsed and errors get shaped before any
 * component sees them.
 */
const baseQueryWithNormalizedErrors: BaseQueryFn<string | FetchArgs, unknown, NormalizedApiError> = async (
  args,
  queryApi,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, queryApi, extraOptions);
  if (result.error) {
    return { ...result, error: normalizeError(result.error) };
  }
  return result;
};

/**
 * All client-side data fetching goes through this single RTK Query API
 * slice, hitting relative `/api/*` paths. Those paths are proxied to the
 * backend by `next.config.ts`'s `rewrites()`, so from the browser's
 * perspective every request is same-origin — the backend's httpOnly
 * session cookies are set/read without any CORS or SameSite configuration.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithNormalizedErrors,
  tagTypes: [
    "Session",
    "Feed",
    "SavedFeed",
    "Dashboard",
    "Notifications",
    "Connections",
    "PendingConnections",
    "SuggestedConnections",
    "Opportunities",
    "SavedOpportunities",
    "Conversations",
    "Messages",
    "NotificationPreferences",
    "Reviews",
    "Endorsements",
    "AdminUsers",
    "ProposalTemplates",
    "Roster",
    "Campaigns",
    "CampaignShortlist",
  ],
  endpoints: () => ({}),
});
