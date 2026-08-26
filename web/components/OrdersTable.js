import { useMemo, useState } from "react";
import SourceBadge from "./SourceBadge";
import { STATUSES } from "@/lib/constants";

const STATUS_STYLES = {
  ON_TIME: "text-[var(--status-good)]",
  LATE: "text-[var(--status-warning)]",
  MISSED: "text-[var(--status-critical)]",
};

const FRESHNESS_LABELS = {
  "nightly-batch": "as of last night's batch",
  monthly: "monthly aggregate",
  "real-time": "real-time",
};

const COLUMNS = [
  { key: "store_id", label: "Store" },
  { key: "territory", label: "Territory" },
  { key: "status", label: "Status" },
  { key: "order_date", label: "Delivery Date" },
  { key: "net_value", label: "Value" },
  { key: "source_system", label: "Source" },
];

function SortIcon({ direction }) {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0" fill="none">
      <path
        d="M3 4.5L6 1.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={direction === "asc" ? 1 : 0.3}
      />
      <path
        d="M3 7.5L6 10.5L9 7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={direction === "desc" ? 1 : 0.3}
      />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded bg-[var(--surface-2)]" />
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
        className={`rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-medium ${STATUS_STYLES[order.status] || ""}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {saving && <span className="text-xs text-[var(--ink-muted)]">Saving…</span>}
      {rowError && <span className="text-xs text-[var(--status-critical)]">{rowError}</span>}
    </div>
  );
}

function DeleteCell({ order, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rowError, setRowError] = useState(null);

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <span className="text-[var(--ink-secondary)]">Delete?</span>
        <button
          type="button"
          disabled={deleting}
          onClick={async () => {
            setDeleting(true);
            setRowError(null);
            try {
              await onDelete(order);
            } catch (err) {
              setRowError(err.message);
              setDeleting(false);
              setConfirming(false);
            }
          }}
          className="rounded bg-[var(--status-critical)] px-2 py-1 font-medium text-white disabled:opacity-50"
        >
          {deleting ? "…" : "Yes"}
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => setConfirming(false)}
          className="rounded border border-[var(--border)] px-2 py-1 text-[var(--ink-secondary)]"
        >
          Cancel
        </button>
        {rowError && <span className="text-[var(--status-critical)]">{rowError}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Delete order for ${order.store_id}`}
      className="rounded p-1.5 text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--status-critical)]"
    >
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
        <path
          d="M3 4.5h10M6.5 4.5V3a1 1 0 011-1h1a1 1 0 011 1v1.5M6 7.5v4M10 7.5v4M4 4.5l.6 8.4a1 1 0 001 .9h4.8a1 1 0 001-.9l.6-8.4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function OrdersTable({ orders, loading, onStatusChange, onDelete }) {
  const [sort, setSort] = useState({ key: "order_date", direction: "desc" });

  const sortedOrders = useMemo(() => {
    const copy = [...orders];
    copy.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      let cmp;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      }
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [orders, sort]);

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, direction: s.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }));
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <table className="min-w-full divide-y divide-[var(--gridline)] text-sm">
        <thead className="bg-[var(--surface-2)] text-left text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort(col.key)}
                  className="flex items-center gap-1 hover:text-[var(--ink-secondary)]"
                >
                  {col.label}
                  <SortIcon direction={sort.key === col.key ? sort.direction : null} />
                </button>
              </th>
            ))}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--gridline)]">
          {loading &&
            orders.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}

          {sortedOrders.map((order) => (
            <tr key={order.record_id} className="hover:bg-[var(--surface-2)]">
              <td className="px-4 py-3 font-medium text-[var(--ink-primary)]">{order.store_id}</td>
              <td className="px-4 py-3 text-[var(--ink-secondary)]">{order.territory || "—"}</td>
              <td className="px-4 py-3">
                <StatusCell order={order} onStatusChange={onStatusChange} />
              </td>
              <td className="px-4 py-3 text-[var(--ink-secondary)]">{order.order_date}</td>
              <td className="px-4 py-3 text-[var(--ink-secondary)]">
                {order.net_value.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <SourceBadge source={order.source_system} />
                  {order.source_system === "COGNOS" && (
                    <span className="text-xs text-[var(--ink-muted)]">
                      {FRESHNESS_LABELS[order.data_freshness]}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <DeleteCell order={order} onDelete={onDelete} />
              </td>
            </tr>
          ))}

          {!loading && orders.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length + 1} className="px-4 py-8 text-center text-[var(--ink-muted)]">
                No orders match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
