import express from "express";
import cors from "cors";
import "dotenv/config";
import { FIELD_CATALOG } from "@jobsmith/shared";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, fields: FIELD_CATALOG.length });
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});