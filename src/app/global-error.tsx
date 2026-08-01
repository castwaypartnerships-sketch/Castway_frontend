"use client";

import { useEffect } from "react";

// Last-resort boundary for errors thrown above the app shell (root layout,
// providers) or on routes outside `(app)` — e.g. auth/onboarding — where
// `(app)/error.tsx` doesn't reach. Must render its own <html>/<body>: this
// replaces the root layout entirely when active.
export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center font-sans">
        <div className="space-y-1.5">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">Please try again.</p>
        </div>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
