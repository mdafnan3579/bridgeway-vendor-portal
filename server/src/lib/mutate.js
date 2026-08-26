import { cognosOrders } from "../data/cognos.js";
import { fabricOrderEvents } from "../data/fabric.js";
import { gcpUnifiedOrders } from "../data/gcp.js";

// Manual/demo mutations against the underlying in-memory mock arrays.
// There's no database here — edits and additions live only as long as the
// server process does, same as the rest of the mock data.

// Starts well above the highest order_id already used across the mock
// sources (1000s/2000s/3000s) so manually-added orders never collide with
// an existing one during dedup.
let manualOrderSeq = 9000;

// Updates the status of an already-existing order, wherever its record
// actually lives. Each source stores status differently, so the reverse
// mapping back from the canonical ON_TIME/LATE/MISSED value differs too.
export function updateOrderStatus({ sourceSystem, recordId, status }) {
  if (sourceSystem === "COGNOS") {
    const orderId = Number(recordId.replace("cognos-", ""));
    const row = cognosOrders.find((r) => r.order_id === orderId);
    if (!row) return null;
    row.status = status;
    return row;
  }

  if (sourceSystem === "FABRIC") {
    const row = fabricOrderEvents.find((r) => r.transaction_id === recordId);
    if (!row) return null;
    row.sla_met = status === "ON_TIME";
    row.event_type = status === "MISSED" ? "FAILED" : "DELIVERED";
    return row;
  }

  if (sourceSystem === "GCP") {
    const row = gcpUnifiedOrders.find((r) => r.record_id === recordId);
    if (!row) return null;
    row.status = status;
    row.sla_met = status === "ON_TIME";
    return row;
  }

  return null;
}

// Manually-added orders are written straight into the GCP mock array —
// GCP is both the canonical schema and the highest dedup priority, which
// matches the real intent: an operator adding an order by hand today is
// adding it directly to the migration target, not backfilling a legacy
// system that's being retired.
export function addManualOrder(input) {
  manualOrderSeq += 1;
  const row = {
    order_id: manualOrderSeq,
    record_id: `manual-${manualOrderSeq}`,
    source_system: "GCP",
    order_date: input.orderDate,
    store_id: input.storeId,
    territory: input.territory,
    dc_id: input.dcId || null,
    sku_id: input.skuId,
    cases_ordered: Number(input.casesOrdered),
    net_value: Number(input.netValue),
    status: input.status,
    sla_met: input.status === "ON_TIME",
  };
  gcpUnifiedOrders.push(row);
  return row;
}
