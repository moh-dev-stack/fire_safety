import { describe, expect, it } from "vitest";
import {
  incidentCreateSchema,
  isPlausibleIncidentW3w,
  SITE_LOCATIONS,
} from "./incident";

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
      department: "Fire team",
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
        department: "Ops",
      }),
    ).toThrow();
  });

  it("rejects empty department", () => {
    expect(() =>
      incidentCreateSchema.parse({
        incident_date: "2026-07-24",
        incident_time: "09:00",
        incident_type: "Other",
        severity: "Medium",
        location: SITE_LOCATIONS[0],
        description: "Test",
        actions_taken: "None",
        reporter_name: "X",
        department: "   ",
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
        department: "Ops",
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
        department: "Ops",
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
        department: "Ops",
      }),
    ).toThrow();
  });

  it("defaults image_urls to empty array when omitted", () => {
    const parsed = incidentCreateSchema.parse({
      incident_date: "2026-07-24",
      incident_time: "09:00",
      incident_type: "Other",
      severity: "Medium",
      location: SITE_LOCATIONS[0],
      description: "Test",
      actions_taken: "None",
      reporter_name: "X",
      department: "Ops",
    });
    expect(parsed.image_urls).toEqual([]);
  });

  it("isPlausibleIncidentW3w accepts normalised three-word shape", () => {
    expect(isPlausibleIncidentW3w("///Index.Home.Raft")).toBe(true);
    expect(isPlausibleIncidentW3w("ab")).toBe(false);
    expect(isPlausibleIncidentW3w("1.2.3")).toBe(false);
  });

  it("normalises optional incident_w3w and omits when empty", () => {
    const parsed = incidentCreateSchema.parse({
      incident_date: "2026-07-24",
      incident_time: "09:00",
      incident_type: "Other",
      severity: "Medium",
      location: SITE_LOCATIONS[0],
      description: "Test",
      actions_taken: "None",
      reporter_name: "X",
      department: "Ops",
      incident_w3w: "///Filled.Count.Soak",
    });
    expect(parsed.incident_w3w).toBe("filled.count.soak");
  });

  it("accepts allowed Vercel Blob HTTPS URLs", () => {
    const parsed = incidentCreateSchema.parse({
      incident_date: "2026-07-24",
      incident_time: "09:00",
      incident_type: "Other",
      severity: "Medium",
      location: SITE_LOCATIONS[0],
      description: "Test",
      actions_taken: "None",
      reporter_name: "X",
      department: "Ops",
      image_urls: [
        "https://abc.public.blob.vercel-storage.com/path/1.png",
        "https://x.public.blob.vercel-storage.com/y.jpg",
      ],
    });
    expect(parsed.image_urls).toHaveLength(2);
  });

  it("rejects non-Blob host in image_urls", () => {
    expect(() =>
      incidentCreateSchema.parse({
        incident_date: "2026-07-24",
        incident_time: "09:00",
        incident_type: "Other",
        severity: "Medium",
        location: SITE_LOCATIONS[0],
        description: "Test",
        actions_taken: "None",
        reporter_name: "X",
        department: "Ops",
        image_urls: ["https://evil.example.com/x.png"],
      }),
    ).toThrow();
  });

  it("rejects more than INCIDENT_IMAGE_URL_MAX photos", () => {
    const urls = Array.from({ length: 9 }, (_, i) =>
      `https://s.public.blob.vercel-storage.com/p/${i}.png`,
    );
    expect(() =>
      incidentCreateSchema.parse({
        incident_date: "2026-07-24",
        incident_time: "09:00",
        incident_type: "Other",
        severity: "Medium",
        location: SITE_LOCATIONS[0],
        description: "Test",
        actions_taken: "None",
        reporter_name: "X",
        department: "Ops",
        image_urls: urls,
      }),
    ).toThrow();
  });
});
