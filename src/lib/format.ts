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

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
