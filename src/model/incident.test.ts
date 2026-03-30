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
    });
    expect(parsed.image_urls).toEqual([]);
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
        image_urls: urls,
      }),
    ).toThrow();
  });
});
