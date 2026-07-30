"use client";

import { useGetTrendingSkillsQuery } from "@/lib/redux/endpoints/profile-api";

export function TrendingSkillsCard() {
  const { data, isLoading, isError } = useGetTrendingSkillsQuery();

  if (isLoading) return <div className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />;
  if (isError || !data || data.items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Trending Skills</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {data.items.map((item, index) => (
          <span
            key={item.skill}
            className={
              index === 0
                ? "rounded-full bg-[#e6f4ea] px-3 py-1 text-[11px] font-bold text-[#2d4a35] dark:bg-[#1a261d] dark:text-[#daf0dd]"
                : "rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground"
            }
          >
            {item.skill}
          </span>
        ))}
      </div>
    </section>
  );
}
