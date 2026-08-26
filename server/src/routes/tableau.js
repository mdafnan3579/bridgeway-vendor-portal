import { Router } from "express";
import { tableauTerritoryKpis } from "../data/tableau.js";

const router = Router();

router.get("/v2/territory-kpis", (req, res) => {
  res.json(tableauTerritoryKpis);
});

export default router;
