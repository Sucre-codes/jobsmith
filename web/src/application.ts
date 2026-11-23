import {
  AnalysisResult,
  DraftSchema,
  GenerateResponse,
  type ProfileDraft,
  QaList, type QaItem
} from "@jobsmith/shared";
import type { Analysis } from "./api";

const KEY = "jobsmith:application";
const VERSION = 1;
const MAX_AGE_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

export type SavedApplication = {
  savedAt: number;
  analysis: Analysis;
  draft: ProfileDraft;
  result: GenerateResponse;
  qa: QaItem[];
};

export function saveApplication(app: Omit<SavedApplication, "savedAt">): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, savedAt: Date.now(), ...app }));
  } catch {
    // Storage can be full or blocked. Saving is a convenience, so we ignore failures.
  }
}

export function clearApplication(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}

export function loadApplication(): SavedApplication | null {
  try {
    const text = localStorage.getItem(KEY);
    if (!text) return null;

    const raw = JSON.parse(text);
    const analysis = AnalysisResult.safeParse(raw?.analysis);
    const draft = DraftSchema.safeParse(raw?.draft);
    const result = GenerateResponse.safeParse(raw?.result);
    const savedAt = Number(raw?.savedAt);
    const qa = QaList.safeParse(raw?.qa ?? []);

    if (
      raw?.v !== VERSION ||
      !analysis.success ||
      analysis.data.kind !== "job_posting" ||
      !draft.success ||
      !result.success ||
      !qa.success ||
      !Number.isFinite(savedAt) ||
      Date.now() - savedAt > MAX_AGE_DAYS * DAY_MS
    ) {
      clearApplication();
      return null;
    }

        return {
      savedAt,
      analysis: analysis.data,
      draft: draft.data,
      result: result.data,
      qa: qa.data,
    };
  } catch {
    return null;
  }
}

export function touchApplication(): void {
  const app = loadApplication();
  if (app) {
    saveApplication({ analysis: app.analysis, draft: app.draft, result: app.result, qa: app.qa });
  }
}