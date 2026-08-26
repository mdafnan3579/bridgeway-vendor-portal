import { Router } from "express";
import { cognosOrders } from "../data/cognos.js";

const router = Router();

router.get("/v1/orders", (req, res) => {
  res.json(cognosOrders);
});

export default router;
