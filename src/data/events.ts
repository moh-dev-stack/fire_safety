/**
 * Event catalogue for the POC — each entry is an "event" with ISO dates (YYYY-MM-DD)
 * used for incident reporting and header copy. Switch the active event via env (see below).
 */
export type EventDefinition = {
  id: string;
  /** Full title for docs / optional UI */
  name: string;
  /** Short line for app chrome */
  shortLabel: string;
  venue: string;
  /** Operating days on site (incident date picker uses this list) */
  dates: readonly string[];
};

export const EVENT_CATALOG: readonly EventDefinition[] = [
  {
    id: "jalsa-2026-islamabad",
    name: "Jalsa Salana 2026 · Islamabad, UK",
    shortLabel: "Jalsa 2026 · Fire & Safety",
    venue: "Islamabad, UK",
    dates: ["2026-07-24", "2026-07-25", "2026-07-26"],
  },
  {
    id: "test-fire-drill-mar-2026",
    name: "POC — Test fire drill weekend (fictional dates)",
    shortLabel: "TEST · Fire drill weekend",
    venue: "Training site (test data)",
    dates: ["2026-03-14", "2026-03-15", "2026-03-16"],
  },
  {
    id: "test-winter-ops-2026",
    name: "POC — Winter ops rehearsal (fictional dates)",
    shortLabel: "TEST · Winter ops",
    venue: "Northern camp (test data)",
    dates: ["2026-01-10", "2026-01-11"],
  },
] as const;

const DEFAULT_EVENT_ID = "jalsa-2026-islamabad";

/**
 * Active event id: `EVENT_ID` or `VITE_EVENT_ID` from `.env.local` / deploy env, else default.
 * - Local API (`scripts/local-api.ts`) reads dotenv → use `EVENT_ID` or `VITE_EVENT_ID`.
 * - Vite client inlines `import.meta.env.VITE_EVENT_ID` at build time.
 */
export function getActiveEventId(): string {
  const fromProcess =
    typeof process !== "undefined" && process.env
      ? process.env.EVENT_ID || process.env.VITE_EVENT_ID
      : undefined;
  const fromVite =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_EVENT_ID
      ? (import.meta.env.VITE_EVENT_ID as string)
      : undefined;
  const raw = (fromProcess || fromVite || "").trim();
  if (raw) return raw;
  return DEFAULT_EVENT_ID;
}

export function getEventById(id: string): EventDefinition | undefined {
  return EVENT_CATALOG.find((e) => e.id === id);
}

export function getActiveEvent(): EventDefinition {
  const id = getActiveEventId();
  const found = getEventById(id);
  if (found) return found;
  return getEventById(DEFAULT_EVENT_ID)!;
}

/** Subtitle under the app title: compact date span · venue */
export function formatEventHeaderSubtitle(event: EventDefinition): string {
  const sorted = [...event.dates].sort();
  if (sorted.length === 0) return event.venue;
  if (sorted.length === 1) {
    const line = new Date(sorted[0] + "T12:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${line} · ${event.venue}`;
  }
  const f = new Date(sorted[0] + "T12:00:00");
  const l = new Date(sorted[sorted.length - 1] + "T12:00:00");
  const d1 = f.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const d2 = l.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${d1}–${d2} · ${event.venue}`;
}
