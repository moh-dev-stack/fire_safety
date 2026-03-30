import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "node:crypto";
import { isAuthenticated } from "../lib/auth";
import { getSql } from "../lib/neon";
import { getCookie, SESSION_COOKIE } from "../lib/session";
import { parseStoredIncidentDraft } from "../../src/model/incident";

function sessionDraftKey(cookieHeader: string | undefined): string | null {
  const token = getCookie(cookieHeader, SESSION_COOKIE);
  if (!token) return null;
  return createHash("sha256").update(token, "utf8").digest("hex");
}

type DraftRow = { payload: unknown; updated_at: Date | string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!(await isAuthenticated(req))) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const key = sessionDraftKey(req.headers.cookie);
  if (!key) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const sql = getSql();

  if (req.method === "GET") {
    try {
      const rows = (await sql.query(
        `SELECT payload, updated_at FROM incident_report_drafts WHERE session_key = $1`,
        [key],
      )) as DraftRow[];
      const row = rows[0];
      if (!row) {
        res.status(200).json({ draft: null });
        return;
      }
      const payload =
        typeof row.payload === "string"
          ? (JSON.parse(row.payload) as unknown)
          : row.payload;
      const draft = parseStoredIncidentDraft(payload);
      const updated_at =
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : String(row.updated_at);
      res.status(200).json({ draft, updated_at });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Database error" });
    }
    return;
  }

  if (req.method === "PUT") {
    try {
      const raw =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const draft = parseStoredIncidentDraft(raw);
      if (!draft) {
        res.status(400).json({ error: "Invalid draft" });
        return;
      }
      await sql.query(
        `INSERT INTO incident_report_drafts (session_key, payload, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (session_key) DO UPDATE SET
           payload = EXCLUDED.payload,
           updated_at = NOW()`,
        [key, JSON.stringify(draft)],
      );
      res.status(204).end();
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Database error" });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      await sql.query(
        `DELETE FROM incident_report_drafts WHERE session_key = $1`,
        [key],
      );
      res.status(204).end();
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Database error" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
