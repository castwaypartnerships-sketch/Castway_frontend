import { api } from "@/lib/redux/api";

export type UploadKind = "avatars" | "covers" | "portfolio" | "posts";

export interface UploadSignature {
  folder: string;
  allowed_formats: string;
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  /** Informational only (not part of the signed request) — Cloudinary has no
   * per-request file-size parameter, so this is enforced client-side before
   * upload rather than by Cloudinary itself. */
  maxFileSizeBytes: number;
  /** Which Cloudinary upload endpoint to post to. `image` keeps avatars/
   * covers/posts pinned to image-only uploads; `auto` (portfolio only) lets
   * Cloudinary route PDFs/videos to the right resource type. */
  resourceType: "image" | "auto";
}

export const uploadsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUploadSignature: builder.mutation<UploadSignature, UploadKind>({
      query: (kind) => ({ url: "/uploads/signature", method: "POST", body: { kind } }),
      transformResponse: (response: { data: UploadSignature }) => response.data,
    }),
  }),
});

export const { useGetUploadSignatureMutation } = uploadsApi;
