import { TERRITORIES, DCS, STATUSES } from "@/lib/constants";

const inputClass =
  "rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--ink-primary)]";
const labelTextClass = "text-xs font-medium text-[var(--ink-muted)]";

// A single combined filter bar (brief section 5.4) rather than a sequential
// two-step dropdown — every filter is visible and editable at once.
export default function FilterBar({ filters, onChange, search, onSearchChange }) {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <label className="flex flex-col gap-1 text-sm">
        <span className={labelTextClass}>Search</span>
        <input
          type="search"
          placeholder="Store or SKU…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-36 ${inputClass}`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className={labelTextClass}>From</span>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => update({ startDate: e.target.value })}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className={labelTextClass}>To</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => update({ endDate: e.target.value })}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className={labelTextClass}>Territory</span>
        <select
          value={filters.territory}
          onChange={(e) => update({ territory: e.target.value })}
          className={inputClass}
        >
          <option value="">All territories</option>
          {TERRITORIES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className={labelTextClass}>Distribution Center</span>
        <select
          value={filters.dcId}
          onChange={(e) => update({ dcId: e.target.value })}
          className={inputClass}
        >
          <option value="">All DCs</option>
          {DCS.map((dc) => (
            <option key={dc} value={dc}>
              {dc}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className={labelTextClass}>Status</span>
        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          className={inputClass}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => {
          onChange({ startDate: "", endDate: "", territory: "", dcId: "", status: "" });
          onSearchChange("");
        }}
        className="rounded border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--ink-secondary)] hover:bg-[var(--surface-2)]"
      >
        Clear filters
      </button>
    </div>
  );
}
