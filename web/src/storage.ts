import { AnalysisResult, DraftSchema, GenerateResponse, type ProfileDraft } from "@jobsmith/shared";
import type { Analysis } from "./api";


const KEY = "jobsmith:session";
const VERSION = 3;

export type Session = {
  analysis: Analysis;
  draft: ProfileDraft;
  step: number;
  result: GenerateResponse | null;
};

export function saveSession(session: Session): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ v: VERSION, ...session }));
  } catch {
    // Storage can be full or blocked (some private modes). The app still works without it.
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}

export function loadSession(): Session | null {
  try {
    const text = sessionStorage.getItem(KEY);
    if (!text) return null;

    const raw = JSON.parse(text);
    const analysis = AnalysisResult.safeParse(raw?.analysis);
    const draft = DraftSchema.safeParse(raw?.draft);
    const step = Number(raw?.step);
    const resultCheck =
      raw?.result == null ? null : GenerateResponse.safeParse(raw.result);

    if (
      raw?.v !== VERSION ||
      !analysis.success ||
      analysis.data.kind !== "job_posting" ||
      !draft.success ||
      !Number.isInteger(step) ||
        step < 0 ||
      (resultCheck !== null && !resultCheck.success)
    ) {
      clearSession();
      return null;
    }

       return {
      analysis: analysis.data,
      draft: draft.data,
      step,
      result: resultCheck && resultCheck.success ? resultCheck.data : null,
    };
  } catch {
    return null;
  }
}