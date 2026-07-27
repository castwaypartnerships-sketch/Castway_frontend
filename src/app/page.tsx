import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Hero } from "@/components/marketing/hero";
import { TrustedBy } from "@/components/marketing/trusted-by";
import { RoleTabs } from "@/components/marketing/role-tabs";
import { WhatIsCastway } from "@/components/marketing/what-is-castway";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { WhyChoose } from "@/components/marketing/why-choose";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { MarketingFooter } from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <TrustedBy />
        <RoleTabs />
        <WhatIsCastway />
        <HowItWorks />
        <WhyChoose />
        <ClosingCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
