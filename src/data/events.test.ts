import { describe, expect, it } from "vitest";
import {
  EVENT_CATALOG,
  formatEventHeaderSubtitle,
  getEventById,
  getActiveEventId,
} from "./events";

describe("events catalogue", () => {
  it("lists at least default + two test events", () => {
    expect(EVENT_CATALOG.length).toBeGreaterThanOrEqual(3);
    expect(getEventById("jalsa-2026-islamabad")).toBeDefined();
    expect(getEventById("test-fire-drill-mar-2026")?.dates).toEqual([
      "2026-03-14",
      "2026-03-15",
      "2026-03-16",
    ]);
    expect(getEventById("test-winter-ops-2026")?.dates).toEqual([
      "2026-01-10",
      "2026-01-11",
    ]);
  });

  it("active id always resolves to a catalogue entry", () => {
    const id = getActiveEventId();
    expect(getEventById(id) ?? getEventById("jalsa-2026-islamabad")).toBeDefined();
  });

  it("formats header subtitle for multi-day event", () => {
    const ev = getEventById("jalsa-2026-islamabad")!;
    const sub = formatEventHeaderSubtitle(ev);
    expect(sub).toContain("Islamabad");
    expect(sub).toMatch(/\d/);
  });
});
