import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import {
  VENUE_AREA_ORDER,
  VENUE_CHECKLIST_ITEMS,
  VENUE_OPTIONS,
  itemsForVenue,
  VENUE_CHECKLIST_SCOPE,
  venueDisplayLabel,
  type VenueAreaId,
} from "../data/venueChecklistItems";

const DRAFTS_KEY = "fire-safety-venue-checklist-drafts-v3";
const HISTORY_KEY = "fire-safety-venue-checklist-submissions-v3";
const HISTORY_KEY_LEGACY = "fire-safety-venue-checklist-submissions-v2";
const STAFF_NAME_KEY = "fire-safety-venue-checklist-staff-name-v1";

type RowState = {
  done: boolean;
  /** Legacy submissions only - per-item comments are no longer collected. */
  comment?: string;
};

export type VenueChecklistSubmission = {
  id: string;
  submittedAt: string;
  /** v3+ single-venue submit */
  venueId?: VenueAreaId;
  venueLabel?: string;
  staffName: string;
  generalNotes?: string;
  rows: Record<string, RowState>;
};

type AllDrafts = Record<VenueAreaId, Record<string, RowState>>;

type TabId = "checklist" | "log";

function emptyRow(): RowState {
  return { done: false };
}

function emptyDraftForVenue(venueId: VenueAreaId): Record<string, RowState> {
  const out: Record<string, RowState> = {};
  for (const item of itemsForVenue(venueId)) {
    out[item.id] = emptyRow();
  }
  return out;
}

function defaultAllDrafts(): AllDrafts {
  const o = {} as AllDrafts;
  for (const id of VENUE_AREA_ORDER) {
    o[id] = emptyDraftForVenue(id);
  }
  return o;
}

function loadDrafts(): AllDrafts {
  const base = defaultAllDrafts();
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (!raw) return base;
    const p = JSON.parse(raw) as unknown;
    if (typeof p !== "object" || p === null) return base;
    for (const vid of VENUE_AREA_ORDER) {
      const block = (p as Record<string, unknown>)[vid];
      if (typeof block !== "object" || block === null) continue;
      for (const item of itemsForVenue(vid)) {
        const r = (block as Record<string, unknown>)[item.id];
        if (typeof r === "object" && r !== null) {
          const done = Boolean((r as RowState).done);
          base[vid][item.id] = { done };
        }
      }
    }
    return base;
  } catch {
    return base;
  }
}

function saveDrafts(drafts: AllDrafts) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

function parseSubmissions(raw: unknown): VenueChecklistSubmission[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is VenueChecklistSubmission => {
    if (typeof x !== "object" || x === null) return false;
    const o = x as Record<string, unknown>;
    return (
      typeof o.id === "string" &&
      typeof o.submittedAt === "string" &&
      typeof o.rows === "object" &&
      o.rows !== null
    );
  });
}

function normalizeSubmission(x: VenueChecklistSubmission): VenueChecklistSubmission {
  const verifier = (x as unknown as { verifier?: string }).verifier;
  const staffName =
    typeof x.staffName === "string" && x.staffName.trim().length > 0
      ? x.staffName
      : typeof verifier === "string"
        ? verifier
        : "";
  return {
    ...x,
    staffName,
    rows: x.rows,
  };
}

function loadHistory(): VenueChecklistSubmission[] {
  try {
    const v3 = localStorage.getItem(HISTORY_KEY);
    if (v3) {
      const list = parseSubmissions(JSON.parse(v3) as unknown).map(normalizeSubmission);
      if (list.length > 0) return sortNewestFirst(list);
    }
    const leg = localStorage.getItem(HISTORY_KEY_LEGACY);
    if (leg) {
      const list = parseSubmissions(JSON.parse(leg) as unknown).map(normalizeSubmission);
      if (list.length > 0) {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
        return sortNewestFirst(list);
      }
    }
  } catch {
    /* ignore */
  }
  return [];
}

