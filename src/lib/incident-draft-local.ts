import {
  type IncidentDraft,
  parseStoredIncidentDraft,
} from "../model/incident";

const STORAGE_KEY = "jalsa-incident-draft-v1";

type Stored = { v: 1; savedAt: number; draft: IncidentDraft };

export function loadLocalIncidentDraftMeta(): {
  savedAt: number;
  draft: IncidentDraft;
} | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as unknown;
    if (typeof p !== "object" || p === null || !("draft" in p)) return null;
    const st = p as Stored;
    const draft = parseStoredIncidentDraft(st.draft);
    if (!draft) return null;
    const savedAt =
      typeof st.savedAt === "number" && Number.isFinite(st.savedAt)
        ? st.savedAt
        : 0;
    return { savedAt, draft };
  } catch {
    return null;
  }
}

export function saveLocalIncidentDraft(draft: IncidentDraft): void {
  if (typeof localStorage === "undefined") return;
  try {
    const payload: Stored = { v: 1, savedAt: Date.now(), draft };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function clearLocalIncidentDraft(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
