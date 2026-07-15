const PILLARS = [
  {
    number: "01",
    title: "Build a profile",
    description:
      "Showcase your work, skills, and rates in a profile built for a portfolio — not a résumé template.",
  },
  {
    number: "02",
    title: "Discover opportunities",
    description:
      "Browse open collaborations, brand deals, and hiring posts filtered to what you actually do.",
  },
  {
    number: "03",
    title: "Connect",
    description:
      "Send and accept connection requests with the people who are actually shipping in your category.",
  },
  {
    number: "04",
    title: "Message",
    description: "Move from a proposal to a real conversation without switching tools.",
  },
];

export function Pillars() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-xl">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase">How it works</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Four steps, one thread.
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
        {PILLARS.map((pillar) => (
          <div key={pillar.number} className="flex gap-4">
            <span className="text-2xl font-semibold text-primary/30 tabular-nums">
              {pillar.number}
            </span>
            <div>
              <h3 className="text-base font-semibold text-foreground">{pillar.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
