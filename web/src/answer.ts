import { AnswerResponse, type AnswerRequest } from "@jobsmith/shared";
import { API_URL } from "./api";

export type AnswerOutcome =
  | { ok: true; reply: AnswerResponse }
  | { ok: false; error: string; retryAfter?: number };

export function describeAnswerError(error: string, retryAfter?: number): string {
  switch (error) {
    case "invalid_request":
      return "Check the question and your details, then try again.";
    case "not_enough_details":
      return "Add at least one job, school or project first.";
    case "busy":
      return `Jobsmith is busy right now. Try again in about ${retryAfter ?? 30} seconds.`;
    case "answer_failed":
      return "We couldn't write a good answer this time. Please try again.";
    case "network":
      return "Can't reach the server. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export async function askQuestion(request: AnswerRequest): Promise<AnswerOutcome> {
  try {
    const res = await fetch(`${API_URL}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(60_000),
    });
    const data = await res.json();

    if (res.ok) {
      const parsed = AnswerResponse.safeParse(data);
      if (parsed.success) return { ok: true, reply: parsed.data };
      return { ok: false, error: "failed" };
    }
    return {
      ok: false,
      error: String(data.error ?? "failed"),
      retryAfter: data.retryAfter,
    };
  } catch {
    return { ok: false, error: "network" };
  }
}