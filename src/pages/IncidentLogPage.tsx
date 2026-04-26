import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  INCIDENT_TYPE_CODES,
  INCIDENT_TYPE_LABELS,
  SEVERITY_LEVELS,
  SITE_LOCATIONS,
  jalsaDaySelectLabel,
  type IncidentRow,
  type IncidentTypeCode,
} from "../model/incident";
import * as api from "../lib/api";
import { getActiveEvent } from "../data/events";

function rowMatchesSearch(row: IncidentRow, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const hay = [
    String(row.id),
    INCIDENT_TYPE_LABELS[row.incident_type],
    row.incident_type,
    row.severity,
    row.location,
    row.description,
    row.actions_taken ?? "",
    row.reporter_name ?? "",
    row.reporter_contact ?? "",
    row.department ?? "",
    row.incident_date ?? "",
    row.incident_time ?? "",
    row.image_urls.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

function IncidentPhotoLightbox({
  url,
  alt,
  onClose,
}: {
  url: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-5xl flex-col items-stretch gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-md ring-1 ring-slate-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
          >
            Back to log
          </button>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-black/40 p-2 ring-1 ring-white/20">
          <img
            src={url}
            alt={alt}
            className="max-h-[min(85vh,100%)] max-w-full object-contain"
          />
        </div>
        <p className="shrink-0 text-center text-xs text-white/90">
          Click outside the photo or press Esc to close.{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-white underline decoration-white/80 underline-offset-2 hover:decoration-white"
          >
            Open in new tab
          </a>
        </p>
      </div>
    </div>
  );
}

function IncidentPhotoThumb({
  url,
  incidentId,
  index,
  onOpen,
}: {
  url: string;
  incidentId: number;
  index: number;
  onOpen: () => void;
}): ReactNode {
  const [broken, setBroken] = useState(false);
  const label = `Incident #${incidentId} photo ${index + 1}`;

  if (broken) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50/80 px-2 py-2 text-xs text-amber-950">
        <p>Preview unavailable.</p>
        <button
          type="button"
          onClick={onOpen}
          className="mt-2 text-left font-medium text-red-900 underline"
        >
          Try enlarged view
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block font-medium text-red-900 underline"
        >
          Open in new tab
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <button
        type="button"
        onClick={onOpen}
        className="group block w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left shadow-sm transition hover:border-red-900/30 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2"
        aria-label={`Enlarge ${label}`}
      >
        <img
          src={url}
          alt=""
          loading="lazy"
          className="max-h-32 w-full object-contain transition group-hover:opacity-95"
          onError={() => setBroken(true)}
        />
      </button>
      <p className="text-xs text-slate-500">Click photo to enlarge</p>
    </div>
  );
}

export function IncidentLogPage() {
  const event = getActiveEvent();
  const jalsaDays = event.dates;

  const [rows, setRows] = useState<IncidentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoLightbox, setPhotoLightbox] = useState<{
    url: string;
    alt: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"" | IncidentTypeCode>("");
  const [filterSeverity, setFilterSeverity] = useState<"" | (typeof SEVERITY_LEVELS)[number]>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await api.fetchIncidents()) as IncidentRow[];
      setRows(data);
    } catch {
      setError("Could not load incident reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const allow = new Set(jalsaDays as readonly string[]);
    setFilterDate((fd) => (fd && !allow.has(fd) ? "" : fd));
  }, [jalsaDays]);

  async function onDownloadCsv() {
    setDownloading(true);
    setError(null);
    try {
      await api.downloadIncidentsCsv();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  const locationOptions = useMemo(() => {
    const set = new Set<string>(SITE_LOCATIONS);
    for (const r of rows) set.add(r.location);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterType && r.incident_type !== filterType) return false;
      if (filterSeverity && r.severity !== filterSeverity) return false;
      if (filterDate && r.incident_date !== filterDate) return false;
      if (filterLocation && r.location !== filterLocation) return false;
      return rowMatchesSearch(r, search.trim());
    });
  }, [rows, filterType, filterSeverity, filterDate, filterLocation, search]);

  const filtersActive =
    Boolean(search.trim()) ||
    Boolean(filterType) ||
    Boolean(filterSeverity) ||
    Boolean(filterDate) ||
    Boolean(filterLocation);

  function clearFilters() {
    setSearch("");
    setFilterType("");
    setFilterSeverity("");
    setFilterDate("");
    setFilterLocation("");
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Incident log</h1>
          <p className="mt-1 text-sm font-medium text-slate-800">{event.name}</p>
          <p className="mt-1 text-slate-600">
            All submitted fire &amp; safety reports. CSV export includes the same columns as below.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <Link
            to="/incidents"
            className="min-h-11 content-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          >
            New report
          </Link>
          <button
            type="button"
            onClick={() => void onDownloadCsv()}
            disabled={downloading}
            className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {downloading ? "Preparing…" : "Download CSV"}
          </button>
        </div>
      </header>

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && rows.length > 0 ? (
        <section
          aria-label="Filter incident log"
          className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="grid w-full gap-3 sm:max-w-3xl sm:grid-cols-2 lg:grid-cols-3">
              <label className="block sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-sm font-medium text-slate-700">Search</span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Text in description, location, reporter…"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-900/20"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Category</span>
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as "" | IncidentTypeCode)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-900/20"
                >
                  <option value="">All categories</option>
                  {INCIDENT_TYPE_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Severity</span>
                <select
                  value={filterSeverity}
                  onChange={(e) =>
                    setFilterSeverity(
                      e.target.value as "" | (typeof SEVERITY_LEVELS)[number],
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-900/20"
                >
                  <option value="">All severities</option>
                  {SEVERITY_LEVELS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">On-site date</span>
                <select
                  value={filterDate}
                  onChange={(e) =>
                    setFilterDate(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-900/20"
                >
                  <option value="">All dates</option>
                  {jalsaDays.map((d) => (
                    <option key={d} value={d}>
                      {jalsaDaySelectLabel(d)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-sm font-medium text-slate-700">Location</span>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-red-900 focus:outline-none focus:ring-2 focus:ring-red-900/20"
                >
                  <option value="">All locations</option>
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <p className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-semibold text-slate-900">{filteredRows.length}</span>
                {rows.length !== filteredRows.length ? (
                  <>
                    {" "}
                    of <span className="font-semibold text-slate-900">{rows.length}</span>
                  </>
                ) : null}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!filtersActive}
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
              >
                Clear filters
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section>
        {loading ? (
          <p className="text-slate-600">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-slate-600">
            No incidents yet.{" "}
            <Link to="/incidents" className="font-medium text-red-900 underline">
              Submit the first report
            </Link>
            .
          </p>
        ) : filteredRows.length === 0 ? (
          <p className="text-slate-600">
            No incidents match these filters.{" "}
            <button
              type="button"
              onClick={clearFilters}
              className="font-medium text-red-900 underline"
            >
              Clear filters
            </button>
          </p>
        ) : (
          <ul className="space-y-4">
            {filteredRows.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-sm text-slate-500">#{r.id}</span>
                  <time className="text-xs text-slate-500">
                    {new Date(r.created_at).toLocaleString("en-GB")}
                  </time>
                </div>
                <p className="mt-2 font-medium text-red-900">
                  {INCIDENT_TYPE_LABELS[r.incident_type]}
                  {r.severity ? ` · ${r.severity}` : ""}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {r.incident_date ?? "-"}
                  {r.incident_time ? ` · ${r.incident_time}` : ""}
                </p>
                <p className="mt-1 font-medium text-slate-900">{r.location}</p>
                <p className="mt-2 text-sm text-slate-700">{r.description}</p>
                {r.actions_taken ? (
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium">Actions:</span> {r.actions_taken}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Reporter:</span>{" "}
                  {r.reporter_name ?? "-"}
                  {r.reporter_contact ? ` · ${r.reporter_contact}` : ""}
                  {r.department ? (
                    <>
                      <br />
                      <span className="font-medium text-slate-600">Department:</span>{" "}
                      {r.department}
                    </>
                  ) : null}
                </p>
                {r.image_urls.length > 0 ? (
                  <section
                    className="mt-4 border-t border-slate-100 pt-3"
                    aria-label={`Incident #${r.id} photos`}
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Photos
                    </h3>
                    <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {r.image_urls.map((url, i) => (
                        <IncidentPhotoThumb
                          key={`${r.id}-${url}-${i}`}
                          url={url}
                          incidentId={r.id}
                          index={i}
                          onOpen={() =>
                            setPhotoLightbox({
                              url,
                              alt: `Incident #${r.id} photo ${i + 1}`,
                            })
                          }
                        />
                      ))}
                    </div>
                  </section>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {photoLightbox ? (
        <IncidentPhotoLightbox
          url={photoLightbox.url}
          alt={photoLightbox.alt}
          onClose={() => setPhotoLightbox(null)}
        />
      ) : null}
    </div>
  );
}
