import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ZodError } from "zod";
import {
  INCIDENT_IMAGE_URL_MAX,
  INCIDENT_TIME_SLOTS,
  INCIDENT_TYPE_CODES,
  INCIDENT_TYPE_LABELS,
  JALSA_DAYS,
  SEVERITY_LEVELS,
  SITE_LOCATIONS,
  emptyIncidentDraft,
  incidentCreateSchema,
  isIncidentDraftEmpty,
  isPlausibleIncidentW3w,
  jalsaDaySelectLabel,
  type IncidentDraft,
} from "../model/incident";
import {
  ValidationFailedError,
  clearIncidentDraft,
  createIncident,
  fetchIncidentDraft,
  fetchWhat3WordsAutosuggest,
  fetchWhat3WordsConvert,
  fetchWhat3WordsFromCoordinates,
  saveIncidentDraft,
  uploadIncidentImages,
  type What3WordsSuggestion,
} from "../lib/api";
import {
  clearLocalIncidentDraft,
  loadLocalIncidentDraftMeta,
  saveLocalIncidentDraft,
} from "../lib/incident-draft-local";
import { formatFlattenedZodError } from "../lib/format-validation";

export function ReportIncidentPage() {
  const [form, setForm] = useState<IncidentDraft>(() => emptyIncidentDraft());
  /** Selected files not yet uploaded (not stored in draft). */
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const [w3wSuggestions, setW3wSuggestions] = useState<What3WordsSuggestion[]>(
    [],
  );
  const [w3wSuggestBusy, setW3wSuggestBusy] = useState(false);
  const [w3wVerifyBusy, setW3wVerifyBusy] = useState(false);
  const [w3wGeoBusy, setW3wGeoBusy] = useState(false);
  const [w3wNotice, setW3wNotice] = useState<string | null>(null);

  const photoSlotsLeft =
    INCIDENT_IMAGE_URL_MAX - form.image_urls.length - pendingFiles.length;

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const local = loadLocalIncidentDraftMeta();
      let serverDraft: IncidentDraft | null = null;
      let serverTime = 0;
      try {
        const r = await fetchIncidentDraft();
        if (!cancelled && r.draft) {
          serverDraft = r.draft;
          serverTime = r.updated_at ? Date.parse(r.updated_at) : 0;
        }
      } catch {
        /* API unreachable — use browser draft only */
      }
      if (cancelled) return;
      const localTime = local?.savedAt ?? 0;
      if (serverDraft && serverTime >= localTime) {
        setForm(serverDraft);
        setDraftNotice(
          "In-progress report restored from the database. It also saves on this device while you type.",
        );
      } else if (local?.draft && !isIncidentDraftEmpty(local.draft)) {
        setForm(local.draft);
        setDraftNotice(
          "In-progress report restored on this device. Signed-in drafts also sync to the database.",
        );
      }
      setHydrated(true);
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!draftNotice) return;
    const t = window.setTimeout(() => setDraftNotice(null), 9000);
    return () => window.clearTimeout(t);
  }, [draftNotice]);

  useEffect(() => {
    if (!success) return;
    const el = successRef.current;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [success]);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      if (isIncidentDraftEmpty(form)) {
        clearLocalIncidentDraft();
        void clearIncidentDraft().catch(() => {});
        return;
      }
      saveLocalIncidentDraft(form);
      void saveIncidentDraft(form).catch(() => {});
    }, 650);
    return () => window.clearTimeout(t);
  }, [form, hydrated]);

  useEffect(() => {
    const q = form.incident_w3w.trim();
    if (q.length < 2) {
      setW3wSuggestions([]);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      setW3wSuggestBusy(true);
      void fetchWhat3WordsAutosuggest(q)
        .then((r) => {
          if (!cancelled) setW3wSuggestions(r.suggestions);
        })
        .catch(() => {
          if (!cancelled) setW3wSuggestions([]);
        })
        .finally(() => {
          if (!cancelled) setW3wSuggestBusy(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [form.incident_w3w]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let image_urls = [...form.image_urls];
      if (pendingFiles.length > 0) {
        const uploaded = await uploadIncidentImages(pendingFiles);
        image_urls = [...image_urls, ...uploaded];
      }

      const payload = incidentCreateSchema.parse({
        incident_date: form.incident_date,
        incident_time: form.incident_time,
        incident_type: form.incident_type,
        severity: form.severity,
        location: form.location,
        description: form.description.trim(),
        actions_taken: form.actions_taken.trim(),
        reporter_name: form.reporter_name,
        department: form.department,
        incident_w3w: form.incident_w3w.trim() || undefined,
        image_urls,
      });

      await createIncident(payload);
      clearLocalIncidentDraft();
      void clearIncidentDraft().catch(() => {});
      setForm(emptyIncidentDraft());
      setPendingFiles([]);
      setSuccess("Incident reported. It appears under Incident log.");
    } catch (err) {
      if (err instanceof ZodError) {
        setError(formatFlattenedZodError(err.flatten()));
      } else if (err instanceof ValidationFailedError) {
        setError(formatFlattenedZodError(err.details));
      } else {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  const errorLines = error?.split("\n").filter(Boolean) ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Report a fire &amp; safety incident
          </h1>
          <p className="mt-1 text-slate-600">
            Use this duty form for alarms, evacuations, medical events, hazards, and
            crowd-safety issues on site. Date, time, location, category, severity, description,
            actions, your name, and department or team are required. Optional what3words helps
            pin the incident on site. You can add up to {INCIDENT_IMAGE_URL_MAX} optional
            photos (stored on Vercel Blob). While you type, your draft is saved to this device and
            to the database (when signed in); new file picks are kept in the browser until you
            submit.
          </p>
        </div>
        <Link
          to="/incidents/log"
          className="min-h-11 shrink-0 content-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
        >
          View all reports
        </Link>
      </header>

      {draftNotice ? (
        <p
          className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
          role="status"
        >
          {draftNotice}
        </p>
      ) : null}

      {error ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          <p className="font-semibold">Please fix the following:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {errorLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Duty report</h2>
        <form onSubmit={(e) => void onSubmit(e)} className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="incident_date" className="block text-sm font-medium text-slate-700">
                Incident date (Jalsa days) <span className="text-red-700">*</span>
              </label>
              <select
                id="incident_date"
                required
                value={form.incident_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, incident_date: e.target.value }))
                }
                className="mt-1 w-full min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base"
              >
                <option value="">Select day</option>
                {JALSA_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {jalsaDaySelectLabel(d)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="incident_time" className="block text-sm font-medium text-slate-700">
                Time on site <span className="text-red-700">*</span>
              </label>
              <select
                id="incident_time"
                required
                value={form.incident_time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, incident_time: e.target.value }))
                }
                className="mt-1 w-full min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base"
              >
                <option value="">Select time</option>
                {INCIDENT_TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                30-minute slots (06:00–23:30). Pick the closest start time.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="incident_type" className="block text-sm font-medium text-slate-700">
                Fire &amp; safety category <span className="text-red-700">*</span>
              </label>
              <select
                id="incident_type"
                required
                value={form.incident_type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    incident_type:
                      e.target.value as IncidentDraft["incident_type"],
                  }))
                }
                className="mt-1 w-full min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base"
              >
                <option value="">Select category</option>
                {INCIDENT_TYPE_CODES.map((code) => (
                  <option key={code} value={code}>
                    {INCIDENT_TYPE_LABELS[code]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-slate-700">
                Severity <span className="text-red-700">*</span>
              </label>
              <select
                id="severity"
                required
                value={form.severity}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    severity: e.target.value as IncidentDraft["severity"],
                  }))
                }
                className="mt-1 w-full min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base"
              >
                <option value="">Select severity</option>
                {SEVERITY_LEVELS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700">
              Location on site <span className="text-red-700">*</span>
            </label>
            <select
              id="location"
              required
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className="mt-1 w-full min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base"
            >
              <option value="">Select location</option>
              {SITE_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              What happened <span className="text-red-700">*</span>
            </label>
            <textarea
              id="description"
              required
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={4}
              placeholder="Facts only: what you saw, who was involved, immediate risk…"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
            />
          </div>
          <div>
            <label htmlFor="actions_taken" className="block text-sm font-medium text-slate-700">
              Actions taken <span className="text-red-700">*</span>
            </label>
            <textarea
              id="actions_taken"
              required
              value={form.actions_taken}
              onChange={(e) =>
                setForm((f) => ({ ...f, actions_taken: e.target.value }))
              }
              rows={3}
              placeholder="Who was informed, cordons, medical help, stand-down, etc."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
            />
          </div>

          <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/80 p-4 ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-900">Photos (optional)</p>
            <p className="mt-1 text-xs text-slate-600">
              Up to {INCIDENT_IMAGE_URL_MAX} images (camera or gallery).{" "}
              {photoSlotsLeft > 0
                ? `${photoSlotsLeft} slot(s) left.`
                : "Remove a photo to add another."}
            </p>
            <input
              id="incident_photos"
              type="file"
              accept="image/*"
              multiple
              disabled={photoSlotsLeft <= 0}
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                const room = Math.max(
                  0,
                  INCIDENT_IMAGE_URL_MAX -
                    form.image_urls.length -
                    pendingFiles.length,
                );
                if (room > 0 && picked.length > 0) {
                  setPendingFiles((prev) => [...prev, ...picked.slice(0, room)]);
                }
                e.target.value = "";
              }}
              className="sr-only"
            />
            <label
              htmlFor="incident_photos"
              className={`mt-3 flex min-h-12 cursor-pointer items-center justify-center rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-center text-base font-semibold text-slate-900 shadow-sm transition hover:border-red-800 hover:bg-red-50 ${
                photoSlotsLeft <= 0
                  ? "pointer-events-none cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              Add photos (tap to choose or take a picture)
            </label>
            {form.image_urls.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {form.image_urls.map((url, i) => (
                  <li
                    key={`${url}-${i}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2 ring-1 ring-slate-200"
                  >
                    <span className="truncate font-mono text-xs text-slate-600" title={url}>
                      Uploaded {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          image_urls: f.image_urls.filter((_, j) => j !== i),
                        }))
                      }
                      className="shrink-0 text-sm font-medium text-red-800 underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {pendingFiles.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm">
                {pendingFiles.map((file, i) => (
                  <li
                    key={`${file.name}-${i}-${file.size}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white px-3 py-2 ring-1 ring-amber-200"
                  >
                    <span className="truncate text-slate-800" title={file.name}>
                      Pending: {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingFiles((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="shrink-0 text-sm font-medium text-red-800 underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reporter_name" className="block text-sm font-medium text-slate-700">
                Your name <span className="text-red-700">*</span>
              </label>
              <input
                id="reporter_name"
                required
                autoComplete="name"
                value={form.reporter_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reporter_name: e.target.value }))
                }
                className="mt-1 w-full min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base"
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-700">
                Department or team <span className="text-red-700">*</span>
              </label>
              <input
                id="department"
                required
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
                placeholder="Free text — e.g. Fire marshal team A, Catering H&S"
                className="mt-1 w-full min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base"
              />
              <p className="mt-1 text-xs text-slate-500">
                Short label for your duty area or team (not a fixed list).
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="incident_w3w" className="block text-sm font-medium text-slate-700">
              what3words address (optional)
            </label>
            <div className="mt-1 flex flex-col gap-2">
              <input
                id="incident_w3w"
                value={form.incident_w3w}
                onChange={(e) => {
                  setW3wNotice(null);
                  setForm((f) => ({ ...f, incident_w3w: e.target.value }));
                }}
                placeholder="e.g. index.home.raft"
                autoComplete="off"
                aria-describedby="incident_w3w_help"
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={
                    w3wVerifyBusy ||
                    !form.incident_w3w.trim() ||
                    !isPlausibleIncidentW3w(form.incident_w3w)
                  }
                  onClick={() => {
                    setW3wNotice(null);
                    setW3wVerifyBusy(true);
                    void fetchWhat3WordsConvert(form.incident_w3w)
                      .then((r) => {
                        setForm((f) => ({ ...f, incident_w3w: r.words }));
                        setW3wNotice(
                          r.nearestPlace
                            ? `Verified: ${r.words} (near ${r.nearestPlace})`
                            : `Verified: ${r.words}`,
                        );
                        setW3wSuggestions([]);
                      })
                      .catch((err) => {
                        setW3wNotice(
                          err instanceof Error ? err.message : "Verification failed",
                        );
                      })
                      .finally(() => setW3wVerifyBusy(false));
                  }}
                  className="min-h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  {w3wVerifyBusy ? "Checking…" : "Verify with API"}
                </button>
                <button
                  type="button"
                  disabled={w3wGeoBusy || w3wVerifyBusy}
                  onClick={() => {
                    if (!navigator.geolocation) {
                      setW3wNotice(
                        "Your browser does not support location. Enter three words manually or type to search.",
                      );
                      return;
                    }
                    setW3wNotice(null);
                    setW3wGeoBusy(true);
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        void fetchWhat3WordsFromCoordinates(
                          pos.coords.latitude,
                          pos.coords.longitude,
                        )
                          .then((r) => {
                            setForm((f) => ({ ...f, incident_w3w: r.words }));
                            setW3wSuggestions([]);
                            setW3wNotice(
                              r.nearestPlace
                                ? `From your location: ${r.words} (near ${r.nearestPlace})`
                                : `From your location: ${r.words}`,
                            );
                          })
                          .catch((err) => {
                            setW3wNotice(
                              err instanceof Error
                                ? err.message
                                : "Could not look up what3words for this position.",
                            );
                          })
                          .finally(() => setW3wGeoBusy(false));
                      },
                      () => {
                        setW3wGeoBusy(false);
                        setW3wNotice(
                          "Location unavailable (permission blocked or GPS off). You can still type three words.",
                        );
                      },
                      {
                        enableHighAccuracy: true,
                        timeout: 20_000,
                        maximumAge: 60_000,
                      },
                    );
                  }}
                  className="min-h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  {w3wGeoBusy ? "Locating…" : "Use my location"}
                </button>
              </div>
            </div>
            <p id="incident_w3w_help" className="mt-1 text-xs text-slate-500">
              Type for suggestions, use <strong>Use my location</strong> to autofill from GPS (via
              server), or <strong>Verify with API</strong> once three words are complete. Needs{" "}
              <code className="rounded bg-slate-100 px-1">W3W_API_KEY</code> on the API. See{" "}
              <a
                href="https://what3words.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-red-900 underline"
              >
                what3words.com
              </a>
              . For local dev, run <code className="rounded bg-slate-100 px-1">npm run dev</code>{" "}
              so <code className="rounded bg-slate-100 px-1">/api</code> reaches the backend. Leave
              blank if not used.
            </p>
            {w3wSuggestBusy ? (
              <p className="mt-2 text-xs text-slate-500" aria-live="polite">
                Looking up…
              </p>
            ) : null}
            {w3wSuggestions.length > 0 ? (
              <ul
                className="mt-2 max-h-48 overflow-auto rounded-lg border border-slate-200 bg-white text-sm shadow-sm"
                role="listbox"
                aria-label="what3words suggestions"
              >
                {w3wSuggestions.map((s) => (
                  <li key={s.words} role="none">
                    <button
                      type="button"
                      role="option"
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-slate-100 focus:outline-none"
                      onClick={() => {
                        setForm((f) => ({ ...f, incident_w3w: s.words }));
                        setW3wSuggestions([]);
                        setW3wNotice(
                          s.nearestPlace
                            ? `Selected ${s.words} (near ${s.nearestPlace})`
                            : `Selected ${s.words}`,
                        );
                      }}
                    >
                      <span className="font-mono text-slate-900">{s.words}</span>
                      {s.nearestPlace ? (
                        <span className="ml-2 text-slate-600">· {s.nearestPlace}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {w3wNotice ? (
              <p
                className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800"
                role="status"
              >
                {w3wNotice}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-lg bg-red-800 px-4 py-3 text-base font-semibold text-white hover:bg-red-900 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Submit fire & safety report"}
          </button>
          {success ? (
            <p
              ref={successRef}
              className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
              role="status"
            >
              {success}
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
