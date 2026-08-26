// System 3 — Fabric: near-real-time event stream.
//
// Assumption: the brief's Fabric schema has no order_id, but the federation
// endpoint must dedupe "by order_id" across sources. For this mock build we
// attach a synthetic `order_id` to rows that correlate with a Cognos/GCP
// order, so the dedup logic has something to join on. In a real migration
// this correlation would come from a cross-reference table, not a shared
// literal ID. See docs/architecture.md.
export const fabricOrderEvents = [
  { order_id: 1002, transaction_id: "b3f1a2c4-11e2-4d3a-9b5a-000000000001", transaction_ts: "2026-08-14T09:12:00Z", store_id: "ST-211", dc_id: "DC-CHI", sku_id: "SKU-3390", cases_ordered: 18, net_value: 1204.0, sla_met: false, event_type: "DELIVERED" },
  { order_id: 1005, transaction_id: "b3f1a2c4-11e2-4d3a-9b5a-000000000002", transaction_ts: "2026-08-16T14:45:00Z", store_id: "ST-422", dc_id: "DC-LAX", sku_id: "SKU-5502", cases_ordered: 33, net_value: 2970.0, sla_met: false, event_type: "DELIVERED" },
  { order_id: 2001, transaction_id: "b3f1a2c4-11e2-4d3a-9b5a-000000000003", transaction_ts: "2026-08-17T08:03:00Z", store_id: "ST-118", dc_id: "DC-ATL", sku_id: "SKU-2201", cases_ordered: 28, net_value: 2100.0, sla_met: true, event_type: "DELIVERED" },
  { order_id: 2002, transaction_id: "b3f1a2c4-11e2-4d3a-9b5a-000000000004", transaction_ts: "2026-08-17T11:30:00Z", store_id: "ST-260", dc_id: "DC-NYC", sku_id: "SKU-1187", cases_ordered: 15, net_value: 1350.0, sla_met: true, event_type: "DISPATCHED" },
  { order_id: 2003, transaction_id: "b3f1a2c4-11e2-4d3a-9b5a-000000000005", transaction_ts: "2026-08-18T06:50:00Z", store_id: "ST-345", dc_id: "DC-HOU", sku_id: "SKU-4471", cases_ordered: 40, net_value: 3000.0, sla_met: false, event_type: "FAILED" },
  { order_id: 2004, transaction_id: "b3f1a2c4-11e2-4d3a-9b5a-000000000006", transaction_ts: "2026-08-18T16:20:00Z", store_id: "ST-119", dc_id: "DC-DEN", sku_id: "SKU-6610", cases_ordered: 22, net_value: 1540.0, sla_met: true, event_type: "DELIVERED" },
];
