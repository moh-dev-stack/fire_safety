import { useState } from "react";
import { Link } from "react-router-dom";
import { ZodError } from "zod";
import {
  INCIDENT_TIME_SLOTS,
  INCIDENT_TYPE_CODES,
  INCIDENT_TYPE_LABELS,
  JALSA_DAYS,
  SEVERITY_LEVELS,
  SITE_LOCATIONS,
  emptyIncidentDraft,
  incidentCreateSchema,
  jalsaDaySelectLabel,
  type IncidentDraft,
} from "../model/incident";
import { ValidationFailedError, createIncident } from "../lib/api";
import { formatFlattenedZodError } from "../lib/format-validation";

export function ReportIncidentPage() {
  const [form, setForm] = useState<IncidentDraft>(() => emptyIncidentDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = incidentCreateSchema.parse({
        incident_date: form.incident_date,
        incident_time: form.incident_time,
        incident_type: form.incident_type,
        severity: form.severity,
        location: form.location,
        description: form.description.trim(),
        actions_taken: form.actions_taken.trim(),
        reporter_name: form.reporter_name,
      });

      await createIncident(payload);
      setForm(emptyIncidentDraft());
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
            actions, and your name are required.
          </p>
        </div>
        <Link
          to="/incidents/log"
          className="min-h-11 shrink-0 content-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
        >
          View all reports
        </Link>
      </header>

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
      {success ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {success}
        </p>
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
          <div>
            <label htmlFor="reporter_name" className="block text-sm font-medium text-slate-700">
              Your name <span className="text-red-700">*</span>
            </label>
            <input
              id="reporter_name"
              required
              value={form.reporter_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, reporter_name: e.target.value }))
              }
              className="mt-1 w-full min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-base"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-lg bg-red-800 px-4 py-3 text-base font-semibold text-white hover:bg-red-900 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Submit fire & safety report"}
          </button>
        </form>
      </section>
    </div>
  );
}
