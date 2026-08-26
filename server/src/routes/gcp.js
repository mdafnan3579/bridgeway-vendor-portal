import { Router } from "express";
import { gcpUnifiedOrders } from "../data/gcp.js";

const router = Router();

router.get("/v1/unified-orders", (req, res) => {
  // Public contract matches the brief's exact schema; the internal order_id
  // used for cross-source dedup is stripped before this response goes out.
  res.json(gcpUnifiedOrders.map(({ order_id, ...rest }) => rest));
});

export default router;
