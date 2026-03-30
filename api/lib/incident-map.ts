import {
  INCIDENT_TYPE_CODES,
  LEGACY_INCIDENT_TYPE_TO_CODE,
  SEVERITY_LEVELS,
  type IncidentRow,
  type IncidentTypeCode,
} from "../../src/model/incident.js";

function parseImageUrls(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === "string" && x.length > 0);
  }
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v) as unknown;
      if (Array.isArray(p)) {
        return p.filter((x): x is string => typeof x === "string" && x.length > 0);
      }
    } catch {
      /* ignore */
    }
  }
  return [];
}

function normalizeIncidentType(v: unknown): IncidentRow["incident_type"] {
  const s = String(v ?? "");
  if ((INCIDENT_TYPE_CODES as readonly string[]).includes(s)) {
    return s as IncidentTypeCode;
  }
  const fromLegacy = LEGACY_INCIDENT_TYPE_TO_CODE[s];
  if (fromLegacy) return fromLegacy;
  if (s === "Other") return "Other";
  return "Other";
}

function normalizeSeverity(v: unknown): IncidentRow["severity"] {
  const s = String(v ?? "");
  if ((SEVERITY_LEVELS as readonly string[]).includes(s)) {
    return s as IncidentRow["severity"];
  }
  return "Medium";
}

/** Normalise Neon row object to IncidentRow */
export function mapRow(r: Record<string, unknown>): IncidentRow {
  return {
    id: Number(r.id),
    created_at:
      r.created_at instanceof Date
        ? r.created_at.toISOString()
        : String(r.created_at),
    incident_date: r.incident_date ? String(r.incident_date).slice(0, 10) : null,
    incident_time: r.incident_time != null ? String(r.incident_time) : null,
    incident_type: normalizeIncidentType(r.incident_type),
    severity: normalizeSeverity(r.severity),
    location: String(r.location ?? ""),
    description: String(r.description ?? ""),
    actions_taken:
      r.actions_taken != null && String(r.actions_taken).length > 0
        ? String(r.actions_taken)
        : null,
    reporter_name:
      r.reporter_name != null && String(r.reporter_name).length > 0
        ? String(r.reporter_name)
        : null,
    reporter_contact:
      r.reporter_contact != null && String(r.reporter_contact).length > 0
        ? String(r.reporter_contact)
        : null,
    image_urls: parseImageUrls(r.image_urls),
  };
}
