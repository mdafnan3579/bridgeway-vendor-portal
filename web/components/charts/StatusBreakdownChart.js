import { useState } from "react";

const SEGMENTS = [
  { key: "ON_TIME", label: "On-time", color: "var(--status-good)", icon: "check" },
  { key: "LATE", label: "Late", color: "var(--status-warning)", icon: "warning" },
  { key: "MISSED", label: "Missed", color: "var(--status-critical)", icon: "cross" },
];

function StatusIcon({ icon, color }) {
  const props = { viewBox: "0 0 16 16", fill: "none", className: "h-3.5 w-3.5", style: { color } };
  if (icon === "check") {
    return (
      <svg {...props}>
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === "warning") {
    return (
      <svg {...props}>
        <path d="M8 2.5l6.5 11h-13z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 6.5v3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="12" r="0.75" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 5.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Part-to-whole -> a single horizontal stacked bar, using the reserved
// status palette (never the categorical series colors) since ON_TIME/LATE/
// MISSED is state, not series identity. Icon + label always ride with the
// color per the status-palette non-negotiable.
export default function StatusBreakdownChart({ orders }) {
  const [hovered, setHovered] = useState(null);
  const total = orders.length;
  const counts = SEGMENTS.map((s) => ({
    ...s,
    count: orders.filter((o) => o.status === s.key).length,
  }));

  if (total === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
        <h3 className="text-sm font-medium text-[var(--ink-secondary)]">Delivery status breakdown</h3>
        <p className="mt-3 text-sm text-[var(--ink-muted)]">No orders in range.</p>
      </div>
    );
  }

  const GAP = 2;
  const bars = counts.reduce(
    (acc, seg) => {
      if (seg.count === 0) return acc;
      const widthPct = (seg.count / total) * 1000;
      const gap = acc.seenNonZero ? GAP : 0;
      const x = acc.cursor + gap;
      const w = Math.max(widthPct - gap, 0);
      acc.bars.push({ ...seg, x, w });
      acc.cursor += widthPct;
      acc.seenNonZero = true;
      return acc;
    },
    { cursor: 0, seenNonZero: false, bars: [] },
  ).bars;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <h3 className="text-sm font-medium text-[var(--ink-secondary)]">Delivery status breakdown</h3>

      <div
        className="relative mt-4 h-6 w-full"
        role="img"
        aria-label={`${total} orders: ${counts.map((c) => `${c.count} ${c.label}`).join(", ")}`}
      >
        <svg width="100%" height="24" viewBox="0 0 1000 24" preserveAspectRatio="none" className="overflow-visible">
          {bars.map(({ x, w, ...seg }) => {
            return (
              <rect
                key={seg.key}
                x={x}
                y={0}
                width={w}
                height={24}
                rx={4}
                fill={seg.color}
                opacity={hovered && hovered !== seg.key ? 0.55 : 1}
                style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                tabIndex={0}
                onMouseEnter={() => setHovered(seg.key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(seg.key)}
                onBlur={() => setHovered(null)}
              >
                <title>
                  {seg.label}: {seg.count} order{seg.count === 1 ? "" : "s"} (
                  {((seg.count / total) * 100).toFixed(0)}%)
                </title>
              </rect>
            );
          })}
        </svg>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {counts.map((seg) => (
          <li
            key={seg.key}
            className="flex items-center gap-1.5 text-sm text-[var(--ink-secondary)]"
            onMouseEnter={() => setHovered(seg.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <StatusIcon icon={seg.icon} color={seg.color} />
            <span>{seg.label}</span>
            <span className="font-semibold text-[var(--ink-primary)]">{seg.count}</span>
            <span className="text-[var(--ink-muted)]">({((seg.count / total) * 100).toFixed(0)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
