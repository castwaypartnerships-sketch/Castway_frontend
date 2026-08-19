import Link from "next/link";
import { FooterNewsletterForm } from "@/components/marketing/footer-newsletter-form";

interface FooterLink {
  label: string;
  href: string;
}

const COMPANY_LINKS: FooterLink[] = [
  { label: "About Castway", href: "/about" },
  { label: "Our Mission", href: "/mission" },
  { label: "Careers", href: "/careers" },
  { label: "Press", href: "/press" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

const PRODUCT_LINKS: FooterLink[] = [
  { label: "Home", href: "/home" },
  { label: "Feed", href: "/home" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Professionals", href: "/professionals" },
  { label: "Companies", href: "/companies" },
  { label: "Features", href: "/features" },
  { label: "Roadmap", href: "/roadmap" },
];

const RESOURCES_LINKS: FooterLink[] = [
  { label: "Help Center", href: "/help" },
  { label: "Documentation", href: "/docs" },
  { label: "Community Guidelines", href: "/community-guidelines" },
  { label: "Creator Handbook", href: "/creator-handbook" },
  { label: "FAQs", href: "/faqs" },
  { label: "Release Notes", href: "/release-notes" },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Security", href: "/security" },
  { label: "Accessibility", href: "/accessibility" },
];

const SUPPORT_LINKS: FooterLink[] = [
  { label: "Contact Support", href: "/support" },
  { label: "Report a Bug", href: "/report-bug" },
  { label: "Feature Requests", href: "/feature-requests" },
  { label: "Status Page", href: "/status" },
];

const CONTACT_LINKS: FooterLink[] = [
  { label: "Email", href: "mailto:hello@castway.com" },
  { label: "Business Inquiries", href: "mailto:business@castway.com" },
];

const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  { title: "Company", links: COMPANY_LINKS },
  { title: "Product", links: PRODUCT_LINKS },
  { title: "Resources", links: RESOURCES_LINKS },
  { title: "Legal", links: LEGAL_LINKS },
  { title: "Support", links: SUPPORT_LINKS },
  { title: "Contact Information", links: CONTACT_LINKS },
];

function isExternalLink(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function FooterLinkItem({ label, href }: FooterLink) {
  const className = "text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors";

  if (isExternalLink(href)) {
    return (
      <a
        href={href}
        className={className}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/40 bg-background text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:px-8 lg:grid-cols-[260px_1fr]">
        {/* Brand */}
        <div className="space-y-5 text-left">
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <span className="flex size-7 items-center justify-center overflow-hidden rounded-lg transition-transform group-hover:scale-105">
              <img src="/logo.png" alt="Castway" className="size-full object-cover" />
            </span>
            <span className="font-semibold tracking-tight text-foreground">Castway</span>
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs leading-relaxed">
            One profile. Every kind of professional relationship. Built for the modern creator economy.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 text-left">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80 mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80">Newsletter</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Subscribe to product updates — creator news and feature announcements, no spam.
              </p>
            </div>
            <div className="w-full max-w-xs">
              <FooterNewsletterForm />
            </div>
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
