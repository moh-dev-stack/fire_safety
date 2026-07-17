import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ZodError } from "zod";
import { getRole } from "../../server/lib/auth.js";
import { getSql } from "../../server/lib/neon.js";
import { mapTaskRow } from "../../server/lib/task-map.js";
import { taskUpdateSchema } from "../../src/model/task.js";

function parseId(req: VercelRequest): number | null {
  const raw = req.query.id;
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
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

  const id = parseId(req);
  if (id === null) {
    res.status(400).json({ error: "Invalid task id" });
    return;
  }

  const sql = getSql();

  if (req.method === "PATCH") {
    try {
      const raw =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const data = taskUpdateSchema.parse(raw);

      const sets: string[] = [];
      const values: unknown[] = [];
      let i = 1;

      if (data.task !== undefined) {
        sets.push(`task = $${i++}`);
        values.push(data.task);
      }
      if (data.deadline !== undefined) {
        sets.push(`deadline = $${i++}`);
        values.push(data.deadline ?? null);
      }
      if (data.allocation !== undefined) {
        sets.push(`allocation = $${i++}`);
        values.push(data.allocation);
      }
      if (data.status !== undefined) {
        sets.push(`status = $${i++}`);
        values.push(data.status);
      }
      if (data.appendNote) {
        const note = {
          at: new Date().toISOString(),
          author: data.appendNote.author ?? "",
          body: data.appendNote.body,
        };
        sets.push(`notes = notes || $${i++}::jsonb`);
        values.push(JSON.stringify([note]));
      }
      sets.push(`updated_at = NOW()`);

      values.push(id);
      const q = `
        UPDATE tasks SET ${sets.join(", ")}
        WHERE id = $${i}
        RETURNING id, created_at, updated_at, task,
                  deadline::text AS deadline, allocation, status, notes
      `;
      const rows = await sql.query(q, values);
      const row = (rows as Record<string, unknown>[])[0];
      if (!row) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(200).json(mapTaskRow(row));
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: e.flatten(),
        });
        return;
      }
      console.error("Task PATCH error:", e);
      res.status(500).json({ error: "Database error" });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      await sql.query(`DELETE FROM tasks WHERE id = $1`, [id]);
      res.status(204).end();
    } catch (e) {
      console.error("Task DELETE error:", e);
      res.status(500).json({ error: "Database error" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
