import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Home,
  LayoutGrid,
  MessageSquare,
  Settings,
  UserCircle,
  Users,
  BarChart3,
  Briefcase,
} from "lucide-react";
import type { Role } from "@/lib/rbac";
import { isHiringRole } from "@/lib/rbac";

export interface NavItem {
  label: string;
  breadcrumbLabel?: string;
  href: string;
  icon: LucideIcon;
}

/** Role-agnostic list used for breadcrumb/pathname lookups (`findNavItemByPathname`),
 * where every role's variant of a given href shares the same route. Sidebar
 * rendering uses `NAV_ITEMS_BY_ROLE` below, which is where a later phase adds
 * role-specific entries (e.g. Agency's Roster, Brand's Campaigns) without
 * this list needing to change. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Feed", breadcrumbLabel: "Announcements Feed", href: "/feed", icon: Home },
  { label: "Opportunities", href: "/opportunities", icon: Briefcase },
  { label: "Connections", href: "/connections", icon: Users },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Dashboard & Stats", href: "/dashboard", icon: BarChart3 },
  { label: "Saved Board", href: "/saved", icon: Bookmark },
  { label: "My Portfolio", href: "/portfolio", icon: UserCircle },
  { label: "Workspace Settings", href: "/settings", icon: Settings },
];

/** Per-role sidebar nav. Today only the Portfolio item's label differs
 * (Brand/Agency see "Company Profile"); later phases add role-specific
 * items here (Agency: Roster, Brand: Campaigns, Creator: Brand Deal inbox,
 * Freelancer: Proposal templates) once those pages exist. */
export const NAV_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  CREATOR: NAV_ITEMS,
  FREELANCER: NAV_ITEMS,
  BRAND: NAV_ITEMS.map((item) =>
    item.href === "/portfolio" ? { ...item, label: "Company Profile" } : item,
  ),
  AGENCY: NAV_ITEMS.map((item) =>
    item.href === "/portfolio" ? { ...item, label: "Company Profile" } : item,
  ),
};

export function getNavItemsForRole(role: string | null | undefined): NavItem[] {
  return isHiringRole(role) ? NAV_ITEMS_BY_ROLE.BRAND : NAV_ITEMS_BY_ROLE.CREATOR;
}

export function findNavItemByPathname(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

export const LAYOUT_GRID_ICON = LayoutGrid;
