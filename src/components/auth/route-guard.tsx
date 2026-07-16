"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useGetSessionQuery, type SessionUser } from "@/lib/redux/endpoints/auth-api";

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
    if (zone === "auth" && (pathname === "/login" || pathname === "/signup")) return null;
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
  const { data, isLoading, isError } = useGetSessionQuery();

  const session = isError ? null : (data?.user ?? null);
  const destination = isLoading ? null : resolveDestination(zone, pathname, session);

  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, router]);

  if (isLoading || destination) {
    return <div className="flex min-h-dvh items-center justify-center bg-background" />;
  }

  return <>{children}</>;
}
