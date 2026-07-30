import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  {
    title: "Track the right accounts",
    body: "Add any Brand or Agency account you've dealt with by username. Each entry is private to you — nobody else on Castway can see who's in your CRM.",
  },
  {
    title: "Move deals through stages",
    body: "Every relationship starts as New Contact. As things progress, update the stage: Negotiating while you're working out terms, Deal Closed once you've signed, Past Collab after a deal wraps, or Lost if it falls through. Stages drive the Pipeline Overview counts on the main CRM page.",
  },
  {
    title: "Log a deal value",
    body: "When a deal closes, add its dollar value on the relationship card. It feeds directly into your CRM analytics — total value closed, average deal size, and win rate all read from this field.",
  },
  {
    title: "Write notes after every call",
    body: "A quick note after each conversation — what was discussed, who you talked to, what's next — builds a paper trail only you can see. It's the easiest way to walk into a follow-up call already prepared.",
  },
  {
    title: "Review your pipeline regularly",
    body: "Use the filter pills (All Deals / Active Deals / Negotiating) to focus on what needs attention, and check Analytics periodically to see how your outreach is trending over time.",
  },
];

export default function CrmGuidePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
      <Link
        href="/crm"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Brand CRM
      </Link>

      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">CRM Guide</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How to get the most out of your private brand relationship tracker.
        </p>
      </div>

      <div className="space-y-5">
        {SECTIONS.map((section) => (
          <section key={section.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
