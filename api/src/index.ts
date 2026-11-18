import express from "express";
import cors from "cors";
import "dotenv/config";
import { FIELD_CATALOG } from "@jobsmith/shared";
import { getPool } from "./ai/keyPool.js";
import { AiBusyError } from "./ai/client.js";
import { analyzeJob, AnalysisError } from "./ai/analyze.js";
import { fetchPage, LinkError } from "./link/safeFetch.js";
import { extractJobText } from "./link/extract.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  const pool = getPool();
  res.json({
    ok: true,
    fields: FIELD_CATALOG.length,
    keys: { total: pool.size, available: pool.available() },
  });
});

app.post("/analyze", async (req, res) => {
  const body = req.body ?? {};

  try {
    let text = "";
    if (typeof body.url === "string" && body.url.trim()) {
      const { html } = await fetchPage(body.url.trim());
      text = extractJobText(html);
    } else if (typeof body.text === "string") {
      text = body.text.trim();
    }

    if (text.length < 50) {
      res.status(400).json({ error: "too_short" });
      return;
    }

    const result = await analyzeJob(text);
    if (result.kind !== "job_posting") {
      res.status(422).json({ error: result.kind });
      return;
    }
    res.json(result);
  } catch (err) {
    if (err instanceof LinkError) {
      res.status(422).json({ error: err.code });
      return;
    }
    if (err instanceof AiBusyError) {
      res.setHeader("Retry-After", String(err.retryAfter));
      res.status(503).json({ error: "busy", retryAfter: err.retryAfter });
      return;
    }
    if (err instanceof AnalysisError) {
      res.status(422).json({ error: "unreadable" });
      return;
    }
    console.error(err instanceof Error ? err.message : err);
    res.status(500).json({ error: "ai_failed" });
  }
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});