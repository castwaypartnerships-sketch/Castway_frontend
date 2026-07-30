"use client";

import { useComposer } from "@/components/feed/composer-context";
import { CreatePostDialog } from "@/components/feed/create-post-dialog";

/** Single dialog instance for the whole app shell — the topbar's Create
 * button and the Feed page's composer-trigger row both open this same
 * instance via `useComposer`, regardless of which page is currently
 * mounted. */
export function GlobalComposerDialog() {
  const { isOpen, closeComposer } = useComposer();
  return (
    <CreatePostDialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) closeComposer();
      }}
    />
  );
}
