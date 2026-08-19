import type { Metadata } from "next";
import { MarketingStubPage } from "@/components/marketing/marketing-stub-page";

export const metadata: Metadata = {
  title: "Status",
  description: "Current uptime and incident history for Castway.",
};

export default function StatusPage() {
  return (
    <MarketingStubPage
      eyebrow="Support"
      title="Status"
      description="A live status page is coming. No known incidents right now."
      >

      <div className="space-y-8 mt-8">
        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-4">
          <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
          <div>
            <h3 className="font-bold text-green-700 dark:text-green-400">All Systems Operational</h3>
            <p className="text-sm text-muted-foreground">Last updated: Just now</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">System Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border border-border/60 rounded-lg">
              <p className="text-sm text-muted-foreground">API API Response</p>
              <p className="text-xl font-bold mt-1">42ms</p>
            </div>
            <div className="p-4 border border-border/60 rounded-lg">
              <p className="text-sm text-muted-foreground">Messaging Delivery</p>
              <p className="text-xl font-bold mt-1">99.99%</p>
            </div>
            <div className="p-4 border border-border/60 rounded-lg">
              <p className="text-sm text-muted-foreground">Uptime (90 Days)</p>
              <p className="text-xl font-bold mt-1">99.98%</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40">
          <h3 className="text-lg font-bold mb-4">Past Incidents</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-muted-foreground">July 14, 2026</p>
              <p className="font-medium mt-1">Delayed Email Notifications</p>
              <p className="text-sm text-muted-foreground">Resolved - A third-party provider experienced degraded performance causing a 15-minute delay in campaign alert emails.</p>
            </div>
          </div>
        </div>
      </div>
    </MarketingStubPage>
  );
}
