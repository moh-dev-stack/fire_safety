import { z } from "zod";

/**
 * Stored / API values for incident category (must match server Zod + DB).
 * Dropdown option values use these exact strings.
 */
export const INCIDENT_TYPE_CODES = [
  "Fire",
  "Medical",
  "Crowd",
  "Weather",
  "Equipment",
  "Other",
] as const;

export type IncidentTypeCode = (typeof INCIDENT_TYPE_CODES)[number];

/** Human-readable label per code — use for `<option>` text, not `value`. */
export const INCIDENT_TYPE_LABELS: Record<IncidentTypeCode, string> = {
  Fire: "Fire — alarm, panel, smoke, or suspected fire",
  Medical: "Medical / first aid",
  Crowd: "Crowd — density, flow, evacuation, or assembly",
  Weather: "Severe weather impact",
  Equipment: "Equipment fault (safety-related)",
  Other: "Other — hazard, near-miss, or uncategorised",
};

/** Previous long-form labels from older reports — map to canonical codes when reading rows. */
export const LEGACY_INCIDENT_TYPE_TO_CODE: Record<string, IncidentTypeCode> = {
  "Fire alarm / panel": "Fire",
  "Smoke or suspected fire": "Fire",
  "Evacuation / assembly point": "Crowd",
  "Medical / first aid": "Medical",
  "Crowd density or flow": "Crowd",
  "Severe weather impact": "Weather",
  "Equipment fault (safety-related)": "Equipment",
  "Hazard or near-miss": "Other",
  "Other (fire & safety)": "Other",
};

export const SEVERITY_LEVELS = ["Low", "Medium", "High"] as const;

export const incidentTypeSchema = z.enum(INCIDENT_TYPE_CODES);
export const severitySchema = z.enum(SEVERITY_LEVELS);

/** Allowed incident dates — keep in sync with the report form `<select>`. */
export const JALSA_DAYS = ["2026-07-24", "2026-07-25", "2026-07-26"] as const;
export const jalsaDaySchema = z.enum(JALSA_DAYS);

const JALSA_DAY_LABEL: Record<(typeof JALSA_DAYS)[number], string> = {
  "2026-07-24": "Fri 24 Jul 2026",
  "2026-07-25": "Sat 25 Jul 2026",
  "2026-07-26": "Sun 26 Jul 2026",
};

export function jalsaDaySelectLabel(iso: (typeof JALSA_DAYS)[number]): string {
  return JALSA_DAY_LABEL[iso];
}

/** Main site areas — Islamabad UK Jalsa (adjust list as needed). */
export const SITE_LOCATIONS = [
  "Main Jalsa marquee / Langar area",
  "Parking — main field",
  "Parking — overflow",
  "Entrance / Gate A",
  "Entrance / Gate B",
  "Jalsa Gah (prayer area)",
  "Children's & Lajna marquee area",
  "Bazar / exhibitions",
  "Campsite / accommodation field",
  "Medical / first-aid tent",
  "Fire & safety control / duty office",
  "Outdoor tracks & connecting paths",
  "Other — describe in “What happened”",
] as const;

const SITE_LOCATION_SET = new Set<string>(SITE_LOCATIONS);

function halfHourSlots(): string[] {
  const out: string[] = [];
  for (let h = 6; h <= 22; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    out.push(`${String(h).padStart(2, "0")}:30`);
  }
  out.push("23:00", "23:30");
  return out;
}

/** 06:00–23:30 in 30-minute steps */
export const INCIDENT_TIME_SLOTS: readonly string[] = halfHourSlots();
const INCIDENT_TIME_SET = new Set(INCIDENT_TIME_SLOTS);

const reporterNameRequired = z
  .string()
  .trim()
  .min(1, "Enter your name")
  .max(200);

/** Max photos per incident report (DB + UI). */
export const INCIDENT_IMAGE_URL_MAX = 8;

const imageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((s) => {
    try {
      const u = new URL(s);
      if (u.protocol !== "https:") return false;
      const host = u.hostname.toLowerCase();
      return (
        host.endsWith(".public.blob.vercel-storage.com") ||
        host === "public.blob.vercel-storage.com"
      );
    } catch {
      return false;
    }
  }, "Each image must be a valid HTTPS URL from Vercel Blob storage");

const incidentFieldsBase = {
  incident_date: jalsaDaySchema,
  incident_time: z
    .string()
    .min(1, "Choose a time on site")
    .refine((s) => INCIDENT_TIME_SET.has(s), {
      message: "Pick a time from the list (30-minute slots from 06:00 to 23:30).",
    }),
  incident_type: incidentTypeSchema,
  severity: severitySchema,
  location: z
    .string()
    .min(1, "Choose a location on site")
    .refine((s) => SITE_LOCATION_SET.has(s), {
      message: "Pick a location from the list. Use “Other” and add detail under What happened if needed.",
    }),
  description: z
    .string()
    .min(1, "Describe what happened from a fire & safety perspective")
    .max(8000),
  actions_taken: z
    .string()
    .min(1, "Record actions taken (even if still in progress)")
    .max(8000),
  reporter_name: reporterNameRequired,
};

