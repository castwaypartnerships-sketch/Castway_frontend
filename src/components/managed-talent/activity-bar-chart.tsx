/** Compact magnitude comparison across the 4 activity categories on the
 * Managed Talent "Activity" tab — a bar chart, per the dataviz skill's
 * choosing-a-form guidance for comparing a handful of categorical counts.
 * Colors are the dataviz skill's validated default categorical palette
 * (slots 1-4: blue/orange/aqua/yellow), light+dark pairs, run through
 * `validate_palette.js` (all checks pass; light-mode aqua/yellow trip the
 * sub-3:1 contrast WARN, mitigated here by direct value labels in text-ink,
 * never color-as-text, per the skill's relief rule). No separate legend box:
 * each bar carries its own adjacent category label, which is the identity
 * channel here instead of a legend swatch. Class names are written as full
 * literals (not template-built) since Tailwind only picks up complete
 * strings it can find in source.
 */

const BAR_THICKNESS = 14;
const BAR_GAP = 22;
const TRACK_WIDTH = 220;
const VALUE_LABEL_WIDTH = 36;
const RADIUS = 4;

interface Series {
  label: string;
  value: number;
  className: string;
}

/** Rounded only at the data-end (right, away from the baseline), square at
 * the baseline (left) — per the mark spec, not a uniformly-rounded rect. */
function roundedEndBarPath(width: number, y: number): string {
  const w = Math.max(width, RADIUS * 2);
  const h = BAR_THICKNESS;
  return `M0,${y} H${w - RADIUS} A${RADIUS},${RADIUS} 0 0 1 ${w},${y + RADIUS} V${y + h - RADIUS} A${RADIUS},${RADIUS} 0 0 1 ${w - RADIUS},${y + h} H0 Z`;
}

export function ActivityBarChart({
  posts,
  applications,
  connections,
  messages,
}: {
  posts: number;
  applications: number;
  connections: number;
  messages: number;
}) {
  const series: Series[] = [
    { label: "Posts", value: posts, className: "fill-[#2a78d6] dark:fill-[#3987e5]" },
    { label: "Applications", value: applications, className: "fill-[#eb6834] dark:fill-[#d95926]" },
    { label: "Connections", value: connections, className: "fill-[#1baf7a] dark:fill-[#199e70]" },
    { label: "Messages sent", value: messages, className: "fill-[#eda100] dark:fill-[#c98500]" },
  ];
  const max = Math.max(1, posts, applications, connections, messages);
  const height = series.length * (BAR_THICKNESS + BAR_GAP) - BAR_GAP + BAR_GAP / 2;
  const width = TRACK_WIDTH + VALUE_LABEL_WIDTH;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">Activity overview</h2>
      {/* Fixed pixel size, not a fluid/responsive SVG — a small comparison
          widget inside a padded card, same sizing approach as this app's
          other small fixed-size charts (e.g. CircularProgress). */}
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Bar chart comparing posts, applications, connections, and messages sent"
        className="mt-3"
      >
        {series.map((s, i) => {
          const y = BAR_GAP / 2 + i * (BAR_THICKNESS + BAR_GAP);
          const barWidth = (s.value / max) * TRACK_WIDTH;
          return (
            <g key={s.label}>
              <title>{`${s.label}: ${s.value}`}</title>
              <text x={0} y={y - 5} className="fill-muted-foreground text-[9px]">
                {s.label}
              </text>
              <rect x={0} y={y} width={TRACK_WIDTH} height={BAR_THICKNESS} rx={RADIUS} className="fill-muted opacity-40" />
              {s.value > 0 ? <path d={roundedEndBarPath(barWidth, y)} className={s.className} /> : null}
              <text x={TRACK_WIDTH + 6} y={y + BAR_THICKNESS / 2 + 3} className="fill-foreground text-[10px] font-medium">
                {s.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
