import { Router } from "express";
import { cognosOrders } from "../data/cognos.js";
import { fabricOrderEvents } from "../data/fabric.js";
import { gcpUnifiedOrders } from "../data/gcp.js";
import { normalizeCognos, normalizeFabric, normalizeGcp } from "../lib/normalize.js";
import { dedupeByOrderId } from "../lib/dedup.js";
import { updateOrderStatus, addManualOrder, deleteOrder } from "../lib/mutate.js";

const router = Router();

const VALID_STATUSES = ["ON_TIME", "LATE", "MISSED"];

// The federation endpoint: fans out to the 4 mock sources (here, by
// importing their data directly rather than an HTTP round-trip to
// ourselves — simplest option per the brief), normalizes each into the
// canonical schema, then dedupes by order_id.
router.get("/", (req, res) => {
  const normalized = [
    ...cognosOrders.map(normalizeCognos),
    ...fabricOrderEvents.map(normalizeFabric),
    ...gcpUnifiedOrders.map(normalizeGcp),
  ];

  let unified = dedupeByOrderId(normalized);

  const { territory, dc_id, start_date, end_date, status } = req.query;
  if (territory) unified = unified.filter((r) => r.territory === territory);
  if (dc_id) unified = unified.filter((r) => r.dc_id === dc_id);
  if (start_date) unified = unified.filter((r) => r.order_date >= start_date);
  if (end_date) unified = unified.filter((r) => r.order_date <= end_date);
  if (status) unified = unified.filter((r) => r.status === status);

  res.json(unified);
});

// Update the status of an existing order in place, in whichever source it
// actually lives (see lib/mutate.js for the per-source reverse mapping).
router.patch("/:recordId", (req, res) => {
  const { source_system, status } = req.body || {};

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }
  if (!source_system) {
    return res.status(400).json({ error: "source_system is required" });
  }

  const updated = updateOrderStatus({
    sourceSystem: source_system,
    recordId: req.params.recordId,
    status,
  });

  if (!updated) {
    return res.status(404).json({ error: "order not found" });
  }

  res.json({ ok: true });
});

// Manually add a new order. Written straight into the GCP mock source —
// see lib/mutate.js for why.
router.post("/", (req, res) => {
  const { storeId, territory, dcId, skuId, casesOrdered, netValue, status, orderDate } = req.body || {};

  if (!storeId || !territory || !skuId || !orderDate || !casesOrdered || !netValue) {
    return res.status(400).json({
      error: "storeId, territory, skuId, orderDate, casesOrdered, and netValue are all required",
    });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }

  const row = addManualOrder({ storeId, territory, dcId, skuId, casesOrdered, netValue, status, orderDate });
  res.status(201).json(row);
});

// Delete an order in place, wherever it lives.
router.delete("/:recordId", (req, res) => {
  const { source_system } = req.query;

  if (!source_system) {
    return res.status(400).json({ error: "source_system is required" });
  }

  const deleted = deleteOrder({ sourceSystem: source_system, recordId: req.params.recordId });

  if (!deleted) {
    return res.status(404).json({ error: "order not found" });
  }

  res.json({ ok: true });
});

export default router;
