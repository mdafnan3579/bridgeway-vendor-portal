import express from "express";
import cors from "cors";
import cognosRouter from "./routes/cognos.js";
import tableauRouter from "./routes/tableau.js";
import fabricRouter from "./routes/fabric.js";
import gcpRouter from "./routes/gcp.js";
import ordersRouter from "./routes/orders.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// The 4 legacy mock sources being migrated.
app.use("/api/cognos", cognosRouter);
app.use("/api/tableau", tableauRouter);
app.use("/api/fabric", fabricRouter);
app.use("/api/gcp", gcpRouter);

// The federation endpoint — this is what the front end consumes.
app.use("/api/orders", ordersRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Federation API listening on http://localhost:${PORT}`);
});
