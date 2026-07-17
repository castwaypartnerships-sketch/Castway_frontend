import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Home,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Search,
  Settings,
  UserCircle,
  UserPlus,
  Users,
  BarChart3,
  Briefcase,
} from "lucide-react";
import type { Role } from "@/lib/rbac";
import { isRole } from "@/lib/rbac";

export interface NavItem {
  label: string;
  breadcrumbLabel?: string;
  href: string;
  icon: LucideIcon;
}

const FEED: NavItem = { label: "Feed", breadcrumbLabel: "Announcements Feed", href: "/feed", icon: Home };
const SEARCH: NavItem = { label: "Search", breadcrumbLabel: "Search Professionals", href: "/search", icon: Search };
const OPPORTUNITIES: NavItem = { label: "Opportunities", href: "/opportunities", icon: Briefcase };
const CONNECTIONS: NavItem = { label: "Connections", href: "/connections", icon: Users };
const MESSAGES: NavItem = { label: "Messages", href: "/messages", icon: MessageSquare };
const DASHBOARD: NavItem = { label: "Dashboard & Stats", href: "/dashboard", icon: BarChart3 };
const SAVED: NavItem = { label: "Saved Board", href: "/saved", icon: Bookmark };
const PORTFOLIO: NavItem = { label: "My Portfolio", href: "/portfolio", icon: UserCircle };
const COMPANY_PROFILE: NavItem = { label: "Company Profile", href: "/portfolio", icon: UserCircle };
const SETTINGS: NavItem = { label: "Workspace Settings", href: "/settings", icon: Settings };
const ROSTER: NavItem = { label: "Roster", href: "/roster", icon: UserPlus };
const CAMPAIGNS: NavItem = { label: "Campaigns", href: "/campaigns", icon: Megaphone };

/** Superset used only for breadcrumb/pathname lookups (`findNavItemByPathname`) —
 * every route that appears in any role's sidebar needs exactly one entry here. */
export const NAV_ITEMS: NavItem[] = [
  FEED,
  SEARCH,
  OPPORTUNITIES,
  CONNECTIONS,
  MESSAGES,
  DASHBOARD,
  SAVED,
  PORTFOLIO,
  SETTINGS,
  ROSTER,
  CAMPAIGNS,
];

/**
 * Per-role sidebar nav, scoped to what each role can actually do (see PHASES.md
 * role functionality matrix) rather than a shared default:
 * - Dashboard & Stats: Creator only (the spec's "Analytics widget" is Creator-only).
 * - Saved Board: kept for every role — not in the feature spec, but bookmark
 *   buttons on Feed/Opportunities cards write to it for all roles, so it needs
 *   a nav entry regardless of the spec.
 * - Search: Creator/Agency/Brand search professionals/creators explicitly;
 *   Freelancer keeps it too since finding creators/agencies to pitch is implied
 *   by "apply for opportunities".
 * - Messages: kept for Brand even though not explicitly listed — connecting
 *   with creators implies a way to talk to them afterward.
 * - Brand posts campaigns, not generic opportunities, so Campaigns replaces
 *   Opportunities for Brand rather than sitting alongside it.
 */
export const NAV_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  CREATOR: [FEED, SEARCH, OPPORTUNITIES, CONNECTIONS, MESSAGES, DASHBOARD, SAVED, PORTFOLIO, SETTINGS],
  FREELANCER: [FEED, SEARCH, OPPORTUNITIES, CONNECTIONS, MESSAGES, SAVED, PORTFOLIO, SETTINGS],
  AGENCY: [FEED, SEARCH, OPPORTUNITIES, CONNECTIONS, MESSAGES, SAVED, ROSTER, COMPANY_PROFILE, SETTINGS],
  BRAND: [FEED, SEARCH, CAMPAIGNS, CONNECTIONS, MESSAGES, SAVED, COMPANY_PROFILE, SETTINGS],
};

export function getNavItemsForRole(role: string | null | undefined): NavItem[] {
  return NAV_ITEMS_BY_ROLE[isRole(role) ? role : "CREATOR"];
}

export function findNavItemByPathname(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

export const LAYOUT_GRID_ICON = LayoutGrid;
