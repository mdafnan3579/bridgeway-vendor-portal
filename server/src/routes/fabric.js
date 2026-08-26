import { Router } from "express";
import { fabricOrderEvents } from "../data/fabric.js";

const router = Router();

router.get("/v1/order-events", (req, res) => {
  // Public contract matches the brief's exact schema; the internal order_id
  // used for cross-source dedup is stripped before this response goes out.
  res.json(fabricOrderEvents.map(({ order_id, ...rest }) => rest));
});

export default router;
