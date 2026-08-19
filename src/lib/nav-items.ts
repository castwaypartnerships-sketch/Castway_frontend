import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Compass,
  Handshake,
  Home,
  LayoutGrid,
  ListChecks,
  Megaphone,
  MessageSquare,
  Settings,
  UserPlus,
  Users,
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

const HOME: NavItem = { label: "Home", breadcrumbLabel: "Announcements Feed", href: "/home", icon: Home };
const SEARCH: NavItem = { label: "Discover", breadcrumbLabel: "Discover", href: "/search", icon: Compass };
const OPPORTUNITIES: NavItem = { label: "Opportunities", href: "/opportunities", icon: Briefcase };
const CONNECTIONS: NavItem = { label: "Connections", href: "/connections", icon: Users };
const MESSAGES: NavItem = { label: "Messages", href: "/messages", icon: MessageSquare };
const MY_APPLICATIONS: NavItem = { label: "My Applications", href: "/applications", icon: ListChecks };
const SAVED: NavItem = { label: "Saved Board", href: "/saved", icon: Bookmark };
const SETTINGS: NavItem = { label: "Settings", href: "/settings", icon: Settings };
const ROSTER: NavItem = { label: "Talent", href: "/roster", icon: UserPlus };
const CAMPAIGNS: NavItem = { label: "Campaigns", href: "/campaigns", icon: Megaphone };
const SHORTLISTS: NavItem = { label: "Shortlists", href: "/shortlists", icon: ListChecks };
const CRM: NavItem = { label: "Brand CRM", href: "/crm", icon: Handshake };
const CLIENT_CAMPAIGNS: NavItem = { label: "Client Campaigns", href: "/campaigns/clients", icon: Megaphone };
const ASSIGNED_ROSTER: NavItem = { label: "My Assigned Roster", href: "/roster/assigned", icon: UserPlus };
const TEAM: NavItem = { label: "Team", href: "/roster/team", icon: Users };
const BRAND_TEAM: NavItem = { label: "Team", href: "/brand-team", icon: Users };

/** Superset used only for breadcrumb/pathname lookups (`findNavItemByPathname`) —
 * every route that appears in any role's sidebar needs exactly one entry here. */
export const NAV_ITEMS: NavItem[] = [
  HOME,
  SEARCH,
  OPPORTUNITIES,
  CONNECTIONS,
  MESSAGES,
  MY_APPLICATIONS,
  SAVED,
  SETTINGS,
  ROSTER,
  CAMPAIGNS,
  SHORTLISTS,
  CRM,
  CLIENT_CAMPAIGNS,
  ASSIGNED_ROSTER,
  TEAM,
  BRAND_TEAM,
];

/**
 * Per-role sidebar nav, scoped to what each role can actually do (see PHASES.md
 * role functionality matrix) rather than a shared default:
 * - Home: every role — the announcements feed (posts, proposals, filters).
 *   Formerly a separate "Feed" nav item; merged into Home so there's a
 *   single landing hub instead of two overlapping ones.
 * - Saved Board: kept for every role — not in the feature spec, but bookmark
 *   buttons on Feed/Opportunities cards write to it for all roles, so it needs
 *   a nav entry regardless of the spec.
 * - Discover: Creator/Agency/Brand search professionals/creators explicitly;
 *   Freelancer keeps it too since finding creators/agencies to pitch is implied
 *   by "apply for opportunities".
 * - Messages: kept for Brand even though not explicitly listed — connecting
 *   with creators implies a way to talk to them afterward.
 * - Brand posts campaigns, not generic opportunities, so Campaigns replaces
 *   Opportunities for Brand rather than sitting alongside it.
 * - Shortlists: Creator/Freelancer only — where a Brand's campaign shortlist
 *   (`campaigns/[id]`'s "Add creator by username") becomes visible to the
 *   person who was shortlisted.
 */
export const NAV_ITEMS_BY_ROLE: Record<Role, NavItem[]> = {
  CREATOR: [HOME, SEARCH, OPPORTUNITIES, CONNECTIONS, MESSAGES, MY_APPLICATIONS, SAVED, SHORTLISTS, CRM, SETTINGS],
  FREELANCER: [
    HOME,
    SEARCH,
    OPPORTUNITIES,
    CONNECTIONS,
    MESSAGES,
    MY_APPLICATIONS,
    SAVED,
    SHORTLISTS,
    SETTINGS,
  ],
  AGENCY: [
    HOME,
    SEARCH,
    OPPORTUNITIES,
    CONNECTIONS,
    MESSAGES,
    MY_APPLICATIONS,
    SAVED,
    TEAM,
    ROSTER,
    CLIENT_CAMPAIGNS,
    SETTINGS,
  ],
  BRAND: [HOME, SEARCH, CAMPAIGNS, CONNECTIONS, MESSAGES, SAVED, BRAND_TEAM, SETTINGS],
  // Talent manager sub-account — deliberately narrow: only the roster
  // subset assigned to them (with the act-on-behalf-of apply/message
  // actions that go with it), messaging, and settings. No Company Profile
  // or Search — those are the owning agency's own account surface, not the
  // manager's.
  AGENCY_MANAGER: [HOME, OPPORTUNITIES, MESSAGES, ASSIGNED_ROSTER, SETTINGS],
  // Full parity with BRAND (unlike AGENCY_MANAGER above) — teammates share
  // the whole owning Brand account (see `Actor.resourceOwnerId`), so they
  // get the exact same nav.
  BRAND_TEAM_MEMBER: [HOME, SEARCH, CAMPAIGNS, CONNECTIONS, MESSAGES, SAVED, BRAND_TEAM, SETTINGS],
};

/** `permissions` only affects `AGENCY_MANAGER` — every other role's nav is
 * the static per-role list above. A manager's *base* nav
 * (`NAV_ITEMS_BY_ROLE.AGENCY_MANAGER`) stays narrow regardless of grants
 * (Opportunities/Messages/their own assigned roster/Settings — never
 * Search or Company Profile, see the comment above); granted permissions
 * only ever *add* to it — "Talent" (the full agency roster, not just their
 * assigned subset — see `effectiveAgencyUserId` on the backend) when any
 * `TALENT_*` permission is granted, "Team" when any `TEAM_*` permission is
 * granted. Campaigns/Finance/Reports have no nav entry yet since those
 * features aren't built (see `lib/permissions.ts`). */
export function getNavItemsForRole(role: string | null | undefined, permissions: string[] = []): NavItem[] {
  const base = NAV_ITEMS_BY_ROLE[isRole(role) ? role : "CREATOR"];
  if (role !== "AGENCY_MANAGER") return base;

  const extra: NavItem[] = [];
  if (permissions.some((p) => p.startsWith("TALENT_"))) extra.push(ROSTER);
  if (permissions.some((p) => p.startsWith("TEAM_"))) extra.push(TEAM);
  return [...base, ...extra];
}

/** Picks the *longest* matching href, not the first one found — order in
 * `NAV_ITEMS` must not matter. A first-match version broke the moment two
 * entries nested (e.g. `/roster` "Talent" vs. `/roster/team` "Team"): any
 * pathname under `/roster/team` matched the shorter `/roster` prefix first
 * and showed the wrong breadcrumb, regardless of array order. */
export function findNavItemByPathname(pathname: string): NavItem | undefined {
  const matches = NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return matches.sort((a, b) => b.href.length - a.href.length)[0];
}

export const LAYOUT_GRID_ICON = LayoutGrid;
