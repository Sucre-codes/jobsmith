import { DraftSchema, type ProfileDraft } from "@jobsmith/shared";

const KEY = "jobsmith:profiles";
const VERSION = 1;
const MAX_PROFILES = 5;
const MAX_AGE_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

export type SavedProfile = {
  id: string;
  savedAt: number;
  draft: ProfileDraft;
};

function write(list: SavedProfile[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, profiles: list }));
  } catch {
    // Storage can be full or blocked. Saving is a convenience, so we ignore failures.
  }
}

export function listProfiles(): SavedProfile[] {
  try {
    const text = localStorage.getItem(KEY);
    if (!text) return [];
    const raw = JSON.parse(text);
    if (raw?.v !== VERSION || !Array.isArray(raw.profiles)) return [];

    const now = Date.now();
    const kept: SavedProfile[] = [];
    for (const item of raw.profiles) {
      const draft = DraftSchema.safeParse(item?.draft);
      const savedAt = Number(item?.savedAt);
      if (
        typeof item?.id !== "string" ||
        !draft.success ||
        !Number.isFinite(savedAt) ||
        now - savedAt > MAX_AGE_DAYS * DAY_MS
      ) {
        continue;
      }
      kept.push({ id: item.id, savedAt, draft: draft.data });
    }

    if (kept.length !== raw.profiles.length) write(kept);
    return kept.sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

export function saveProfile(draft: ProfileDraft): void {
  const email = draft.basics.email.trim().toLowerCase();
  const others = listProfiles().filter(
    (p) => p.draft.basics.email.trim().toLowerCase() !== email
  );
  const entry: SavedProfile = { id: crypto.randomUUID(), savedAt: Date.now(), draft };
  write([entry, ...others].slice(0, MAX_PROFILES));
}

export function touchProfile(id: string): void {
  write(listProfiles().map((p) => (p.id === id ? { ...p, savedAt: Date.now() } : p)));
}

export function deleteProfile(id: string): void {
  write(listProfiles().filter((p) => p.id !== id));
}

export function clearAllSavedData(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}