import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ADMIN_EVENT_SELECTOR_IDS } from "../../src/data/events.js";
import {
  formatIncidentExportFilename,
  rowsToCsv,
} from "../../src/model/incident.js";
import { getRole } from "../lib/auth.js";
import { getSql } from "../lib/neon.js";
import { mapRow } from "../lib/incident-map.js";

function queryEventId(req: VercelRequest): string | undefined {
  const raw = req.query?.event_id;
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string" && raw[0].length > 0) {
    return raw[0];
  }
  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const role = await getRole(req);
  if (!role) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

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
      hint: "Add ?event_id=jalsa-2026-islamabad or jalsa-2025-islamabad (same as the log).",
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
       ORDER BY id ASC`,
      [eventId],
    );
    const mapped = (rows as Record<string, unknown>[]).map(mapRow);
    const csv = rowsToCsv(mapped);
    const filename = formatIncidentExportFilename();
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );
    res.status(200).send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Export failed" });
  }
}
