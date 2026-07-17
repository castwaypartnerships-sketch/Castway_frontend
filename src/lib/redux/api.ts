import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * All client-side data fetching goes through this single RTK Query API
 * slice, hitting relative `/api/*` paths. Those paths are proxied to the
 * backend by `next.config.ts`'s `rewrites()`, so from the browser's
 * perspective every request is same-origin — the backend's httpOnly
 * session cookies are set/read without any CORS or SameSite configuration.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
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
