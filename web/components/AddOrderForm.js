import { useState } from "react";
import { TERRITORIES, DCS, STATUSES } from "@/lib/constants";

const EMPTY_FORM = {
  storeId: "",
  territory: TERRITORIES[0],
  dcId: DCS[0],
  skuId: "",
  casesOrdered: "",
  netValue: "",
  status: STATUSES[0],
  orderDate: "",
};

export default function AddOrderForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500">Store ID</span>
        <input
          required
          type="text"
          placeholder="ST-999"
          value={form.storeId}
          onChange={(e) => update({ storeId: e.target.value })}
          className="w-28 rounded border border-slate-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500">Territory</span>
        <select
          value={form.territory}
          onChange={(e) => update({ territory: e.target.value })}
          className="rounded border border-slate-300 px-2 py-1"
        >
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
          value={form.dcId}
          onChange={(e) => update({ dcId: e.target.value })}
          className="rounded border border-slate-300 px-2 py-1"
        >
          {DCS.map((dc) => (
            <option key={dc} value={dc}>
              {dc}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500">SKU</span>
        <input
          required
          type="text"
          placeholder="SKU-1000"
          value={form.skuId}
          onChange={(e) => update({ skuId: e.target.value })}
          className="w-28 rounded border border-slate-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500">Cases</span>
        <input
          required
          type="number"
          min="1"
          value={form.casesOrdered}
          onChange={(e) => update({ casesOrdered: e.target.value })}
          className="w-20 rounded border border-slate-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500">Net Value ($)</span>
        <input
          required
          type="number"
          min="0"
          step="0.01"
          value={form.netValue}
          onChange={(e) => update({ netValue: e.target.value })}
          className="w-28 rounded border border-slate-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500">Order Date</span>
        <input
          required
          type="date"
          value={form.orderDate}
          onChange={(e) => update({ orderDate: e.target.value })}
          className="rounded border border-slate-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium text-slate-500">Status</span>
        <select
          value={form.status}
          onChange={(e) => update({ status: e.target.value })}
          className="rounded border border-slate-300 px-2 py-1"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {error && <span className="text-sm text-rose-600">{error}</span>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? "Adding…" : "Add order"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
