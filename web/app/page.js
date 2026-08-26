"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchOrders, updateOrderStatus, createOrder } from "@/lib/api";
import { computeKpis } from "@/lib/kpis";
import KpiBar from "@/components/KpiBar";
import FilterBar from "@/components/FilterBar";
import OrdersTable from "@/components/OrdersTable";
import AddOrderForm from "@/components/AddOrderForm";

const EMPTY_FILTERS = { startDate: "", endDate: "", territory: "", dcId: "", status: "" };

export default function Home() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
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

  const kpis = computeKpis(orders);

  const handleStatusChange = async (order, status) => {
    await updateOrderStatus(order, status);
    await loadOrders(filters, { silent: true });
  };

  const handleAddOrder = async (form) => {
    await createOrder(form);
    setShowAddForm(false);
    await loadOrders(filters, { silent: true });
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bridgeway Vendor Portal</h1>
          <p className="text-sm text-slate-500">
            Orders and deliveries unified from Cognos, Tableau, Fabric, and GCP.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="shrink-0 rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          {showAddForm ? "Close" : "+ Add order"}
        </button>
      </header>

      {showAddForm && (
        <AddOrderForm onSubmit={handleAddOrder} onCancel={() => setShowAddForm(false)} />
      )}

      <div className={loading && orders.length > 0 ? "opacity-60 transition-opacity" : ""}>
        <KpiBar kpis={kpis} />
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Couldn&apos;t reach the federation API: {error}
        </div>
      )}

      <div className={loading && orders.length > 0 ? "opacity-60 transition-opacity" : ""}>
        <OrdersTable orders={orders} loading={loading} onStatusChange={handleStatusChange} />
      </div>
    </main>
  );
}
