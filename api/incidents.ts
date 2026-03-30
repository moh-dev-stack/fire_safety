import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ZodError } from "zod";
import { incidentCreateSchema } from "../src/model/incident.js";
import { isAuthenticated } from "./lib/auth.js";
import { mapRow } from "./lib/incident-map.js";
import { getSql } from "./lib/neon.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await isAuthenticated(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (req.method === "GET") {
    try {
      const sql = getSql();
      const rows = await sql`
        SELECT id, created_at, incident_date::text AS incident_date, incident_time,
               incident_type, severity, location, description, actions_taken,
               reporter_name, reporter_contact, image_urls
        FROM incidents
        ORDER BY id DESC
      `;
      const mapped = (rows as Record<string, unknown>[]).map(mapRow);
      res.status(200).json(mapped);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Database error" });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const raw =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const data = incidentCreateSchema.parse(raw);
      const sql = getSql();
      const imageUrlsJson = JSON.stringify(data.image_urls);
      const inserted = await sql.query(
        `INSERT INTO incidents (
          incident_date, incident_time, incident_type, severity,
          location, description, actions_taken, reporter_name, reporter_contact,
          image_urls
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
        RETURNING id, created_at, incident_date::text AS incident_date, incident_time,
                  incident_type, severity, location, description, actions_taken,
                  reporter_name, reporter_contact, image_urls`,
        [
          data.incident_date,
          data.incident_time,
          data.incident_type,
          data.severity,
          data.location,
          data.description,
          data.actions_taken,
          data.reporter_name,
          null,
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
      console.error(e);
      res.status(500).json({ error: "Database error" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
