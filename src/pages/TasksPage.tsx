import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import * as api from "../lib/api";
import {
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type TaskRow,
  type TaskStatus,
} from "../model/task";

type FormState = {
  task: string;
  deadline: string;
  allocation: string;
  status: TaskStatus;
};

const emptyForm: FormState = {
  task: "",
  deadline: "",
  allocation: "",
  status: "pending",
};

const inputClass =
  "block w-full min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-200";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-slate-500";
const btnPrimary =
  "min-h-11 rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-50";
const btnSecondary =
  "min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-50";

function statusPill(status: TaskStatus) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold";
  if (status === "completed") return `${base} bg-emerald-100 text-emerald-800`;
  if (status === "in_progress") return `${base} bg-amber-100 text-amber-800`;
  return `${base} bg-slate-100 text-slate-700`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TaskCard({
  row,
  onChanged,
}: {
  row: TaskRow;
  onChanged: (next: TaskRow | null) => void;
}) {
  const [noteBody, setNoteBody] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const notesSorted = useMemo(
    () => [...row.notes].sort((a, b) => (a.at > b.at ? -1 : 1)),
    [row.notes],
  );

  const addNote = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!noteBody.trim()) return;
      setSaving(true);
      setError(null);
      try {
        const next = await api.updateTask(row.id, {
          appendNote: { author: noteAuthor.trim(), body: noteBody.trim() },
        });
        onChanged(next);
        setNoteBody("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add note");
      } finally {
        setSaving(false);
      }
    },
    [noteAuthor, noteBody, onChanged, row.id],
  );

  const changeStatus = useCallback(
    async (status: TaskStatus) => {
      setSaving(true);
      setError(null);
      try {
        const next = await api.updateTask(row.id, { status });
        onChanged(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update");
      } finally {
        setSaving(false);
      }
    },
    [onChanged, row.id],
  );

  const remove = useCallback(async () => {
    if (!window.confirm(`Delete task #${row.id}? This cannot be undone.`)) return;
    setSaving(true);
    setError(null);
    try {
      await api.deleteTask(row.id);
      onChanged(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setSaving(false);
    }
  }, [onChanged, row.id]);

  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">#{row.id}</span>
            <span className={statusPill(row.status)}>
              {TASK_STATUS_LABELS[row.status]}
            </span>
          </div>
          <p className="mt-1 text-base font-semibold leading-snug text-slate-900">
            {row.task}
          </p>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 sm:grid-cols-3">
            <div>
              <dt className="font-semibold uppercase tracking-wide text-slate-500">
                Deadline
              </dt>
              <dd>{formatDate(row.deadline)}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-slate-500">
                Allocated
              </dt>
              <dd>{row.allocation || "-"}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-slate-500">
                Added
              </dt>
              <dd>{formatDate(row.created_at)}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <select
            value={row.status}
            onChange={(e) => void changeStatus(e.target.value as TaskStatus)}
            disabled={saving}
            className={inputClass + " w-auto min-w-[9rem]"}
            aria-label={`Status for task ${row.id}`}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          {row.status === "completed" ? (
            <button
              type="button"
              className={btnSecondary}
              onClick={remove}
              disabled={saving}
              title="Delete this task permanently"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold uppercase tracking-wide text-red-800 hover:underline"
          aria-expanded={expanded}
        >
          Notes ({row.notes.length}) {expanded ? "▾" : "▸"}
        </button>
        {expanded ? (
          <div className="mt-3 space-y-3">
            {notesSorted.length === 0 ? (
              <p className="text-sm text-slate-500">No notes yet.</p>
            ) : (
              <ol className="space-y-2">
                {notesSorted.map((n) => (
                  <li
                    key={`${n.at}-${n.body.slice(0, 12)}`}
                    className="rounded-lg bg-slate-50 p-3 text-sm text-slate-800"
                  >
                    <div className="text-xs text-slate-500">
                      {formatDateTime(n.at)}
                      {n.author ? ` · ${n.author}` : ""}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
                  </li>
                ))}
              </ol>
            )}
            <form onSubmit={addNote} className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-[8rem_1fr]">
                <input
                  type="text"
                  placeholder="Initials (e.g. MR)"
                  className={inputClass}
                  value={noteAuthor}
                  maxLength={16}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                />
                <textarea
                  placeholder="Add a note (action taken, update, blocker…)"
                  className={inputClass + " min-h-[3rem] py-2"}
                  value={noteBody}
                  rows={2}
                  onChange={(e) => setNoteBody(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className={btnPrimary}
                  disabled={saving || !noteBody.trim()}
                >
                  {saving ? "Saving…" : "Add note"}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function TasksPage() {
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "completed">("open");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.fetchTasks();
      setRows(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submitNew = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!form.task.trim()) return;
      setCreating(true);
      setCreateError(null);
      try {
        const created = await api.createTask({
          task: form.task.trim(),
          deadline: form.deadline ? form.deadline : null,
          allocation: form.allocation.trim(),
          status: form.status,
          notes: [],
        });
        setRows((prev) => [created, ...prev]);
        setForm(emptyForm);
        setShowForm(false);
      } catch (err) {
        setCreateError(
          err instanceof Error ? err.message : "Failed to create",
        );
      } finally {
        setCreating(false);
      }
    },
    [form],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "completed")
      return rows.filter((r) => r.status === "completed");
    return rows.filter((r) => r.status !== "completed");
  }, [rows, filter]);

  const counts = useMemo(() => {
    const open = rows.filter((r) => r.status !== "completed").length;
    const done = rows.length - open;
    return { open, done, total: rows.length };
  }, [rows]);

  const onRowChanged = useCallback(
    (id: number) => (next: TaskRow | null) => {
      setRows((prev) =>
        next === null ? prev.filter((r) => r.id !== id) : prev.map((r) => (r.id === id ? next : r)),
      );
    },
    [],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Tasks
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Internal to-do list. Replaces spreadsheets for tracking day-to-day
          jobs. Add a task, allocate it, and append notes as things move.
        </p>
        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:text-sm">
          Heads up: tasks can only be deleted after they are marked
          <span className="mx-1 font-semibold">Completed</span>. Change the
          status first, then the Delete button will appear.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="tablist"
          aria-label="Filter tasks"
          className="flex flex-wrap gap-1"
        >
          {(
            [
              { key: "open" as const, label: `Open (${counts.open})` },
              { key: "completed" as const, label: `Completed (${counts.done})` },
              { key: "all" as const, label: `All (${counts.total})` },
            ]
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={filter === t.key}
              onClick={() => setFilter(t.key)}
              className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold ${
                filter === t.key
                  ? "bg-red-800 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={btnPrimary}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "New task"}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={submitNew}
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div>
            <label className={labelClass} htmlFor="task-input">
              Task
            </label>
            <input
              id="task-input"
              type="text"
              required
              className={inputClass + " mt-1"}
              value={form.task}
              onChange={(e) => setForm((f) => ({ ...f, task: e.target.value }))}
              placeholder="e.g. Inspection of standpipes"
              maxLength={2000}
              autoFocus
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="task-deadline">
                Deadline
              </label>
              <input
                id="task-deadline"
                type="date"
                className={inputClass + " mt-1"}
                value={form.deadline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deadline: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="task-allocation">
                Allocated to
              </label>
              <input
                id="task-allocation"
                type="text"
                className={inputClass + " mt-1"}
                value={form.allocation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, allocation: e.target.value }))
                }
                placeholder="e.g. Muddassar"
                maxLength={200}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                className={inputClass + " mt-1"}
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as TaskStatus,
                  }))
                }
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {createError ? (
            <p className="text-sm text-red-700">{createError}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                setForm(emptyForm);
                setShowForm(false);
              }}
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={btnPrimary}
              disabled={creating || !form.task.trim()}
            >
              {creating ? "Saving…" : "Save task"}
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">Loading tasks…</p>
      ) : loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 underline"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
          No tasks {filter === "open" ? "in progress" : filter === "completed" ? "completed yet" : "yet"}. Add one to get started.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((row) => (
            <TaskCard key={row.id} row={row} onChanged={onRowChanged(row.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}
