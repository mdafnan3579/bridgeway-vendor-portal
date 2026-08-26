const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// The dashboard only ever calls the federation endpoint, never the 4
// source systems directly — the brief is explicit about this (section 5.1).
export async function fetchOrders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.territory) params.set("territory", filters.territory);
  if (filters.dcId) params.set("dc_id", filters.dcId);
  if (filters.startDate) params.set("start_date", filters.startDate);
  if (filters.endDate) params.set("end_date", filters.endDate);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  const res = await fetch(`${API_BASE}/api/orders${query ? `?${query}` : ""}`);
  if (!res.ok) {
    throw new Error(`Federation API returned ${res.status}`);
  }
  return res.json();
}

export async function updateOrderStatus(order, status) {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(order.record_id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_system: order.source_system, status }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Federation API returned ${res.status}`);
  }
  return res.json();
}

export async function createOrder(input) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Federation API returned ${res.status}`);
  }
  return res.json();
}
