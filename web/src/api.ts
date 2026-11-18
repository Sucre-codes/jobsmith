import type { AnalysisResult } from "@jobsmith/shared";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export type Analysis = Extract<AnalysisResult, { kind: "job_posting" }>;

export type AnalyzeOutcome =
  | { ok: true; analysis: Analysis }
  | { ok: false; error: string; retryAfter?: number };

export async function analyze(input: {
  text?: string;
  url?: string;
}): Promise<AnalyzeOutcome> {
  try {
    const res = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (res.ok) return { ok: true, analysis: data as Analysis };
    return {
      ok: false,
      error: String(data.error ?? "failed"),
      retryAfter: data.retryAfter,
    };
  } catch {
    return { ok: false, error: "network" };
  }
}

const PASTE_INSTEAD =
  "This site doesn't allow automatic reading. Open the job, copy its description, and paste it here.";

export function describeError(
  error: string,
  retryAfter?: number
): { message: string; suggestPaste: boolean } {
  switch (error) {
    case "too_short":
      return { message: "That looks too short to be a job description. Paste the full posting.", suggestPaste: false };
    case "not_a_job":
      return { message: "That doesn't look like a job description. Paste the full text of one job posting.", suggestPaste: false };
    case "job_list":
      return { message: "That page lists several jobs. Open the one you want, then paste its link or description.", suggestPaste: false };
    case "invalid_url":
      return { message: "That doesn't look like a valid link. Check it and try again.", suggestPaste: false };
    case "blocked":
    case "unreachable":
    case "page_error":
    case "not_html":
    case "too_large":
    case "too_many_redirects":
    case "bad_redirect":
    case "no_text":
      return { message: PASTE_INSTEAD, suggestPaste: true };
    case "busy":
      return { message: `Jobsmith is busy right now. Try again in about ${retryAfter ?? 30} seconds.`, suggestPaste: false };
    case "unreadable":
      return { message: "We couldn't make sense of that text. Try pasting the description again.", suggestPaste: false };
    case "network":
      return { message: "Can't reach the server. Check your connection and try again.", suggestPaste: false };
    default:
      return { message: "Something went wrong. Please try again.", suggestPaste: false };
  }
}