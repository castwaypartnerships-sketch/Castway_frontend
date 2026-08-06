"use client";

import { useRef, type ChangeEvent } from "react";
import { Camera, FileText, ImagePlus, Loader2, X } from "lucide-react";

import type { UploadKind } from "@/lib/redux/endpoints/uploads-api";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { isImageUrl } from "@/lib/upload-image";
import { cn } from "@/lib/utils";

// Portfolio items accept work samples beyond plain images (PDFs, video
// clips); every other upload kind (avatars, covers, posts) stays image-only.
const PORTFOLIO_ACCEPT = "image/png,image/jpeg,image/webp,application/pdf,video/mp4,video/quicktime,video/webm";
const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";

export function InlineImageUpload({
  kind,
  imageUrl,
  onUploaded,
  onRemove,
  className,
}: {
  kind: UploadKind;
  imageUrl: string;
  onUploaded: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload(kind);
  const accept = kind === "portfolio" ? PORTFOLIO_ACCEPT : IMAGE_ACCEPT;
  const isPreviewableImage = !imageUrl || isImageUrl(imageUrl);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const url = await upload(file);
    if (url) onUploaded(url);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          "group/item-image relative flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted bg-cover bg-center outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
          className || "aspect-video w-full"
        )}
        style={imageUrl && isPreviewableImage ? { backgroundImage: `url(${imageUrl})` } : undefined}
        aria-label={imageUrl ? "Change file" : "Upload a file"}
      >
        {!imageUrl && !isUploading ? (
          <span className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground text-center px-1">
            <ImagePlus className={cn("size-5", kind === "avatars" && "size-4.5")} />
            {kind === "avatars" ? null : kind === "portfolio" ? "Upload an image, PDF, or video" : "Upload an image"}
          </span>
        ) : null}
        {imageUrl && !isPreviewableImage && !isUploading ? (
          <span className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground text-center px-1">
            <FileText className={cn("size-5", kind === "avatars" && "size-4.5")} />
            {kind === "avatars" ? null : "File uploaded"}
          </span>
        ) : null}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 text-xs font-medium text-white opacity-0 transition-all",
            imageUrl && "group-hover/item-image:bg-black/40 group-hover/item-image:opacity-100",
            isUploading && "bg-black/40 opacity-100",
          )}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : imageUrl ? (
            <>
              <Camera className="size-4" />
              {kind === "avatars" ? null : kind === "portfolio" ? "Change file" : "Change image"}
            </>
          ) : null}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFile}
        />
      </button>
      {imageUrl && onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove image"
          className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
