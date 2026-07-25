/** `AGENCY_MANAGER` and `BRAND_TEAM_MEMBER` are owner-provisioned sub-accounts
 * — never self-selected during onboarding (that picker is a hardcoded list in
 * `app/onboarding/role/page.tsx`, not derived from `ALL_ROLES`, and only
 * ever creates CREATOR/FREELANCER/BRAND/AGENCY accounts). They're included
 * here (unlike the backend's `ALL_ROLES` in `lib/rbac/roles.ts`, which the
 * onboarding role-picker's Zod schema *is* derived from and deliberately
 * excludes them) so `isRole`/`getNavItemsForRole` route them correctly
 * instead of falling back to CREATOR's nav. Unlike `AGENCY_MANAGER` (a
 * narrow, scoped sub-account), `BRAND_TEAM_MEMBER` shares the whole owning
 * Brand account — see `NAV_ITEMS_BY_ROLE`. */
export type Role = "CREATOR" | "FREELANCER" | "BRAND" | "AGENCY" | "AGENCY_MANAGER" | "BRAND_TEAM_MEMBER";

export const ALL_ROLES: readonly Role[] = [
  "CREATOR",
  "FREELANCER",
  "BRAND",
  "AGENCY",
  "AGENCY_MANAGER",
  "BRAND_TEAM_MEMBER",
];
export const TALENT_ROLES = ["CREATOR", "FREELANCER"] as const;
export const HIRING_ROLES = ["BRAND", "AGENCY", "BRAND_TEAM_MEMBER"] as const;

/** Mirrors `OPPORTUNITY_POSTER_ROLES`/`OPPORTUNITY_APPLICANT_ROLES` in
 * `backend/src/lib/rbac/roles.ts` — posting and applying aren't a clean
 * talent/hiring split (Creator and Agency sit on both sides), so these are
 * kept distinct from `TALENT_ROLES`/`HIRING_ROLES` above, which still back
 * the unrelated "is this a company-type account" UI branch (Company Profile
 * naming, proposal-template eligibility, etc). */
export const OPPORTUNITY_POSTER_ROLES = ["CREATOR", "AGENCY", "BRAND", "BRAND_TEAM_MEMBER"] as const;
export const OPPORTUNITY_APPLICANT_ROLES = ["CREATOR", "FREELANCER", "AGENCY"] as const;

export function isHiringRole(role: string | null | undefined): boolean {
  return role != null && (HIRING_ROLES as readonly string[]).includes(role);
}

export function isTalentRole(role: string | null | undefined): boolean {
  return role != null && (TALENT_ROLES as readonly string[]).includes(role);
}

export function canPostOpportunity(role: string | null | undefined): boolean {
  return role != null && (OPPORTUNITY_POSTER_ROLES as readonly string[]).includes(role);
}

export function canApplyToOpportunity(role: string | null | undefined): boolean {
  return role != null && (OPPORTUNITY_APPLICANT_ROLES as readonly string[]).includes(role);
}

export function isRole(role: string | null | undefined): role is Role {
  return role != null && (ALL_ROLES as readonly string[]).includes(role);
}
