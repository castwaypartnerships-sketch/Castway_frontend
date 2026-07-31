"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-shell/sidebar";
import { AppTopbar } from "@/components/app-shell/topbar";
import { RouteGuard } from "@/components/auth/route-guard";
import { ComposerProvider } from "@/components/feed/composer-context";
import { GlobalComposerDialog } from "@/components/feed/global-composer-dialog";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RouteGuard zone="protected">
      <ComposerProvider>
        <div className="flex h-dvh overflow-hidden bg-background">
          <AppSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppTopbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto bg-[#f9fafb] dark:bg-background">{children}</main>
          </div>
        </div>
        <GlobalComposerDialog />
      </ComposerProvider>
    </RouteGuard>
  );
}