export const incidentFieldsSchema = z.object(incidentFieldsBase);

/** Payload for creating an incident (optional photos as Blob HTTPS URLs). */
export const incidentCreateSchema = incidentFieldsSchema.extend({
  image_urls: z
    .array(imageUrlSchema)
    .max(INCIDENT_IMAGE_URL_MAX)
    .optional()
    .default([]),
});

export type IncidentCreate = z.infer<typeof incidentCreateSchema>;

export type IncidentFields = z.infer<typeof incidentFieldsSchema>;

/** Client form state before validation */
export type IncidentDraft = {
  incident_date: string;
  incident_time: string;
  incident_type: IncidentTypeCode | "";
  severity: (typeof SEVERITY_LEVELS)[number] | "";
  location: string;
  description: string;
  actions_taken: string;
  reporter_name: string;
  /** Already-uploaded Blob URLs; pending local `File`s stay in component state only. */
  image_urls: string[];
};

export function emptyIncidentDraft(): IncidentDraft {
  return {
    incident_date: "",
    incident_time: "",
    incident_type: "",
    severity: "",
    location: "",
    description: "",
    actions_taken: "",
    reporter_name: "",
    image_urls: [],
  };
}

/** Lenient shape for autosave (local + DB draft) before final Zod submit validation. */
export const incidentDraftStorageSchema = z.object({
  incident_date: z.string().max(32),
  incident_time: z.string().max(16),
  incident_type: z.string().max(32),
  severity: z.string().max(32),
  location: z.string().max(512),
  description: z.string().max(8000),
  actions_taken: z.string().max(8000),
  reporter_name: z.string().max(200),
  image_urls: z.array(z.string().max(2048)).max(INCIDENT_IMAGE_URL_MAX).optional().default([]),
});

export function isIncidentDraftEmpty(d: IncidentDraft): boolean {
  const e = emptyIncidentDraft();
  return (
    d.incident_date === e.incident_date &&
    d.incident_time === e.incident_time &&
    d.incident_type === e.incident_type &&
    d.severity === e.severity &&
    d.location === e.location &&
    d.description === e.description &&
    d.actions_taken === e.actions_taken &&
    d.reporter_name === e.reporter_name &&
    d.image_urls.length === 0
  );
}

export function parseStoredIncidentDraft(data: unknown): IncidentDraft | null {
  const r = incidentDraftStorageSchema.safeParse(data);
  if (!r.success) return null;
  const raw = r.data;
  const incident_type: IncidentDraft["incident_type"] =
    raw.incident_type !== "" &&
    (INCIDENT_TYPE_CODES as readonly string[]).includes(raw.incident_type)
      ? (raw.incident_type as IncidentTypeCode)
      : "";
  const severity: IncidentDraft["severity"] =
    raw.severity !== "" &&
    (SEVERITY_LEVELS as readonly string[]).includes(raw.severity)
      ? (raw.severity as (typeof SEVERITY_LEVELS)[number])
      : "";
  const image_urls = (raw.image_urls ?? []).filter(
    (x): x is string => typeof x === "string" && x.length > 0,
  ).slice(0, INCIDENT_IMAGE_URL_MAX);

  return {
    incident_date: raw.incident_date,
    incident_time: raw.incident_time,
    incident_type,
    severity,
    location: raw.location,
    description: raw.description,
    actions_taken: raw.actions_taken,
    reporter_name: raw.reporter_name,
    image_urls,
  };
}

export type IncidentRow = {
  id: number;
  created_at: string;
  incident_date: string | null;
  incident_time: string | null;
  incident_type: IncidentTypeCode;
  severity: (typeof SEVERITY_LEVELS)[number];
  location: string;
  description: string;
  actions_taken: string | null;
  reporter_name: string | null;
  reporter_contact: string | null;
  image_urls: string[];
};

export const INCIDENT_CSV_COLUMNS = [
  "id",
  "created_at",
  "incident_date",
  "incident_time",
  "incident_type",
  "severity",
  "location",
  "description",
  "actions_taken",
  "reporter_name",
  "reporter_contact",
  "image_urls",
] as const;

export type IncidentCsvColumn = (typeof INCIDENT_CSV_COLUMNS)[number];

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function rowsToCsv(rows: IncidentRow[]): string {
  const header = INCIDENT_CSV_COLUMNS.join(",");
  const lines = rows.map((row) =>
    INCIDENT_CSV_COLUMNS.map((col) => {
      if (col === "image_urls") {
        return csvEscape(JSON.stringify(row.image_urls));
      }
      const v = row[col as keyof IncidentRow];
      return csvEscape(v as string | number | null | undefined);
    }).join(","),
  );
  return [header, ...lines].join("\n") + "\n";
}

export function formatIncidentExportFilename(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `jalsa-incidents-${y}-${m}-${day}.csv`;
}
