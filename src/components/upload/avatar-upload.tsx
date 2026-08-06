"use client";

import { useRef, type ChangeEvent } from "react";
import { Camera, Loader2, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { initialsFromName } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AvatarUpload({
  avatarUrl,
  name,
  onUploaded,
  size = "lg",
}: {
  avatarUrl: string | null;
  name: string;
  onUploaded: (url: string | null) => void;
  size?: "default" | "sm" | "lg";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading } = useImageUpload("avatars");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const url = await upload(file);
    if (url) onUploaded(url);
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="group/upload relative rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Change profile photo"
      >
        <Avatar size={size}>
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback>{initialsFromName(name)}</AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover/upload:opacity-100",
            isUploading && "opacity-100",
          )}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin text-white" />
          ) : (
            <Camera className="size-4 text-white" />
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
      {avatarUrl && !isUploading ? (
        <button
          type="button"
          onClick={() => onUploaded(null)}
          className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:bg-destructive hover:text-white"
          aria-label="Remove profile photo"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </div>
  );
}
