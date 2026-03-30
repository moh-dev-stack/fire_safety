import { describe, expect, it } from "vitest";
import { incidentCreateSchema, SITE_LOCATIONS } from "./incident";

describe("incidentCreateSchema", () => {
  it("accepts a complete valid payload", () => {
    const parsed = incidentCreateSchema.parse({
      incident_date: "2026-07-24",
      incident_time: "14:00",
      incident_type: "Equipment",
      severity: "High",
      location: SITE_LOCATIONS[0],
      description: "Loose cable across walkway.",
      actions_taken: "Cordoned off.",
      reporter_name: "A. Khan",
    });
    expect(parsed.incident_type).toBe("Equipment");
    expect(parsed.severity).toBe("High");
    expect(parsed.reporter_name).toBe("A. Khan");
  });

  it("rejects empty reporter name", () => {
    expect(() =>
      incidentCreateSchema.parse({
        incident_date: "2026-07-24",
        incident_time: "09:00",
        incident_type: "Other",
        severity: "Medium",
        location: "Fire & safety control / duty office",
        description: "Test",
        actions_taken: "None",
        reporter_name: "",
      }),
    ).toThrow();
  });

  it("rejects legacy long incident_type labels (form must send codes)", () => {
    expect(() =>
      incidentCreateSchema.parse({
        incident_date: "2026-07-24",
        incident_time: "09:00",
        incident_type: "Other (fire & safety)",
        severity: "Medium",
        location: SITE_LOCATIONS[0],
        description: "Test",
        actions_taken: "None",
        reporter_name: "X",
      }),
    ).toThrow();
  });

  it("rejects empty location", () => {
    expect(() =>
      incidentCreateSchema.parse({
        incident_date: "2026-07-24",
        incident_time: "14:00",
        incident_type: "Other",
        severity: "Medium",
        location: "",
        description: "Test",
        actions_taken: "None",
        reporter_name: "X",
      }),
    ).toThrow();
  });

  it("rejects time not in slot list", () => {
    expect(() =>
      incidentCreateSchema.parse({
        incident_date: "2026-07-24",
        incident_time: "14:15",
        incident_type: "Other",
        severity: "Medium",
        location: SITE_LOCATIONS[0],
        description: "Test",
        actions_taken: "None",
        reporter_name: "X",
      }),
    ).toThrow();
  });
});
