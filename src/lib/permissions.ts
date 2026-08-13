// Mirrors backend/src/lib/rbac/permissions.ts — kept in sync manually, same
// as other cross-app constants (e.g. OpportunityType) in this monorepo.
export const PERMISSIONS = {
  TALENT_VIEW: "TALENT_VIEW",
  TALENT_ADD: "TALENT_ADD",
  TALENT_EDIT: "TALENT_EDIT",
  TALENT_DELETE: "TALENT_DELETE",
  CAMPAIGNS_VIEW: "CAMPAIGNS_VIEW",
  CAMPAIGNS_CREATE: "CAMPAIGNS_CREATE",
  CAMPAIGNS_EDIT: "CAMPAIGNS_EDIT",
  FINANCE_VIEW: "FINANCE_VIEW",
  FINANCE_CREATE_INVOICES: "FINANCE_CREATE_INVOICES",
  FINANCE_MANAGE_PAYOUTS: "FINANCE_MANAGE_PAYOUTS",
  TEAM_INVITE: "TEAM_INVITE",
  TEAM_REMOVE: "TEAM_REMOVE",
  TEAM_EDIT_PERMISSIONS: "TEAM_EDIT_PERMISSIONS",
  REPORTS_VIEW: "REPORTS_VIEW",
  REPORTS_EXPORT: "REPORTS_EXPORT",
  SETTINGS_MANAGE_AGENCY: "SETTINGS_MANAGE_AGENCY",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Mirrors `requirePermission` in backend/src/lib/rbac/permissions.ts — the
 * owning AGENCY account is never scoped and always passes; an
 * AGENCY_MANAGER passes only if `key` is in their granted `permissions`.
 * Used to hide/disable actions the viewer can't perform, so a restricted
 * manager doesn't see a button that will just fail on click. */
export function hasAgencyPermission(
  role: string | null | undefined,
  permissions: string[],
  key: Permission,
): boolean {
  if (role === "AGENCY") return true;
  if (role === "AGENCY_MANAGER") return permissions.includes(key);
  return false;
}

export interface PermissionCategory {
  label: string;
  permissions: { key: Permission; label: string }[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    label: "Talent",
    permissions: [
      { key: PERMISSIONS.TALENT_VIEW, label: "View Talent" },
      { key: PERMISSIONS.TALENT_ADD, label: "Add Talent" },
      { key: PERMISSIONS.TALENT_EDIT, label: "Edit Talent" },
      { key: PERMISSIONS.TALENT_DELETE, label: "Delete Talent" },
    ],
  },
  {
    label: "Campaigns",
    permissions: [
      { key: PERMISSIONS.CAMPAIGNS_VIEW, label: "View Campaigns" },
      { key: PERMISSIONS.CAMPAIGNS_CREATE, label: "Create Campaigns" },
      { key: PERMISSIONS.CAMPAIGNS_EDIT, label: "Edit Campaigns" },
    ],
  },
  {
    label: "Finance",
    permissions: [
      { key: PERMISSIONS.FINANCE_VIEW, label: "View Finance" },
      { key: PERMISSIONS.FINANCE_CREATE_INVOICES, label: "Create Invoices" },
      { key: PERMISSIONS.FINANCE_MANAGE_PAYOUTS, label: "Manage Payouts" },
    ],
  },
  {
    label: "Team",
    permissions: [
      { key: PERMISSIONS.TEAM_INVITE, label: "Invite Members" },
      { key: PERMISSIONS.TEAM_REMOVE, label: "Remove Members" },
      { key: PERMISSIONS.TEAM_EDIT_PERMISSIONS, label: "Edit Permissions" },
    ],
  },
  {
    label: "Reports",
    permissions: [
      { key: PERMISSIONS.REPORTS_VIEW, label: "View Reports" },
      { key: PERMISSIONS.REPORTS_EXPORT, label: "Export Reports" },
    ],
  },
  {
    label: "Settings",
    permissions: [{ key: PERMISSIONS.SETTINGS_MANAGE_AGENCY, label: "Manage Agency Settings" }],
  },
];
