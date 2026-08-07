const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["week", 1000 * 60 * 60 * 24 * 7],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
];

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "always" });

export function formatRelativeTime(isoDate: string, now: Date = new Date()): string {
  const elapsedMs = new Date(isoDate).getTime() - now.getTime();
  const absMs = Math.abs(elapsedMs);

  if (absMs < 1000 * 60) return "just now";

  for (const [unit, unitMs] of RELATIVE_UNITS) {
    if (absMs >= unitMs) {
      return relativeTimeFormatter.format(Math.round(elapsedMs / unitMs), unit);
    }
  }

  return relativeTimeFormatter.format(Math.round(elapsedMs / 1000), "second");
}

// Common job-posting section headers, matched case-sensitively (they're
// conventionally written in caps) so a break lands before "THE ROLE" but
// not before an unrelated word like "SEO Manager" or "CEO" mid-sentence —
// a curated list stays safe where a generic ALL-CAPS-run regex would
// false-positive on every acronym-led job title.
const SECTION_HEADERS = [
  "ABOUT",
  "THE ROLE",
  "THE OPPORTUNITY",
  "WHAT YOU[’']LL DO",
  "WHAT YOU WILL DO",
  "WHAT YOU BRING",
  "WHAT WE OFFER",
  "WHO YOU ARE",
  "RESPONSIBILITIES",
  "REQUIREMENTS",
  "QUALIFICATIONS",
  "BENEFITS",
  "PERKS",
  "COMPENSATION",
  "HOW TO APPLY",
];
const sectionHeaderBreak = new RegExp(`\\s+(?=(?:${SECTION_HEADERS.join("|")})\\b)`, "g");

/** Scraped descriptions (LinkedIn, etc.) can arrive as one run-on line with
 * inline "•" bullets, run-together section headers, and repeated
 * whitespace left over from the source HTML's indentation — this breaks
 * bullets and known headers onto their own line and tidies spacing so
 * rendering with `whitespace-pre-line` shows something structured instead
 * of a wall of text. Descriptions that already have real paragraph breaks
 * pass through with just the whitespace cleanup. */
export function formatDescription(text: string): string {
  return text
    .replace(/\s*•\s*/g, "\n• ")
    .replace(sectionHeaderBreak, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Single-line preview for card/list views — collapses whitespace and cuts
 * at the nearest word boundary near `maxLength` rather than mid-word. Full,
 * paragraph-formatted text belongs on the detail page (see
 * `formatDescription`), not the list. */
export function truncateText(text: string, maxLength: number): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxLength) return collapsed;
  const cut = collapsed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.trimEnd()}…`;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
