import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Hero } from "@/components/marketing/hero";
import { Pillars } from "@/components/marketing/pillars";
import { RoleCards } from "@/components/marketing/role-cards";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { MarketingFooter } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <Pillars />
        <RoleCards />
        <ClosingCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
