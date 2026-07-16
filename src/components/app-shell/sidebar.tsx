"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";

import { getNavItemsForRole } from "@/lib/nav-items";
import { initialsFromName } from "@/lib/format";
import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import { useGetSessionQuery, useLogoutMutation } from "@/lib/redux/endpoints/auth-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useGetSessionQuery();
  const { data: profileData } = useGetOwnProfileQuery(undefined, { skip: !session?.user });
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const displayName = profileData?.profile?.name ?? session?.user?.email ?? "Your account";
  const displayRole = profileData?.profile?.bio ?? session?.user?.role ?? "";
  const navItems = getNavItemsForRole(session?.user?.role);

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          C
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">Castway</p>
          <p className="text-[10px] font-medium tracking-wider text-sidebar-foreground/50 uppercase">
            Creator OS
          </p>
        </div>
      </div>

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
                "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="size-4" />
                {item.label}
              </span>
            </Link>
          );
        })}

        {session?.user?.isAdmin ? (
          <Link
            href="/admin"
            className={cn(
              "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <span className="flex items-center gap-2.5">
              <ShieldCheck className="size-4" />
              Admin
            </span>
          </Link>
        ) : null}
      </nav>

      <div className="space-y-2 px-3 pb-4">
        <ThemeToggle />
        <Separator className="bg-sidebar-border" />
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-2">
          <span className="relative">
            <Avatar>
              <AvatarImage src={profileData?.profile?.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                {initialsFromName(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-success ring-2 ring-sidebar" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{displayName}</p>
            <p className="truncate text-xs text-sidebar-foreground/50">{displayRole}</p>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="text-sidebar-foreground/60 hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
