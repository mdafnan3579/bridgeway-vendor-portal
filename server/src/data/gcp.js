// System 4 — GCP/BigQuery: canonical schema, the migration target.
//
// Assumption: same synthetic `order_id` correlation field as fabric.js,
// added only so the mock dedup logic can join across sources. It is
// stripped from the final federation response. See docs/architecture.md.
export const gcpUnifiedOrders = [
  { order_id: 1001, record_id: "c7d2e5a1-2222-4a11-8b1c-000000000001", source_system: "GCP", order_date: "2026-08-10", store_id: "ST-104", territory: "Southeast", dc_id: "DC-ATL", sku_id: "SKU-2201", cases_ordered: 42, net_value: 3150.5, status: "ON_TIME", sla_met: true },
  { order_id: 1002, record_id: "c7d2e5a1-2222-4a11-8b1c-000000000002", source_system: "GCP", order_date: "2026-08-11", store_id: "ST-211", territory: "Midwest", dc_id: "DC-CHI", sku_id: "SKU-3390", cases_ordered: 18, net_value: 1204.0, status: "LATE", sla_met: false },
  { order_id: 3001, record_id: "c7d2e5a1-2222-4a11-8b1c-000000000003", source_system: "GCP", order_date: "2026-08-19", store_id: "ST-501", territory: "Southeast", dc_id: "DC-ATL", sku_id: "SKU-2201", cases_ordered: 36, net_value: 2700.0, status: "ON_TIME", sla_met: true },
  { order_id: 3002, record_id: "c7d2e5a1-2222-4a11-8b1c-000000000004", source_system: "GCP", order_date: "2026-08-19", store_id: "ST-602", territory: "West Coast", dc_id: "DC-LAX", sku_id: "SKU-5502", cases_ordered: 27, net_value: 2430.0, status: "ON_TIME", sla_met: true },
  { order_id: 3003, record_id: "c7d2e5a1-2222-4a11-8b1c-000000000005", source_system: "GCP", order_date: "2026-08-20", store_id: "ST-703", territory: "Northeast", dc_id: "DC-NYC", sku_id: "SKU-7788", cases_ordered: 19, net_value: 1444.0, status: "LATE", sla_met: false },
  { order_id: 3004, record_id: "c7d2e5a1-2222-4a11-8b1c-000000000006", source_system: "GCP", order_date: "2026-08-20", store_id: "ST-804", territory: "Southwest", dc_id: "DC-HOU", sku_id: "SKU-4471", cases_ordered: 31, net_value: 2325.0, status: "ON_TIME", sla_met: true },
  { order_id: 3005, record_id: "c7d2e5a1-2222-4a11-8b1c-000000000007", source_system: "GCP", order_date: "2026-08-21", store_id: "ST-905", territory: "Mountain Central", dc_id: "DC-DEN", sku_id: "SKU-6610", cases_ordered: 14, net_value: 980.0, status: "MISSED", sla_met: false },
];
