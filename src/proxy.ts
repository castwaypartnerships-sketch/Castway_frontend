import { NextResponse, type NextRequest } from "next/server";
import { NAV_ITEMS } from "@/lib/nav-items";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same runtime, same
// convention — see the `proxy` export below). Mirrors the shallow,
// edge-safe check in `backend/src/middleware.ts`: this only confirms the
// session cookie is *present*, not that it's still a valid, unexpired JWT
// (verifying that would require sharing the backend's signing secret,
// which the frontend intentionally never has). Real enforcement happens
// server-side on every backend API call via `requireApiActor()`.
const ACCESS_TOKEN_COOKIE = "castway_access_token";

const PROTECTED_PREFIXES = [...NAV_ITEMS.map((item) => item.href), "/onboarding", "/verify-email"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!request.cookies.has(ACCESS_TOKEN_COOKIE)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
