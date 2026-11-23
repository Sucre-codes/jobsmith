import express from "express";
import cors from "cors";
import "dotenv/config";
import { FIELD_CATALOG, GenerateRequest, GenerateResponse, AnswerRequest, AnswerResponse} from "@jobsmith/shared";
import { getPool } from "./ai/keyPool.js";
import { AiBusyError } from "./ai/client.js";
import { analyzeJob, AnalysisError } from "./ai/analyze.js";
import { fetchPage, LinkError } from "./link/safeFetch.js";
import { extractJobText } from "./link/extract.js";
import { writeResume, WriteError } from "./ai/write.js";
import { answerQuestion, AnswerError } from "./ai/answer.js";

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

app.post("/generate", async (req, res) => {
  const parsed = GenerateRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const { profile } = parsed.data;
  if (profile.experience.length + profile.education.length + profile.projects.length === 0) {
    res.status(400).json({ error: "not_enough_details" });
    return;
  }

  try {
    const result = await writeResume(parsed.data);

    const checked = GenerateResponse.safeParse(result);
    if (!checked.success) {
      console.error("generate: the finished resume failed its own check");
      res.status(500).json({ error: "ai_failed" });
      return;
    }

    res.json(checked.data);
  } catch (err) {
    if (err instanceof AiBusyError) {
      res.setHeader("Retry-After", String(err.retryAfter));
      res.status(503).json({ error: "busy", retryAfter: err.retryAfter });
      return;
    }
    if (err instanceof WriteError) {
      res.status(422).json({ error: "write_failed" });
      return;
    }
    console.error(err instanceof Error ? err.message : err);
    res.status(500).json({ error: "ai_failed" });
  }
});

app.post("/answer", async (req, res) => {
  const parsed = AnswerRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const { profile } = parsed.data;
  if (profile.experience.length + profile.education.length + profile.projects.length === 0) {
    res.status(400).json({ error: "not_enough_details" });
    return;
  }

  try {
    const result = await answerQuestion(parsed.data);

    const checked = AnswerResponse.safeParse(result);
    if (!checked.success) {
      console.error("answer: the finished answer failed its own check");
      res.status(500).json({ error: "ai_failed" });
      return;
    }

    res.json(checked.data);
  } catch (err) {
    if (err instanceof AiBusyError) {
      res.setHeader("Retry-After", String(err.retryAfter));
      res.status(503).json({ error: "busy", retryAfter: err.retryAfter });
      return;
    }
    if (err instanceof AnswerError) {
      res.status(422).json({ error: "answer_failed" });
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