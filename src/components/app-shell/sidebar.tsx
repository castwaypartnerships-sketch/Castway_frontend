"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { getNavItemsForRole } from "@/lib/nav-items";
import { initialsFromName } from "@/lib/format";
import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useGetSessionQuery();
  const { data: profileData } = useGetOwnProfileQuery(undefined, { skip: !session?.user });
  const { data: dashboard } = useGetDashboardQuery(undefined, { skip: !session?.user });

  const displayName = profileData?.profile?.name ?? session?.user?.email ?? "Your account";
  const displayRole = profileData?.profile?.bio ?? session?.user?.role ?? "";
  const navItems = getNavItemsForRole(session?.user?.role);
  const ownProfileHref = profileData?.profile?.username ? `/profile/${profileData.profile.username}` : "/settings";

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 -translate-x-full flex-col border-r border-sidebar-border bg-sidebar pt-4 text-sidebar-foreground transition-transform duration-200 md:static md:z-auto md:w-64 md:shrink-0 md:translate-x-0",
          isOpen && "translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-3 md:hidden">
          <span className="text-sm font-semibold text-sidebar-foreground">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pt-2 md:pt-0">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(`${item.href}/`) &&
                !navItems.some(
                  (other) =>
                    other.href !== item.href &&
                    other.href.startsWith(`${item.href}/`) &&
                    pathname.startsWith(other.href)
                ));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                {item.href === "/messages" && dashboard && dashboard.unreadMessagesCount > 0 ? (
                  <span className="flex min-w-[18px] items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {dashboard.unreadMessagesCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-4 px-3 pb-4">
          <Link
            href={ownProfileHref}
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border-t border-sidebar-border px-2.5 pt-3"
          >
            <Avatar>
              <AvatarImage src={profileData?.profile?.avatarUrl ?? undefined} />
              <AvatarFallback>{initialsFromName(displayName)}</AvatarFallback>
              <AvatarBadge className="bg-success" />
            </Avatar>
            <span className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">{displayName}</p>
              <p className="truncate text-xs text-sidebar-foreground/50">{displayRole}</p>
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
}
