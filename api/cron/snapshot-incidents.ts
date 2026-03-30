import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put } from "@vercel/blob";
import { rowsToCsv } from "../../src/model/incident";
import { getSql } from "../lib/neon";
import { mapRow } from "../lib/incident-map";

function isAuthorizedCron(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.authorization;
  return auth === `Bearer ${secret}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorizedCron(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    res.status(503).json({ error: "Blob storage not configured" });
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
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const pathname = `incidents-snapshots/incidents-${ts}.csv`;

    await put(pathname, csv, {
      access: "public",
      token,
      addRandomSuffix: false,
      contentType: "text/csv; charset=utf-8",
    });

    res.status(200).json({ ok: true, pathname });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Snapshot failed" });
  }
}
