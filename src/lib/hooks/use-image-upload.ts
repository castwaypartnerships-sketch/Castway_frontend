"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useGetUploadSignatureMutation, type UploadKind } from "@/lib/redux/endpoints/uploads-api";
import { uploadImageToCloudinary } from "@/lib/upload-image";

export function useImageUpload(kind: UploadKind) {
  const [getSignature] = useGetUploadSignatureMutation();
  const [isUploading, setIsUploading] = useState(false);

  async function upload(file: File): Promise<string | null> {
    setIsUploading(true);
    try {
      const signature = await getSignature(kind).unwrap();
      if (file.size > signature.maxFileSizeBytes) {
        const maxMb = (signature.maxFileSizeBytes / 1_000_000).toFixed(0);
        toast.error(`That file is too large — please use one under ${maxMb}MB.`);
        return null;
      }
      return await uploadImageToCloudinary(file, signature);
    } catch {
      const hint = kind === "portfolio" ? "an image, PDF, or video" : "a JPG, PNG, or WebP";
      toast.error(`Couldn't upload that file. Try ${hint} under the size limit.`);
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, isUploading };
}
