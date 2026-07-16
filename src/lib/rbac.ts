export type Role = "CREATOR" | "FREELANCER" | "BRAND" | "AGENCY";

export const ALL_ROLES: readonly Role[] = ["CREATOR", "FREELANCER", "BRAND", "AGENCY"];
export const TALENT_ROLES = ["CREATOR", "FREELANCER"] as const;
export const HIRING_ROLES = ["BRAND", "AGENCY"] as const;

export function isHiringRole(role: string | null | undefined): boolean {
  return role != null && (HIRING_ROLES as readonly string[]).includes(role);
}

export function isTalentRole(role: string | null | undefined): boolean {
  return role != null && (TALENT_ROLES as readonly string[]).includes(role);
}

export function isRole(role: string | null | undefined): role is Role {
  return role != null && (ALL_ROLES as readonly string[]).includes(role);
}
