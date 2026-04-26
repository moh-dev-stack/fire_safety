/**
 * Event catalogue for the POC. The app currently uses a single default Jalsa (2026) for
 * header copy and incident on-site dates.
 */
export type EventDefinition = {
  id: string;
  name: string;
  shortLabel: string;
  venue: string;
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

const DEFAULT_EVENT_ID = "jalsa-2026-islamabad";

export const USER_FIXED_EVENT_ID = "jalsa-2026-islamabad" as const;

export function getEventById(id: string): EventDefinition | undefined {
  return EVENT_CATALOG.find((e) => e.id === id);
}

export function getActiveEventId(): string {
  return DEFAULT_EVENT_ID;
}

export function getActiveEvent(): EventDefinition {
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
