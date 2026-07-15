"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

import { findNavItemByPathname } from "@/lib/nav-items";
import { useGetDashboardQuery } from "@/lib/redux/endpoints/dashboard-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AppTopbar() {
  const pathname = usePathname();
  const activeItem = findNavItemByPathname(pathname);
  const breadcrumbLabel = activeItem?.breadcrumbLabel ?? activeItem?.label ?? "Overview";
  const { data: dashboard } = useGetDashboardQuery();
  const hasUnreadNotifications = (dashboard?.unreadNotificationsCount ?? 0) > 0;

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
            placeholder="Search keywords, creators, stacks..."
            className="pl-9"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="size-4.5" />
          {hasUnreadNotifications ? (
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
          ) : null}
        </Button>
      </div>
    </header>
  );
}
