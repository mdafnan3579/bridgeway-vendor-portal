import { useState } from "react";
import SourceBadge from "./SourceBadge";
import { STATUSES } from "@/lib/constants";

const STATUS_STYLES = {
  ON_TIME: "text-emerald-700",
  LATE: "text-amber-700",
  MISSED: "text-rose-700",
};

const FRESHNESS_LABELS = {
  "nightly-batch": "as of last night's batch",
  monthly: "monthly aggregate",
  "real-time": "real-time",
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded bg-slate-200" />
        </td>
      ))}
    </tr>
  );
}

function StatusCell({ order, onStatusChange }) {
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState(null);

  const handleChange = async (e) => {
    const nextStatus = e.target.value;
    if (nextStatus === order.status) return;
    setSaving(true);
    setRowError(null);
    try {
      await onStatusChange(order, nextStatus);
    } catch (err) {
      setRowError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <select
        value={order.status}
        onChange={handleChange}
        disabled={saving}
        className={`rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium ${STATUS_STYLES[order.status] || ""}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {saving && <span className="text-xs text-slate-400">Saving…</span>}
      {rowError && <span className="text-xs text-rose-600">{rowError}</span>}
    </div>
  );
}

export default function OrdersTable({ orders, loading, onStatusChange }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Store</th>
            <th className="px-4 py-3">Territory</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Delivery Date</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading &&
            orders.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

          {orders.map((order) => (
            <tr key={order.record_id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-700">{order.store_id}</td>
              <td className="px-4 py-3 text-slate-600">{order.territory || "—"}</td>
              <td className="px-4 py-3">
                <StatusCell order={order} onStatusChange={onStatusChange} />
              </td>
              <td className="px-4 py-3 text-slate-600">{order.order_date}</td>
              <td className="px-4 py-3 text-slate-600">
                {order.net_value.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <SourceBadge source={order.source_system} />
                  {order.source_system === "COGNOS" && (
                    <span className="text-xs text-slate-400">
                      {FRESHNESS_LABELS[order.data_freshness]}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {!loading && orders.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                No orders match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
