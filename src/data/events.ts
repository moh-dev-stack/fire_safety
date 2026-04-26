/**
 * Event catalogue for the POC - each entry is an "event" with ISO dates (YYYY-MM-DD)
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
    id: "jalsa-2025-islamabad",
    name: "Jalsa Salana 2025 · Islamabad, UK",
    shortLabel: "Jalsa 2025 · Fire & Safety",
    venue: "Islamabad, UK",
    dates: ["2025-07-25", "2025-07-26", "2025-07-27"],
  },
  {
    id: "jalsa-2026-islamabad",
    name: "Jalsa Salana 2026 · Islamabad, UK",
    shortLabel: "Jalsa 2026 · Fire & Safety",
    venue: "Islamabad, UK",
    dates: ["2026-07-24", "2026-07-25", "2026-07-26"],
  },
  {
    id: "test-fire-drill-mar-2026",
    name: "POC - Test fire drill weekend (fictional dates)",
    shortLabel: "TEST · Fire drill weekend",
    venue: "Training site (test data)",
    dates: ["2026-03-14", "2026-03-15", "2026-03-16"],
  },
  {
    id: "test-winter-ops-2026",
    name: "POC - Winter ops rehearsal (fictional dates)",
    shortLabel: "TEST · Winter ops",
    venue: "Northern camp (test data)",
    dates: ["2026-01-10", "2026-01-11"],
  },
] as const;

/** Every catalog id (for Zod, API, and the incidents table). */
export const CATALOG_EVENT_IDS: [string, ...string[]] = [
  EVENT_CATALOG[0].id,
  ...EVENT_CATALOG.slice(1).map((e) => e.id),
];

const DEFAULT_EVENT_ID = "jalsa-2026-islamabad";

/** User tier always uses this event in the UI (no selector). */
export const USER_FIXED_EVENT_ID = "jalsa-2026-islamabad" as const;

/** Admin can switch the app view between these (order = dropdown order). */
export const ADMIN_EVENT_SELECTOR_IDS: readonly string[] = [
  "jalsa-2026-islamabad",
  "jalsa-2025-islamabad",
] as const;

/** All on-site days from the catalogue, for API / Zod (any event may be reported). */
export function getAllCatalogIncidentDates(): [string, ...string[]] {
  const s = new Set<string>();
  for (const e of EVENT_CATALOG) {
    for (const d of e.dates) s.add(d);
  }
  const sorted = [...s].sort();
  if (sorted.length === 0) {
    return ["1970-01-01"];
  }
  return sorted as [string, ...string[]];
}

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
  const fromVite = (() => {
    if (typeof import.meta === "undefined") return undefined;
    const m = import.meta as unknown as { env?: { VITE_EVENT_ID?: string } };
    const id = m.env?.VITE_EVENT_ID;
    return typeof id === "string" ? id : undefined;
  })();
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

/** Human-readable list of on-site days for the event (en-GB). */
export function formatEventOnSiteDays(event: EventDefinition): string {
  const sorted = [...event.dates].sort();
  if (sorted.length === 0) return "No dates in catalogue";
  return sorted
    .map((iso) =>
      new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    )
    .join(", ");
}
