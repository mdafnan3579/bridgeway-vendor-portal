function formatCurrency(value) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function KpiTile({ label, value, tone }) {
  const toneClass = tone === "danger" ? "text-rose-600" : "text-slate-900";
  return (
    <div className="flex-1 min-w-[180px] rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function KpiBar({ kpis }) {
  return (
    <div className="flex flex-wrap gap-4">
      <KpiTile label="Total Order Value" value={formatCurrency(kpis.totalValue)} />
      <KpiTile label="On-Time %" value={`${kpis.onTimePct.toFixed(1)}%`} />
      <KpiTile
        label="Missed Deliveries"
        value={kpis.missedCount}
        tone={kpis.missedCount > 0 ? "danger" : undefined}
      />
      <KpiTile
        label="Revenue at Risk"
        value={formatCurrency(kpis.revenueAtRisk)}
        tone={kpis.revenueAtRisk > 0 ? "danger" : undefined}
      />
    </div>
  );
}
