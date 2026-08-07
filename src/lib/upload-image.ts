import type { UploadSignature } from "@/lib/redux/endpoints/uploads-api";

const IMAGE_URL_PATTERN = /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i;

/** Best-effort check from a Cloudinary URL's extension — used to decide
 * whether a portfolio cover (which may be a PDF or video) can render as a
 * CSS background-image, or needs a file-type fallback instead. */
export function isImageUrl(url: string): boolean {
  return IMAGE_URL_PATTERN.test(url);
}

/** Uploads straight to Cloudinary from the browser — the backend only signs
 * the request (see `POST /uploads/signature`), it never sees the file. Every
 * field sent here must match what was signed, or Cloudinary rejects it. */
export async function uploadImageToCloudinary(file: File, sig: UploadSignature): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);
  formData.append("allowed_formats", sig.allowed_formats);

  // The backend picks the endpoint per upload kind (see `resourceType` on
  // the signature) — `auto` for portfolio, which also accepts PDFs/videos;
  // `image` for everything else, so avatars/covers/posts can't be used to
  // slip a non-image resource type past what's meant to stay image-only.
  const response = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Cloudinary upload failed");

  const data = (await response.json()) as { secure_url: string };
  return data.secure_url;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
}

export async function uploadFileToCloudinary(file: File, sig: UploadSignature): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);
  formData.append("allowed_formats", sig.allowed_formats);
  if (sig.type) {
    formData.append("type", sig.type);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.resourceType}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Cloudinary upload failed");

  return (await response.json()) as CloudinaryUploadResponse;
}
