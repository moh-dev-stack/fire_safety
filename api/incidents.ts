import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ZodError } from "zod";
import {
  ADMIN_EVENT_SELECTOR_IDS,
  USER_FIXED_EVENT_ID,
  getEventById,
} from "../src/data/events.js";
import { incidentCreateSchema } from "../src/model/incident.js";
import { getRole } from "./lib/auth.js";
import { mapRow } from "./lib/incident-map.js";
import { getSql } from "./lib/neon.js";

function queryEventId(req: VercelRequest): string | undefined {
  const raw = req.query?.event_id;
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0].length > 0) {
    return raw[0];
  }
  return undefined;
}

function incidentDbHttpBody(e: unknown): { error: string; hint?: string } {
  const code =
    e !== null &&
    typeof e === "object" &&
    "code" in e &&
    typeof (e as { code: unknown }).code === "string"
      ? (e as { code: string }).code
      : undefined;
  const message =
    e instanceof Error
      ? e.message
      : e !== null &&
          typeof e === "object" &&
          "message" in e &&
          typeof (e as { message: unknown }).message === "string"
        ? (e as { message: string }).message
        : String(e);

  console.error("Incidents DB error:", message, code ?? "", e);

  if (code === "42703" || /column .* does not exist/i.test(message)) {
    return {
      error: "Database error",
      hint: "Schema may be out of date. From the repo root run: npm run db:apply (same DATABASE_URL / POSTGRES_URL as the running API).",
    };
  }
  if (code === "42P01" || /relation .* does not exist/i.test(message)) {
    return {
      error: "Database error",
      hint: "Required tables may be missing. Run: npm run db:apply",
    };
  }
  if (/No Postgres URL in environment/i.test(message)) {
    return {
      error: "Database error",
      hint: "Configure DATABASE_URL or POSTGRES_URL for the API (see .env.example).",
    };
  }
  return { error: "Database error" };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const role = await getRole(req);
  if (!role) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method === "GET") {
    if (role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const eventId = queryEventId(req);
    if (
      !eventId ||
      !(ADMIN_EVENT_SELECTOR_IDS as readonly string[]).includes(eventId)
    ) {
      res.status(400).json({
        error: "event_id required",
        hint: "Pass ?event_id=jalsa-2026-islamabad or jalsa-2025-islamabad (match the header selector).",
      });
      return;
    }
    try {
      const sql = getSql();
      const rows = await sql.query(
        `SELECT id, created_at, event_id, incident_date::text AS incident_date, incident_time,
                incident_type, severity, location, description, actions_taken,
                reporter_name, reporter_contact, department, image_urls
         FROM incidents
         WHERE event_id = $1
         ORDER BY id DESC`,
        [eventId],
      );
      const mapped = (rows as Record<string, unknown>[]).map(mapRow);
      res.status(200).json(mapped);
    } catch (e) {
      res.status(500).json(incidentDbHttpBody(e));
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const raw =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const data = incidentCreateSchema.parse(raw);
      const effectiveEventId =
        role === "user" ? USER_FIXED_EVENT_ID : data.event_id;
      if (
        role === "admin" &&
        !(ADMIN_EVENT_SELECTOR_IDS as readonly string[]).includes(effectiveEventId)
      ) {
        res.status(400).json({
          error: "Invalid event",
          hint: "Choose Jalsa 2025 or 2026 in the header; the report must match that event.",
        });
        return;
      }
      const ev = getEventById(effectiveEventId);
      if (!ev || !(ev.dates as readonly string[]).includes(data.incident_date)) {
        res.status(400).json({
          error: "Date does not match event",
          hint: "Pick an on-site date from the list for the selected Jalsa.",
        });
        return;
      }
      const sql = getSql();
      const imageUrlsJson = JSON.stringify(data.image_urls);
      const inserted = await sql.query(
        `INSERT INTO incidents (
          event_id,
          incident_date, incident_time, incident_type, severity,
          location, description, actions_taken, reporter_name, reporter_contact,
          department, image_urls
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
        RETURNING id, created_at, event_id, incident_date::text AS incident_date, incident_time,
                  incident_type, severity, location, description, actions_taken,
                  reporter_name, reporter_contact, department, image_urls`,
        [
          effectiveEventId,
          data.incident_date,
          data.incident_time,
          data.incident_type,
          data.severity,
          data.location,
          data.description,
          data.actions_taken,
          data.reporter_name,
          null,
          data.department,
          imageUrlsJson,
        ],
      );
      const row = (inserted as Record<string, unknown>[])[0];
      if (!row) {
        res.status(500).json({ error: "Insert returned no row" });
        return;
      }
      const mapped = mapRow(row);
      res.status(201).json(mapped);
    } catch (e: unknown) {
      if (e instanceof ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: e.flatten(),
        });
        return;
      }
      res.status(500).json(incidentDbHttpBody(e));
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
