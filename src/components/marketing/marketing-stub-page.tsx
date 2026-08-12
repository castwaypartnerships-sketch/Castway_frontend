import Link from "next/link";

export function MarketingStubPage({
  eyebrow,
  title,
  description,
  placeholder = false,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** Show the "still being built" note instead of custom body content — use for
   * pages that don't have real content yet (careers listings, roadmap items,
   * changelog entries, etc.) so we're not inventing facts. */
  placeholder?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </span>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-16 md:px-8">
        {placeholder ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-6 py-10 text-center">
            <p className="text-sm leading-relaxed text-muted-foreground">
              This page is still being built. In the meantime, reach us at{" "}
              <a href="mailto:hello@castway.com" className="text-primary hover:underline">
                hello@castway.com
              </a>{" "}
              or head back to the{" "}
              <Link href="/" className="text-primary hover:underline">
                homepage
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