function sortNewestFirst(subs: VenueChecklistSubmission[]): VenueChecklistSubmission[] {
  return [...subs].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

function saveHistory(subs: VenueChecklistSubmission[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(subs));
}

function loadSavedStaffName(): string {
  try {
    const s = localStorage.getItem(STAFF_NAME_KEY);
    return typeof s === "string" ? s : "";
  } catch {
    return "";
  }
}

function saveStaffNamePreference(name: string) {
  const t = name.trim();
  if (t) localStorage.setItem(STAFF_NAME_KEY, t);
}

function lastCompletedAt(
  venueId: VenueAreaId,
  history: VenueChecklistSubmission[],
): string | null {
  for (const s of history) {
    if (s.venueId === venueId) return s.submittedAt;
    if (!s.venueId) {
      const vItems = itemsForVenue(venueId);
      if (vItems.some((it) => s.rows[it.id]?.done)) return s.submittedAt;
    }
  }
  return null;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VenueChecklistPage() {
  const { authenticated } = useAuth();
  const [tab, setTab] = useState<TabId>("checklist");
  const [venueId, setVenueId] = useState<VenueAreaId>(VENUE_OPTIONS[0].id);
  const [drafts, setDrafts] = useState<AllDrafts>(loadDrafts);
  const [history, setHistory] = useState<VenueChecklistSubmission[]>(loadHistory);
  const [staffName, setStaffName] = useState(() => loadSavedStaffName());
  const [generalNotes, setGeneralNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => saveDrafts(drafts), 400);
    return () => window.clearTimeout(t);
  }, [drafts]);

  const venueItems = useMemo(() => itemsForVenue(venueId), [venueId]);
  const venueLabel = venueDisplayLabel(venueId);
  const draft = drafts[venueId];

  const lastDone = useMemo(
    () => lastCompletedAt(venueId, history),
    [venueId, history],
  );

  function updateRow(itemId: string, patch: Partial<RowState>) {
    setDrafts((prev) => {
      const block = { ...prev[venueId] };
      const row = block[itemId] ?? emptyRow();
      block[itemId] = { ...row, ...patch };
      return { ...prev, [venueId]: block };
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const anyDone = venueItems.some((it) => draft[it.id]?.done);
    if (!anyDone) {
      setError("Tick at least one task you have checked for this venue, or there is nothing to submit.");
      return;
    }

    const snapshot: Record<string, RowState> = {};
    for (const item of venueItems) {
      const row = draft[item.id] ?? emptyRow();
      snapshot[item.id] = { done: row.done };
    }

    const submission: VenueChecklistSubmission = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      venueId,
      venueLabel,
      staffName: staffName.trim(),
      generalNotes: generalNotes.trim() || undefined,
      rows: snapshot,
    };

    saveStaffNamePreference(staffName.trim());

    setHistory((prev) => {
      const next = sortNewestFirst([submission, ...prev]);
      saveHistory(next);
      return next;
    });

    setDrafts((prev) => ({
      ...prev,
      [venueId]: emptyDraftForVenue(venueId),
    }));
    setGeneralNotes("");
    setSuccess(
      `Checklist for ${venueLabel} submitted. Recorded automatically: ${formatWhen(submission.submittedAt)}. Open Venue checklist log to review.`,
    );
    setTab("log");
  }

  function onExportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      submissions: loadHistory(),
      drafts: loadDrafts(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `venue-checklists-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Venue readiness checklist</h1>
          <p className="mt-1 max-w-2xl text-slate-600">
            Choose a venue, complete only that checklist, then submit. Drafts for each venue are saved on
            this device. Use <strong>Venue checklist log</strong> to review past submissions.
          </p>
        </div>
        <button
          type="button"
          onClick={onExportJson}
          className="min-h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
        >
          Export JSON
        </button>
      </header>

      <div
        className="flex flex-wrap gap-2 border-b border-slate-200 pb-1"
        role="tablist"
        aria-label="Venue checklist sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "checklist"}
          onClick={() => {
            setTab("checklist");
            setSuccess(null);
            setError(null);
          }}
          className={`min-h-11 rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
            tab === "checklist"
              ? "bg-white text-red-900 ring-1 ring-slate-200 ring-b-white"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Complete checklist
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "log"}
          onClick={() => {
            setTab("log");
            setSuccess(null);
            setError(null);
          }}
          className={`min-h-11 rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
            tab === "log"
              ? "bg-white text-red-900 ring-1 ring-slate-200 ring-b-white"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Venue checklist log
        </button>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          {success}
        </p>
      ) : null}

      {tab === "checklist" ? (
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <label htmlFor="vc_venue" className="block text-sm font-medium text-slate-700">
              Select venue
            </label>
            <select
              id="vc_venue"
              value={venueId}
              onChange={(e) => {
                setVenueId(e.target.value as VenueAreaId);
                setError(null);
              }}
              className="mt-2 w-full max-w-md min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base"
            >
              {VENUE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
            {lastDone ? (
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Last completed</span> for this venue:{" "}
                {formatWhen(lastDone)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No completed submission for this venue on this device yet.</p>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Only the checklist for <strong>{venueLabel}</strong> is shown. Switch venue to work on another area.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <label htmlFor="vc_staff" className="block text-sm font-medium text-slate-700">
              Completed by / staff name
            </label>
            <input
              id="vc_staff"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="e.g. A. Khan - morning duty"
              className="mt-2 w-full max-w-lg min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base"
              autoComplete="name"
            />
            {authenticated ? (
              <p className="mt-1 text-xs text-slate-500">
                You are signed in; add your name above so the log shows who completed the round.
              </p>
            ) : null}
          </div>

          <section
            key={venueId}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            aria-labelledby="vc-section-heading"
          >
            <h2 id="vc-section-heading" className="border-b border-slate-100 pb-2 text-lg font-semibold text-slate-900">
              {venueLabel}
            </h2>
            <p className="mt-3 text-sm text-slate-600">{VENUE_CHECKLIST_SCOPE[venueId]}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {venueItems.length} checklist {venueItems.length === 1 ? "item" : "items"} - only for{" "}
              {venueLabel}
            </p>
            <ul className="mt-4 space-y-3">
              {venueItems.map((item) => {
                const state = draft[item.id] ?? emptyRow();
                const cbId = `vc-${item.id}`;
                return (
                  <li key={item.id} className="rounded-lg bg-slate-50/80 p-4 ring-1 ring-slate-100">
                    <label htmlFor={cbId} className="flex cursor-pointer items-start gap-3">
                      <input
                        id={cbId}
                        type="checkbox"
                        checked={state.done}
                        onChange={(e) => updateRow(item.id, { done: e.target.checked })}
                        className="mt-1 size-5 shrink-0 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-900">{item.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <label htmlFor="vc_notes" className="block text-sm font-medium text-slate-700">
              Notes / comments (optional)
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Submit time is saved automatically. Use this box for optional context - walk-round time,
              who was present, or other observations.
            </p>
            <textarea
              id="vc_notes"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              rows={3}
              placeholder="Optional - your own notes for this submission."
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="min-h-11 w-full rounded-lg bg-red-800 px-5 py-3 text-base font-semibold text-white hover:bg-red-900 sm:w-auto"
          >
            Submit checklist
          </button>
        </form>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold text-slate-900">Venue checklist log</h2>
          <p className="mt-1 text-sm text-slate-600">
            Newest first. Stored on this device only. Expand a row to see the full checklist as submitted.
          </p>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No submissions yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {history.map((sub) => {
                const vLabel =
                  sub.venueLabel ??
                  (sub.venueId ? venueDisplayLabel(sub.venueId) : "All venues (legacy)");
                const open = expandedId === sub.id;
                return (
                  <li
                    key={sub.id}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(open ? null : sub.id)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-100/80"
                      aria-expanded={open}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{vLabel}</p>
                          {sub.staffName ? (
                            <p className="mt-1 text-sm text-slate-700">
                              <span className="font-medium text-slate-800">Completed by:</span>{" "}
                              {sub.staffName}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                          <time dateTime={sub.submittedAt} className="text-sm text-slate-600">
                            {formatWhen(sub.submittedAt)}
                          </time>
                          <span className="text-xs font-medium text-red-900">
                            {open ? "Hide detail ▲" : "View full checklist ▼"}
                          </span>
                        </div>
                      </div>
                    </button>
                    {open ? (
                      <div className="border-t border-slate-200 bg-white px-4 py-4">
                        <SubmissionReadOnly sub={sub} />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function SubmissionReadOnly({ sub }: { sub: VenueChecklistSubmission }) {
  const areas: VenueAreaId[] = sub.venueId
    ? [sub.venueId]
    : [...VENUE_AREA_ORDER];

  return (
    <div className="space-y-4 text-sm">
      <p className="rounded-md bg-slate-100 px-3 py-2 text-slate-800">
        <span className="font-semibold text-slate-900">Submitted at (automatic):</span>{" "}
        <time dateTime={sub.submittedAt}>{formatWhen(sub.submittedAt)}</time>
      </p>
      {!sub.venueId ? (
        <p className="text-xs font-medium uppercase tracking-wide text-amber-900">
          Legacy submission - multiple venue areas in one snapshot
        </p>
      ) : null}
      {sub.generalNotes ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">General notes</p>
          <p className="mt-1 whitespace-pre-wrap text-slate-800">{sub.generalNotes}</p>
        </div>
      ) : null}
      {areas.map((area) => {
        const items = VENUE_CHECKLIST_ITEMS.filter((i) => i.area === area);
        const title = items[0]?.areaTitle ?? area;
        return (
          <div key={area}>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600">{title}</h3>
            <ul className="mt-2 space-y-3">
              {items.map((it) => {
                const row = sub.rows[it.id] ?? emptyRow();
                return (
                  <li key={it.id} className="rounded-md bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                    <p className="font-medium text-slate-900">{it.label}</p>
                    <p className="mt-1 text-slate-700">
                      <span className={row.done ? "text-emerald-800 font-medium" : "text-slate-500"}>
                        {row.done ? "Done" : "Not checked"}
                      </span>
                      {row.comment ? (
                        <span className="mt-1 block text-slate-600">
                          Legacy note: “{row.comment}”
                        </span>
                      ) : null}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
