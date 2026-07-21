import type { UploadSignature } from "@/lib/redux/endpoints/uploads-api";

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

  const response = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Cloudinary upload failed");

  const data = (await response.json()) as { secure_url: string };
  return data.secure_url;
}
