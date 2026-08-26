"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchOrders, updateOrderStatus, createOrder, deleteOrder } from "@/lib/api";
import { computeKpis } from "@/lib/kpis";
import KpiBar from "@/components/KpiBar";
import FilterBar from "@/components/FilterBar";
import OrdersTable from "@/components/OrdersTable";
import AddOrderForm from "@/components/AddOrderForm";
import ThemeToggle from "@/components/ThemeToggle";
import StatusBreakdownChart from "@/components/charts/StatusBreakdownChart";
import TerritoryValueChart from "@/components/charts/TerritoryValueChart";
import { ToastProvider, useToast } from "@/components/Toaster";

const EMPTY_FILTERS = { startDate: "", endDate: "", territory: "", dcId: "", status: "" };

function Dashboard() {
  const notify = useToast();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadOrders = useCallback(
    (currentFilters, { silent = false } = {}) => {
      if (!silent) setLoading(true);
      setError(null);
      return fetchOrders(currentFilters)
        .then((data) => setOrders(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    // UX improvement (brief section 5.6): on the first load the table is
    // empty, so a full skeleton is the right call. But on every later
    // filter change we already have a good result set on screen — tearing
    // it down to a blank skeleton on each keystroke/selection would be
    // exactly the kind of "page keeps flashing blank" frustration an
    // operator would hate. So `orders` is only ever replaced once the new
    // response for the new filters lands; the old rows stay visible (dimmed
    // via the `loading` flag) in the meantime instead of disappearing.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount/dependency-change pattern
    loadOrders(filters);
  }, [filters, loadOrders]);

  // Search is client-side only, over whatever the server already returned —
  // it shouldn't trigger a refetch on every keystroke.
  const visibleOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) => o.store_id.toLowerCase().includes(q) || o.sku_id.toLowerCase().includes(q),
    );
  }, [orders, search]);

  const kpis = computeKpis(visibleOrders);

  const handleStatusChange = async (order, status) => {
    try {
      await updateOrderStatus(order, status);
      await loadOrders(filters, { silent: true });
      notify(`${order.store_id} marked ${status.replace("_", " ").toLowerCase()}`);
    } catch (err) {
      notify(err.message, { tone: "error" });
      throw err;
    }
  };

  const handleAddOrder = async (form) => {
    try {
      const row = await createOrder(form);
      setShowAddForm(false);
      await loadOrders(filters, { silent: true });
      notify(`Order added for ${row.store_id}`);
    } catch (err) {
      notify(err.message, { tone: "error" });
      throw err;
    }
  };

  const handleDelete = async (order) => {
    try {
      await deleteOrder(order);
      await loadOrders(filters, { silent: true });
      notify(`Order for ${order.store_id} deleted`);
    } catch (err) {
      notify(err.message, { tone: "error" });
      throw err;
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink-primary)]">Bridgeway Vendor Portal</h1>
          <p className="text-sm text-[var(--ink-muted)]">
            Orders and deliveries unified from Cognos, Tableau, Fabric, and GCP.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded bg-[var(--ink-primary)] px-3 py-1.5 text-sm font-medium text-[var(--page)] hover:opacity-90"
          >
            {showAddForm ? "Close" : "+ Add order"}
          </button>
        </div>
      </header>

      {showAddForm && (
        <AddOrderForm onSubmit={handleAddOrder} onCancel={() => setShowAddForm(false)} />
      )}

      <div className={loading && orders.length > 0 ? "opacity-60 transition-opacity" : ""}>
        <KpiBar kpis={kpis} />
      </div>

      <FilterBar filters={filters} onChange={setFilters} search={search} onSearchChange={setSearch} />

      {error && (
        <div className="rounded-lg border border-[var(--status-critical)]/30 bg-[var(--surface)] px-4 py-3 text-sm text-[var(--status-critical)]">
          Couldn&apos;t reach the federation API: {error}
        </div>
      )}

      <div
        className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${loading && orders.length > 0 ? "opacity-60 transition-opacity" : ""}`}
      >
        <StatusBreakdownChart orders={visibleOrders} />
        <TerritoryValueChart orders={visibleOrders} />
      </div>

      <div className={loading && orders.length > 0 ? "opacity-60 transition-opacity" : ""}>
        <OrdersTable
          orders={visibleOrders}
          loading={loading}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}
