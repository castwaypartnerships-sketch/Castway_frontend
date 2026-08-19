"use client";

import { useRef, type ChangeEvent } from "react";
import { Camera, Loader2, X } from "lucide-react";

import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { cn } from "@/lib/utils";

export function CoverUpload({
  coverImageUrl,
  onUploaded,
}: {
  coverImageUrl: string | null;
  onUploaded: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload("covers");

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
        className="group/cover relative block h-28 w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted bg-cover bg-center outline-none transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
        style={coverImageUrl ? { backgroundImage: `url(${coverImageUrl})` } : undefined}
        aria-label="Change cover photo"
      >
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 text-xs font-medium text-white opacity-0 transition-all group-hover/cover:bg-black/40 group-hover/cover:opacity-100",
            isUploading && "bg-black/40 opacity-100",
          )}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Camera className="size-4" />
              Change cover photo
            </>
          )}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </button>
      {coverImageUrl && !isUploading ? (
        <button
          type="button"
          onClick={() => onUploaded(null)}
          className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:bg-destructive hover:text-white"
          aria-label="Remove cover photo"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
