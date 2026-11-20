import {
  GenerateResponse,
  Profile,
  emptyProfile,
  type GenerateRequest,
  type ProfileDraft,
} from "@jobsmith/shared";
import { API_URL, type Analysis } from "./api";

export function describeGenerateError(error: string, retryAfter?: number): string {
  switch (error) {
    case "invalid_request":
      return "Some details need fixing. Use Back to check each page.";
    case "not_enough_details":
      return "Add at least one job, school or project, so there is something to write from.";
    case "busy":
      return `Jobsmith is busy right now. Try again in about ${retryAfter ?? 30} seconds.`;
    case "write_failed":
      return "We couldn't write a good resume this time. Please try again.";
    case "network":
      return "Can't reach the server. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function buildRequest(
  analysis: Analysis,
  draft: ProfileDraft
): { ok: true; request: GenerateRequest } | { ok: false; message: string } {
  const source = draft as unknown as Record<string, unknown>;
  const copy: Record<string, unknown> = { ...emptyProfile(), basics: draft.basics };
  for (const f of analysis.fields) copy[f.key] = source[f.key];

  const parsed = Profile.safeParse(copy);
  if (!parsed.success) {
    return { ok: false, message: describeGenerateError("invalid_request") };
  }

  const profile = parsed.data;
  if (profile.experience.length + profile.education.length + profile.projects.length === 0) {
    return { ok: false, message: describeGenerateError("not_enough_details") };
  }

  const keywords = [...new Set(analysis.fields.flatMap((f) => f.options))].slice(0, 50);

  return {
    ok: true,
    request: {
      jobText: analysis.jobText,
      job: {
        title: analysis.title,
        company: analysis.company ?? "",
        roleType: analysis.roleType,
        keywords,
      },
      profile,
    },
  };
}

export type GenerateOutcome =
  | { ok: true; result: GenerateResponse }
  | { ok: false; error: string; retryAfter?: number };

export async function generate(request: GenerateRequest): Promise<GenerateOutcome> {
  try {
    const res = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(90_000),
    });
    const data = await res.json();

    if (res.ok) {
      const parsed = GenerateResponse.safeParse(data);
      if (parsed.success) return { ok: true, result: parsed.data };
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