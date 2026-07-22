import Link from "next/link";

interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

// Every link here points at a route or in-page section that actually exists
// today. The QA sheet's full footer spec also called for Company/Legal/
// Social/Support/Newsletter columns (About, Careers, Privacy Policy, Terms,
// LinkedIn, a status page, etc.) — none of those have a real page, document,
// or account behind them yet, so they're deliberately left out rather than
// filled with dead links or invented content.
const COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Feed", href: "/feed" },
      { label: "Opportunities", href: "/opportunities" },
      { label: "Find talent", href: "/search" },
    ],
  },
  {
    heading: "About Castway",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Who it's for", href: "/#who-its-for" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/signup" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
              C
            </span>
            <span className="font-medium text-foreground">Castway</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">Built for the creator economy.</p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading}>
            <h3 className="text-sm font-semibold text-foreground">{column.heading}</h3>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Castway. Built for the creator economy.
        </p>
      </div>
    </footer>
  );
}
