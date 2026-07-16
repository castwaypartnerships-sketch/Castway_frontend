import { AppSidebar } from "@/components/app-shell/sidebar";
import { AppTopbar } from "@/components/app-shell/topbar";
import { RouteGuard } from "@/components/auth/route-guard";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard zone="protected">
      <div className="flex h-dvh overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
