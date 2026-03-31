# Incident log page

**Route:** `/incidents/log` (protected)  
**Source:** `src/pages/IncidentLogPage.tsx`  
**API:** `src/lib/api.ts` — `fetchIncidents`, `downloadIncidentsCsv`  
**Types/labels:** `src/model/incident.ts` — `IncidentRow`, `INCIDENT_TYPE_LABELS`, `JALSA_DAYS`, `jalsaDaySelectLabel`, `SEVERITY_LEVELS`, `SITE_LOCATIONS`, `INCIDENT_TYPE_CODES`

## Purpose

Browse **all submitted** incidents, narrow them with **search + filters**, open **new report**, or **download CSV**.

## Header actions

| Control | Behaviour |
|---------|-----------|
| **New report** | `<Link to="/incidents">` — styled as secondary button. |
| **Download CSV** | Calls `downloadIncidentsCsv()`; label “Preparing…” while running; errors in alert region. |

## Global states

| State | UI |
|--------|-----|
| **Loading** | Single “Loading…” paragraph until first fetch completes. |
| **Error** | Red alert (e.g. load failure, CSV failure). |
| **Empty list** | Prompt + link to submit first report. |
| **Filters exclude everything** | “No incidents match…” + **Clear filters** text button. |

## Filter panel (`rows.length > 0` only)

Shown inside a labelled region **“Filter incident log”**. Clearing filters resets all controls below.

| Control | Type | What it filters |
|---------|------|-----------------|
| **Search** | `<input type="search">` | Case-insensitive substring across concatenated fields: id, type code + label, severity, location, description, actions, reporter name/contact, incident date/time, **and each `image_urls` string** (e.g. part of a Blob path). **Planned:** also `aims_id`, `department`, `radio_info` when those columns exist — see [Reporter fields (planned)](#planned--reporter-fields--super-admin). |
| **Category** | `<select>` | `INCIDENT_TYPE_CODES`; option text is the **code** (e.g. `Fire`), not the long label. |
| **Severity** | `<select>` | `SEVERITY_LEVELS` |
| **On-site date** | `<select>` | `JALSA_DAYS`; option labels via `jalsaDaySelectLabel` |
| **Location** | `<select>` | Union of **`SITE_LOCATIONS`** plus **any `location` string** appearing in loaded rows (sorted); lets you filter ad hoc locations from data. |
| **Clear filters** | `<button>` | Disabled when no filter active (no search trim, no type, severity, date, or location). |

**Counter:** “Showing **N** [of **M**]” updates with filtered vs total.

## Incident cards (list)

Each row (`IncidentRow`) displays:

| Display | Source field |
|---------|----------------|
| `#id` | `r.id` (mono, small) |
| Timestamp | `r.created_at` — `toLocaleString("en-GB")` |
| Title line | `INCIDENT_TYPE_LABELS[r.incident_type]` + ` · {severity}` if present |
| On-site date/time | `incident_date` or `—`; optional `incident_time` |
| Location | `location` (bold line) |
| Description | `description` |
| Actions | `actions_taken` if set |
| Reporter | `reporter_name`, `reporter_contact` if either present |
| **Planned:** AIMS ID / department / radio | `aims_id`, `department`, `radio_info` when present — see [Reporter fields (planned)](#planned--reporter-fields--super-admin). |
| **Planned:** Operational status | `operational_status`, `status_updated_at`, optional `status_comment` — see [Super admin (planned)](#planned--reporter-fields--super-admin). |
| **Planned:** Admin notes | `admin_notes` (super-admin only; internal). |
| **Photos** | If `r.image_urls.length > 0`: region **`aria-label`** `Incident #{id} photos`, heading “Photos”, grid of thumbnails. Each thumb is a **button** (`aria-label` e.g. `Enlarge Incident #… photo N`); helper text “Click photo to enlarge”. **Lightbox:** full-screen `role="dialog"`, **Back to log** closes; **click backdrop** or **Esc** also closes; footer text + **Open in new tab** link. Broken thumbnails: “Try enlarged view” + “Open in new tab”. |

**List key:** `r.id`.

## CSV export

- Triggered only from the button; column set is `INCIDENT_CSV_COLUMNS` in `incident.ts`. The **`image_urls`** column is a **JSON-encoded array** of HTTPS strings in each CSV row (same as DB), so exports and optional Blob snapshot CSVs retain photo links.
- **Planned:** add `aims_id`, `department`, `radio_info` (and super-admin-only export columns for `admin_notes` / status if PM requires) — [`plan/IncidentMandatoryReporterFields.md`](../plan/IncidentMandatoryReporterFields.md), [`plan/IncidentLogSuperAdmin.md`](../plan/IncidentLogSuperAdmin.md).

## Planned — reporter fields & super admin

**Not shipped yet.** Summaries below; full behaviour in linked plans.

| Topic | Plan |
|-------|------|
| Mandatory **name** (existing), **AIMS ID**, **department**; optional **radio_info**; log + CSV + search | [`plan/IncidentMandatoryReporterFields.md`](../plan/IncidentMandatoryReporterFields.md) |
| **Super admin:** archive/clean rows, **admin notes**, **operational status** updates; server-side role gate | [`plan/IncidentLogSuperAdmin.md`](../plan/IncidentLogSuperAdmin.md) |

**Target super-admin UX (summary):** authenticated users with super-admin claim see per-card actions: edit **admin notes**, change **status** (+ optional comment), **archive** (soft `deleted_at` preferred). Volunteers’ list hides archived rows unless a super-admin filter is on. All mutations **must** be enforced in API handlers, not UI-only.

## POC limitations & likely adjustments

- All rows load into memory; large events need **pagination** and **server-side** filter query params.
- Category filter shows **codes** in the dropdown — consider showing labels for operators.
- Role-based redaction (e.g. hide reporter contact) not implemented.
- **If you add filters or change which fields are searchable**, document them here and in [README.md](./README.md).
- **Planned fields and super-admin** behaviour are specified in `plan/` — update this file when those ship so “Planned” sections become the live contract.
