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

export interface NavItem {
  label: string;
  breadcrumbLabel?: string;
  href: string;
  icon: LucideIcon;
}

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

export function findNavItemByPathname(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

export const LAYOUT_GRID_ICON = LayoutGrid;
