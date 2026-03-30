# Report incident page

**Route:** `/incidents` (protected)  
**Source:** `src/pages/ReportIncidentPage.tsx`  
**Model / dropdown definitions:** `src/model/incident.ts`  
**API:** `src/lib/api.ts` — `fetchIncidentDraft`, `saveIncidentDraft`, `clearIncidentDraft`, `uploadIncidentImages`, `createIncident`  
**Local draft:** `src/lib/incident-draft-local.ts`  
**Validation:** Zod — `incidentCreateSchema`; user-facing errors via `formatFlattenedZodError`

## Purpose

Duty form to log fire & safety incidents on site: structured dropdowns plus narrative fields. Drafts persist **in the browser** and **on the server** (when API is reachable) with merge rules on load.

## Header actions

| Element | Behaviour |
|---------|-----------|
| **Title / description** | Explains required fields and auto-save behaviour. |
| **“View all reports”** | `<Link>` to `/incidents/log`. |

## Status / feedback (non-form)

| Message | When |
|---------|------|
| **Blue info banner** (`role="status"`) | After hydrate: restored from DB vs device; auto-dismiss ~9s. |
| **Red validation box** (`role="alert"`) | Zod or `ValidationFailedError`; bullet list per line. |
| **Green success** | After successful `createIncident`; form resets; drafts cleared. |

## Form controls (duty report)

All required unless noted. Select options come from `incident.ts` — **if you add/remove options, update server/DB and [README.md](./README.md) enum snapshot.**

| # | Field | Control | Options / rules |
|---|-------|---------|-----------------|
| 1 | Incident date (Jalsa days) | `<select>` | `JALSA_DAYS`: `2026-07-24`, `2026-07-25`, `2026-07-26` — labels via `jalsaDaySelectLabel` (e.g. Fri 24 Jul 2026). |
| 2 | Time on site | `<select>` | `INCIDENT_TIME_SLOTS`: half hours **06:00–23:30**. Helper text: 30-minute slots, pick closest start. |
| 3 | Fire & safety category | `<select>` | `INCIDENT_TYPE_CODES` as **value**; **label** from `INCIDENT_TYPE_LABELS` (long descriptions). |
| 4 | Severity | `<select>` | `SEVERITY_LEVELS`: **Low**, **Medium**, **High**. |
| 5 | Location on site | `<select>` | `SITE_LOCATIONS` — fixed list of 13 site strings (see main README table). |
| 6 | What happened | `<textarea>` | Required; max **8000** chars; placeholder guides factual wording. |
| 7 | Actions taken | `<textarea>` | Required; max **8000** chars. |
| 8 | Your name | `<input>` text | Required; trimmed; max **200** chars. |
| 9 | Photos (optional) | `<input type="file" multiple>` | Accepts JPEG, PNG, WebP, HEIC/HEIF; up to **`INCIDENT_IMAGE_URL_MAX` (8)** total across uploaded URLs + pending files. **Uploaded** URLs live in draft (`image_urls`); **pending** `File`s only in memory until submit. On submit, files upload via `@vercel/blob/client` → `uploadIncidentImages` (handshake `POST /api/incidents/blob-upload`) then `createIncident` sends HTTPS Blob URLs. |
| **Submit** | Button | **“Submit fire & safety report”** / “Saving…” when busy; disabled while saving. |

**Not collected:** `reporter_contact` (may exist on stored rows from API).

## Draft autosave

- On mount: tries **server draft** (`fetchIncidentDraft`) vs **local** (`loadLocalIncidentDraftMeta`); picks newer by timestamp; empty drafts skipped.
- After `hydrated`: **~650 ms debounce** on any `form` change — writes local + `saveIncidentDraft`; if form is empty, clears local + server draft.
- Successful submit: `clearLocalIncidentDraft`, `clearIncidentDraft`, `emptyIncidentDraft()`.

## POC limitations & likely adjustments

- Adding a category/location/day requires **client `incident.ts`, API Zod, and database** to stay aligned.
- Attachments, GPS pin, or “other location” free text would need schema + UI changes.
- Stricter offline queue if connectivity is poor on site.
- **Whenever dropdown enums change**, update this file and the shared tables in [README.md](./README.md).
