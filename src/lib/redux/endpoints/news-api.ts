import { api } from "@/lib/redux/api";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
}

export const newsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Only used by the `/news/[slug]` detail page — the home feed gets its
    // news items inline from `useGetFeedQuery` (`getFeed` in feed-api.ts),
    // not from this endpoint.
    getNewsArticle: builder.query<NewsArticle, string>({
      query: (slug) => `/news/${slug}`,
      transformResponse: (response: { data: NewsArticle }) => response.data,
      providesTags: (_result, _error, slug) => [{ type: "News", id: slug }],
    }),
  }),
});

export const { useGetNewsArticleQuery } = newsApi;
