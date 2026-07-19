export type Role = "CREATOR" | "FREELANCER" | "BRAND" | "AGENCY";

export const ALL_ROLES: readonly Role[] = ["CREATOR", "FREELANCER", "BRAND", "AGENCY"];
export const TALENT_ROLES = ["CREATOR", "FREELANCER"] as const;
export const HIRING_ROLES = ["BRAND", "AGENCY"] as const;

/** Mirrors `OPPORTUNITY_POSTER_ROLES`/`OPPORTUNITY_APPLICANT_ROLES` in
 * `backend/src/lib/rbac/roles.ts` — posting and applying aren't a clean
 * talent/hiring split (Creator and Agency sit on both sides), so these are
 * kept distinct from `TALENT_ROLES`/`HIRING_ROLES` above, which still back
 * the unrelated "is this a company-type account" UI branch (Company Profile
 * naming, proposal-template eligibility, etc). */
export const OPPORTUNITY_POSTER_ROLES = ["CREATOR", "AGENCY", "BRAND"] as const;
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
