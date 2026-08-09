"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Plus, Search } from "lucide-react";

import { findNavItemByPathname } from "@/lib/nav-items";
import { formatRelativeTime, initialsFromName } from "@/lib/format";
import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";
import { useGetOwnProfileQuery } from "@/lib/redux/endpoints/profile-api";
import { useGetSessionQuery, useLogoutMutation } from "@/lib/redux/endpoints/auth-api";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/lib/redux/endpoints/notifications-api";
import type { AppNotification } from "@/lib/types/notification";
import { isHiringRole } from "@/lib/rbac";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { useComposer } from "@/components/feed/composer-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function AppTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const activeItem = findNavItemByPathname(pathname);
  const { data: session } = useGetSessionQuery();
  const { data: profileData } = useGetOwnProfileQuery(undefined, { skip: !session?.user });
  const ownProfileHref = profileData?.profile?.username ? `/profile/${profileData.profile.username}` : null;
  const isOwnProfile =
    ownProfileHref != null && (pathname === ownProfileHref || pathname.startsWith(`${ownProfileHref}/`));
  const breadcrumbLabel = isOwnProfile
    ? isHiringRole(session?.user?.role)
      ? "Company Profile"
      : "My Profile"
    : (activeItem?.breadcrumbLabel ?? activeItem?.label ?? "Overview");
  // AGENCY_MANAGER has no dashboard of its own (see dashboard.service.ts) —
  // skip so this doesn't 403 on every page load for that role.
  const { data: dashboard } = useGetDashboardQuery(undefined, {
    skip: session?.user?.role === "AGENCY_MANAGER",
  });
  const hasUnreadNotifications = (dashboard?.unreadNotificationsCount ?? 0) > 0;
  const { openComposer } = useComposer();

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    const trimmed = searchTerm.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 sm:gap-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
        >
          <Menu className="size-5" />
        </button>
        <nav aria-label="Breadcrumb" className="min-w-0 truncate text-sm text-muted-foreground">
          <span>Workspace</span>
          <span className="mx-1.5">/</span>
          <span className="font-medium text-foreground inline-block max-w-[120px] align-bottom truncate sm:max-w-none">{breadcrumbLabel}</span>
        </nav>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="relative hidden w-72 sm:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search creators, opportunities, posts..."
            className="pl-9"
          />
        </div>
        <button
          type="button"
          onClick={() => router.push("/search")}
          aria-label="Search"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted sm:hidden"
        >
          <Search className="size-4.5" />
        </button>
        <button
          type="button"
          onClick={openComposer}
          className="flex items-center gap-1.5 rounded-lg bg-[#476948] px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#3d5a3e] dark:bg-[#1c3322] dark:hover:bg-[#25422d] sm:px-3"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Create</span>
        </button>
        <NotificationsMenu hasUnread={hasUnreadNotifications} />
        <AccountMenu
          name={profileData?.profile?.name ?? session?.user?.email ?? "Your account"}
          avatarUrl={profileData?.profile?.avatarUrl ?? undefined}
          username={profileData?.profile?.username}
        />
      </div>
    </header>
  );
}

function AccountMenu({ name, avatarUrl, username }: { name: string; avatarUrl?: string; username?: string }) {
  const router = useRouter();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button type="button" className="flex items-center gap-2 rounded-lg p-1 pr-2">
            <Avatar>
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{initialsFromName(name)}</AvatarFallback>
              <AvatarBadge className="bg-success" />
            </Avatar>
            <span className="hidden text-left leading-tight sm:block">
              <p className="truncate text-sm font-semibold text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">View profile</p>
            </span>
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push(username ? `/profile/${username}` : "/settings")}>
            View profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="px-1.5 py-1">
          <ThemeToggle />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={isLoggingOut} onClick={handleLogout}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationsMenu({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetNotificationsQuery(undefined, { skip: !open });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  // Snapshot which ids were unread the moment the list first loads after
  // opening, and keep highlighting exactly those for the rest of this
  // viewing session — `markAllRead` below flips their real `readAt`
  // straight away, so highlighting off the live field would make the
  // "new" background vanish the instant the mark-all refetch lands.
  //
  // The snapshot itself is captured during render (React's "adjusting state
  // while rendering" pattern) rather than in a useEffect, since it's a pure
  // derivation of `data`/`open` — only the actual `markAllRead` network call
  // below needs an effect, and that effect never calls setState itself.
  const [unreadSnapshot, setUnreadSnapshot] = useState<Set<string>>(new Set());
  const [snapshotReady, setSnapshotReady] = useState(false);

  if (!open && snapshotReady) {
    setSnapshotReady(false);
  } else if (open && !snapshotReady && data) {
    setSnapshotReady(true);
    setUnreadSnapshot(new Set(data.items.filter((n) => !n.readAt).map((n) => n.id)));
  }

  useEffect(() => {
    if (snapshotReady && unreadSnapshot.size > 0) markAllRead();
  }, [snapshotReady, unreadSnapshot, markAllRead]);

  function handleSelect(notification: AppNotification) {
    if (!notification.readAt) markRead(notification.id);
    if (notification.link) router.push(notification.link);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="size-4.5" />
            {hasUnread ? (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
            ) : null}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-1.5">Notifications</DropdownMenuLabel>
          {isLoading ? (
            <p className="px-1.5 py-3 text-sm text-muted-foreground">Loading…</p>
          ) : !data || data.items.length === 0 ? (
            <p className="px-1.5 py-3 text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            data.items.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleSelect(notification)}
                className={cn(
                  "flex-col items-start gap-0.5 whitespace-normal rounded-md",
                  unreadSnapshot.has(notification.id) &&
                    "bg-[#e6f4ea] dark:bg-[#1a261d]",
                )}
              >
                <span className={cn("text-sm", unreadSnapshot.has(notification.id) && "font-medium text-foreground")}>
                  {notification.message}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
