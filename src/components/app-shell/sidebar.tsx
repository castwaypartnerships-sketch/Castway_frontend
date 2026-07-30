"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { getNavItemsForRole } from "@/lib/nav-items";
import { initialsFromName } from "@/lib/format";
import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useGetSessionQuery();
  const { data: profileData } = useGetOwnProfileQuery(undefined, { skip: !session?.user });
  const { data: dashboard } = useGetDashboardQuery(undefined, { skip: !session?.user });

  const displayName = profileData?.profile?.name ?? session?.user?.email ?? "Your account";
  const displayRole = profileData?.profile?.bio ?? session?.user?.role ?? "";
  const navItems = getNavItemsForRole(session?.user?.role);
  const ownProfileHref = profileData?.profile?.username ? `/profile/${profileData.profile.username}` : "/settings";

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar pt-4 text-sidebar-foreground">
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
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
        <div className="rounded-xl bg-gradient-to-br from-[#a7d9b5] to-[#476948] p-4 text-white dark:from-[#25422d] dark:to-[#1c3322]">
          <p className="text-xs font-bold tracking-wide uppercase">Castway Pro</p>
          <p className="mt-1 text-xs opacity-90">Unlock exclusive leads &amp; premium insights.</p>
          <button
            type="button"
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#2d4a35] dark:text-[#1c3322]"
          >
            <Sparkles className="size-3.5" />
            Upgrade Now
          </button>
        </div>

        <Link
          href={ownProfileHref}
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
  );
}
