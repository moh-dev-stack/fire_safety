import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ZodError } from "zod";
import { getRole } from "../server/lib/auth.js";
import { getSql } from "../server/lib/neon.js";
import { taskCreateSchema } from "../src/model/task.js";
import { mapTaskRow } from "../server/lib/task-map.js";

function dbErrorBody(e: unknown): { error: string; hint?: string } {
  const message = e instanceof Error ? e.message : String(e);
  const code =
    e !== null && typeof e === "object" && "code" in e
      ? String((e as { code: unknown }).code)
      : "";
  console.error("Tasks DB error:", message, code, e);
  if (code === "42P01" || /relation .* does not exist/i.test(message)) {
    return {
      error: "Database error",
      hint: "Run: npm run db:apply to create the tasks table.",
    };
  }
  if (/No Postgres URL in environment/i.test(message)) {
    return {
      error: "Database error",
      hint: "Configure DATABASE_URL or POSTGRES_URL for the API.",
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
  if (role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const sql = getSql();

  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT id, created_at, updated_at, task,
               deadline::text AS deadline, allocation, status, notes
        FROM tasks
        ORDER BY
          CASE status WHEN 'completed' THEN 1 ELSE 0 END,
          COALESCE(deadline, DATE '9999-12-31'),
          id DESC
      `;
      res.status(200).json((rows as Record<string, unknown>[]).map(mapTaskRow));
    } catch (e) {
      res.status(500).json(dbErrorBody(e));
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const raw =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const data = taskCreateSchema.parse(raw);
      const inserted = await sql.query(
        `INSERT INTO tasks (task, deadline, allocation, status, notes)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         RETURNING id, created_at, updated_at, task,
                   deadline::text AS deadline, allocation, status, notes`,
        [
          data.task,
          data.deadline ?? null,
          data.allocation ?? "",
          data.status ?? "pending",
          JSON.stringify(data.notes ?? []),
        ],
      );
      const row = (inserted as Record<string, unknown>[])[0];
      if (!row) {
        res.status(500).json({ error: "Insert returned no row" });
        return;
      }
      res.status(201).json(mapTaskRow(row));
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: e.flatten(),
        });
        return;
      }
      res.status(500).json(dbErrorBody(e));
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
