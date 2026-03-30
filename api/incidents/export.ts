import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  formatIncidentExportFilename,
  rowsToCsv,
} from "../../src/model/incident";
import { isAuthenticated } from "../lib/auth";
import { getSql } from "../lib/neon";
import { mapRow } from "../lib/incident-map";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!(await isAuthenticated(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, created_at, incident_date::text AS incident_date, incident_time,
             incident_type, severity, location, description, actions_taken,
             reporter_name, reporter_contact, image_urls
      FROM incidents
      ORDER BY id ASC
    `;
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
