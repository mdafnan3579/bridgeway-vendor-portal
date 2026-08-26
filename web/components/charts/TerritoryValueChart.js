import { useState } from "react";

function formatCompact(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: value >= 100000 ? "compact" : "standard",
  });
}

// Compare magnitude across categories -> bar chart, sequential single hue
// (this is a measure, not series identity, so no categorical palette here).
export default function TerritoryValueChart({ orders }) {
  const [hovered, setHovered] = useState(null);

  const totals = new Map();
  for (const o of orders) {
    if (!o.territory) continue;
    totals.set(o.territory, (totals.get(o.territory) || 0) + o.net_value);
  }
  const rows = Array.from(totals, ([territory, value]) => ({ territory, value })).sort(
    (a, b) => b.value - a.value,
  );
  const max = rows.length ? Math.max(...rows.map((r) => r.value)) : 0;

  // Bars cap below 100% width so the value label — which sits after the bar,
  // not on top of it — always has room and never overflows the card.
  const MAX_BAR_PCT = 72;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <h3 className="text-sm font-medium text-[var(--ink-secondary)]">Order value by territory</h3>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--ink-muted)]">No orders in range.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {rows.map((row) => {
            const pct = max ? (row.value / max) * MAX_BAR_PCT : 0;
            const isHovered = hovered === row.territory;
            return (
              <li key={row.territory} className="grid grid-cols-[7.5rem_1fr] items-center gap-2 text-sm">
                <span className="truncate text-[var(--ink-secondary)]">{row.territory}</span>
                <div
                  className="flex min-w-0 items-center gap-2"
                  onMouseEnter={() => setHovered(row.territory)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(row.territory)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  role="img"
                  aria-label={`${row.territory}: ${formatCompact(row.value)}`}
                >
                  <div
                    className="h-6 shrink-0 rounded-[4px] transition-[filter]"
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                      background: "var(--seq-450)",
                      filter: isHovered ? "brightness(1.15)" : "none",
                    }}
                  />
                  <span className="shrink-0 whitespace-nowrap text-xs font-medium text-[var(--ink-primary)]">
                    {formatCompact(row.value)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
