import { describe, expect, it } from "vitest";
import {
  EVENT_CATALOG,
  USER_FIXED_EVENT_ID,
  formatEventHeaderSubtitle,
  getActiveEventId,
  getEventById,
} from "./events";

describe("events catalogue", () => {
  it("lists Jalsa 2025/2026 + test events", () => {
    expect(EVENT_CATALOG.length).toBeGreaterThanOrEqual(4);
    expect(getEventById("jalsa-2025-islamabad")).toBeDefined();
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

  it("active id is fixed Jalsa 2026 for the app", () => {
    expect(getActiveEventId()).toBe(USER_FIXED_EVENT_ID);
  });

  it("formats header subtitle for multi-day event", () => {
    const ev = getEventById("jalsa-2026-islamabad")!;
    const sub = formatEventHeaderSubtitle(ev);
    expect(sub).toContain("Islamabad");
    expect(sub).toMatch(/\d/);
  });
});
