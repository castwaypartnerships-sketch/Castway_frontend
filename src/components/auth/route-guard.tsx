"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useGetSessionQuery, type SessionUser } from "@/lib/redux/endpoints/auth-api";
import type { NormalizedApiError } from "@/lib/redux/api";
import { Button } from "@/components/ui/button";

export type RouteGuardZone = "auth" | "onboarding" | "protected";

/** Decides where a request for `pathname` should actually land given the
 * session's verification/onboarding progress — the single source of truth
 * for the signup -> verify-email -> role -> profile -> app sequence. Returns
 * `null` when `pathname` is already the right place to be. */
export function resolveDestination(
  zone: RouteGuardZone,
  pathname: string,
  session: SessionUser | null,
): string | null {
  if (!session) {
    if (
      zone === "auth" &&
      (pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password")
    )
      return null;
    return "/login";
  }
  if (!session.isEmailVerified) {
    if (zone === "auth" && pathname === "/verify-email") return null;
    return "/verify-email";
  }
  if (!session.role) {
    if (zone === "onboarding" && pathname === "/onboarding/role") return null;
    return "/onboarding/role";
  }
  if (!session.isOnboarded) {
    if (zone === "onboarding" && pathname === "/onboarding/profile") return null;
    return "/onboarding/profile";
  }
  if (zone === "protected") return null;
  return "/feed";
}

export function RouteGuard({ zone, children }: { zone: RouteGuardZone; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isError, error, refetch } = useGetSessionQuery();

  /**
   * Only a confirmed 401 means "you're actually logged out." Any other
   * error — a dropped connection, a proxy timeout, an HTML error page from
   * the platform in front of the API — is transient and must not bounce
   * the user to /login; that previously read as a spurious logout (e.g.
   * QA's "sending a message logs the user out" reports).
   */
  const isConfirmedLoggedOut = isError && (error as NormalizedApiError | undefined)?.isAuthError === true;
  const isUnverifiable = isError && !isConfirmedLoggedOut && !data;

  const session = isConfirmedLoggedOut ? null : (data?.user ?? null);
  const destination = isLoading || isUnverifiable ? null : resolveDestination(zone, pathname, session);

  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, router]);

  if (isUnverifiable) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <p className="text-sm text-muted-foreground">Couldn&apos;t verify your session. Check your connection.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading || destination) {
    return <div className="flex min-h-dvh items-center justify-center bg-background" />;
  }

  return <>{children}</>;
}
