import { AppSidebar } from "@/components/app-shell/sidebar";
import { AppTopbar } from "@/components/app-shell/topbar";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
