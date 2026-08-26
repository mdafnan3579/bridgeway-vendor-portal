import { TERRITORIES, DCS, STATUSES } from "@/lib/constants";

// A single combined filter bar (brief section 5.4) rather than a sequential
// two-step dropdown — every filter is visible and editable at once.
export default function FilterBar({ filters, onChange }) {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500">From</span>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => update({ startDate: e.target.value })}
          className="rounded border border-slate-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500">To</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => update({ endDate: e.target.value })}
          className="rounded border border-slate-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500">Territory</span>
        <select
          value={filters.territory}
          onChange={(e) => update({ territory: e.target.value })}
          className="rounded border border-slate-300 px-2 py-1"
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
        <span className="text-xs font-medium text-slate-500">Distribution Center</span>
        <select
          value={filters.dcId}
          onChange={(e) => update({ dcId: e.target.value })}
          className="rounded border border-slate-300 px-2 py-1"
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
        <span className="text-xs font-medium text-slate-500">Status</span>
        <select
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          className="rounded border border-slate-300 px-2 py-1"
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
        onClick={() => onChange({ startDate: "", endDate: "", territory: "", dcId: "", status: "" })}
        className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
      >
        Clear filters
      </button>
    </div>
  );
}
