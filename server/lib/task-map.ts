import { TASK_STATUSES, type TaskNote, type TaskRow, type TaskStatus } from "../../src/model/task.js";

function toIso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  return String(v ?? "");
}

function toStatus(v: unknown): TaskStatus {
  if (typeof v === "string" && (TASK_STATUSES as readonly string[]).includes(v)) {
    return v as TaskStatus;
  }
  return "pending";
}

function toNotes(v: unknown): TaskNote[] {
  const raw = typeof v === "string" ? JSON.parse(v) : v;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((n): TaskNote | null => {
      if (!n || typeof n !== "object") return null;
      const o = n as Record<string, unknown>;
      const at = typeof o.at === "string" ? o.at : "";
      const author = typeof o.author === "string" ? o.author : "";
      const body = typeof o.body === "string" ? o.body : "";
      if (!body) return null;
      return { at, author, body };
    })
    .filter((n): n is TaskNote => n !== null);
}

export function mapTaskRow(row: Record<string, unknown>): TaskRow {
  return {
    id: Number(row.id),
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
    task: String(row.task ?? ""),
    deadline: row.deadline == null ? null : String(row.deadline),
    allocation: String(row.allocation ?? ""),
    status: toStatus(row.status),
    notes: toNotes(row.notes),
  };
}
