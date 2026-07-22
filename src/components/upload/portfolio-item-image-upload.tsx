"use client";

import { useRef, type ChangeEvent } from "react";
import { Camera, ImagePlus, Loader2 } from "lucide-react";

import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { cn } from "@/lib/utils";

export function PortfolioItemImageUpload({
  imageUrl,
  onUploaded,
}: {
  imageUrl: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload("portfolio");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const url = await upload(file);
    if (url) onUploaded(url);
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={isUploading}
      className="group/item-image relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted bg-cover bg-center outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      aria-label={imageUrl ? "Change image" : "Upload image"}
    >
      {!imageUrl && !isUploading ? (
        <span className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
          <ImagePlus className="size-5" />
          Upload an image
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
            Change image
          </>
        ) : null}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </button>
  );
}
