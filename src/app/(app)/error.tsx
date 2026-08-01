"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Without this boundary, an uncaught render error on any single tab's page
// unmounts the whole client tree (no fallback anywhere in the app), which is
// what QA saw as "a blank screen sometimes appears when switching between
// tabs" — one tab's data edge case took down the entire screen instead of
// just that tab's content. Scoped here (inside the app shell layout) so the
// sidebar/topbar stay visible and the user can navigate away.
export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          This page hit an unexpected error. You can try again, or head back and try another tab.
        </p>
      </div>
      <Button onClick={() => unstable_retry()}>Try again</Button>
    </div>
  );
}
