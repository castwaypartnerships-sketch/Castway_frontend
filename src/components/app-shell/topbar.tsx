"use client";

import { useState, type KeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";

import { findNavItemByPathname } from "@/lib/nav-items";
import { formatRelativeTime } from "@/lib/format";
import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";
import { useGetSessionQuery } from "@/lib/redux/endpoints/auth-api";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/lib/redux/endpoints/notifications-api";
import type { AppNotification } from "@/lib/types/notification";
import { isHiringRole } from "@/lib/rbac";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function AppTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const activeItem = findNavItemByPathname(pathname);
  const { data: session } = useGetSessionQuery();
  const isPortfolio = activeItem?.href === "/portfolio";
  const breadcrumbLabel =
    isPortfolio && isHiringRole(session?.user?.role)
      ? "Company Profile"
      : (activeItem?.breadcrumbLabel ?? activeItem?.label ?? "Overview");
  const { data: dashboard } = useGetDashboardQuery();
  const hasUnreadNotifications = (dashboard?.unreadNotificationsCount ?? 0) > 0;

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    const trimmed = searchTerm.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6">
      <nav aria-label="Breadcrumb" className="min-w-0 text-sm text-muted-foreground">
        <span>Workspace</span>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-foreground">{breadcrumbLabel}</span>
      </nav>

      <div className="flex items-center gap-3">
        <div className="relative hidden w-72 sm:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search keywords, creators, stacks..."
            className="pl-9"
          />
        </div>
        <NotificationsMenu hasUnread={hasUnreadNotifications} />
      </div>
    </header>
  );
}

function NotificationsMenu({ hasUnread }: { hasUnread: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetNotificationsQuery(undefined, { skip: !open });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

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
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
            ) : null}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-1.5 py-1">
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
            <button
              type="button"
              disabled={isMarkingAll}
              onClick={() => markAllRead()}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
            >
              Mark all as read
            </button>
          </div>
          {isLoading ? (
            <p className="px-1.5 py-3 text-sm text-muted-foreground">Loading…</p>
          ) : !data || data.items.length === 0 ? (
            <p className="px-1.5 py-3 text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            data.items.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleSelect(notification)}
                className="flex-col items-start gap-0.5 whitespace-normal"
              >
                <span className={cn("text-sm", !notification.readAt && "font-medium text-foreground")}>
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
