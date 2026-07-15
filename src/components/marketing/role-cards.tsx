import { Briefcase, Building2, Sparkles, Users } from "lucide-react";

const ROLES = [
  {
    icon: Sparkles,
    title: "Creator",
    description: "Publish your portfolio and get discovered for paid work in your category.",
  },
  {
    icon: Briefcase,
    title: "Freelancer",
    description: "List your services and rates, then take on gigs that actually fit your stack.",
  },
  {
    icon: Building2,
    title: "Brand",
    description: "Post opportunities and find creators who already work the way you need.",
  },
  {
    icon: Users,
    title: "Agency",
    description: "Manage a roster of talent and match them to the right briefs, faster.",
  },
];

export function RoleCards() {
  return (
    <section id="who-its-for" className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Who it&apos;s for
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            One network, four ways to work.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role) => (
            <div
              key={role.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <role.icon className="size-4.5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{role.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {role.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
