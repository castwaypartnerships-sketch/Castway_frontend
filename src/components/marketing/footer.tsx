import Link from "next/link";

const PLATFORM_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Find talent", href: "/login" },
  { label: "Enterprise", href: "/login" },
];

const RESOURCE_LINKS = [
  { label: "Guides & Docs", href: "/guides" },
  { label: "Blog", href: "/blog" },
  { label: "Help Center", href: "/help" },
  { label: "Creator Community", href: "/community" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Trust & Safety", href: "/trust" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/40 bg-background text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-5 gap-10 px-6 py-16 md:px-8">
        
        {/* Left Side: Brand & Socials */}
        <div className="md:col-span-2 space-y-5 text-left">
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <span className="flex size-7 items-center justify-center rounded-full bg-black text-xs font-bold text-white transition-transform group-hover:scale-105 dark:bg-white dark:text-black">
              C
            </span>
            <span className="font-semibold tracking-tight text-foreground">Castway</span>
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs leading-relaxed">
            One profile. Every kind of professional relationship. Built for the modern creator economy.
          </p>
          
          {/* Social Icons */}
          <div className="flex items-center gap-4 text-muted-foreground/60">
            <a href="#" className="hover:text-foreground transition-colors" aria-label="LinkedIn">
              <svg className="size-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="#" className="hover:text-foreground transition-colors" aria-label="Twitter">
              <svg className="size-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="hover:text-foreground transition-colors" aria-label="Instagram">
              <svg className="size-4.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" className="hover:text-foreground transition-colors" aria-label="YouTube">
              <svg className="size-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163c-.272-1.016-1.07-1.815-2.085-2.087C19.578 3.53 12 3.53 12 3.53s-7.578 0-9.413.546c-1.015.272-1.813 1.071-2.085 2.087C0 8.002 0 12 0 12s0 3.998.502 5.837c.272 1.016 1.07 1.815 2.085 2.087 1.835.547 9.413.547 9.413.547s7.578 0 9.413-.547c1.015-.272 1.813-1.071 2.085-2.087C24 15.998 24 12 24 12s0-3.998-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Right Side: 3 Columns */}
        <div className="grid grid-cols-3 gap-6 md:col-span-3 text-left">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80 mb-4">Platform</h3>
            <ul className="space-y-3">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80 mb-4">Resources</h3>
            <ul className="space-y-3">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80 mb-4">Legal</h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="border-t border-border/40 py-6">
        <div className="mx-auto max-w-7xl px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Castway Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Options</Link>
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
