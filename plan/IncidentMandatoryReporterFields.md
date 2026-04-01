# Incident report & log — reporter identity, radio information

**Addendum (engineering):** The POC now ships **mandatory free-text `department`** and **optional `incident_w3w`** (what3words via server proxy and `W3W_API_KEY`). **AIMS ID** and **radio** fields below are **not** implemented yet; this file remains the spec for those follow-ups.

**Scope:**

1. **Mandatory on submit:** **reporter name**, **AIMS ID**, and **department** — persist, show on **incident log**, **CSV**, **draft autosave**.  
2. **Radio information:** an additional **structured piece of data** for **comms** (how to reach the reporter on the radio net: channel, callsign, handset/radio ID, or short free text as PM defines). Persist and display like other incident fields.

Align labels and allowed values with **PM documentation**.

**Report route:** `/incidents` — [`src/pages/ReportIncidentPage.tsx`](../src/pages/ReportIncidentPage.tsx)  
**Log route:** `/incidents/log` — [`src/pages/IncidentLogPage.tsx`](../src/pages/IncidentLogPage.tsx)  
**Model:** [`src/model/incident.ts`](../src/model/incident.ts) — extend `incidentCreateSchema`, `IncidentDraft`, `IncidentRow`, CSV columns  
**API / DB:** [`api/incidents.ts`](../api/incidents.ts), draft endpoints if they mirror full payload, Neon `incidents` table

---

## Documentation outcome

| Deliverable | Role |
|-------------|------|
| This file [`plan/IncidentMandatoryReporterFields.md`](IncidentMandatoryReporterFields.md) | **Plan + spec** for mandatory identity fields **and** radio/comms field(s). |
| [`readme_page/ReportIncidentPage.md`](../readme_page/ReportIncidentPage.md) | Update form table: **AIMS ID**, **Department** (mandatory), **Radio information** (see rules below). |
| [`readme_page/IncidentLogPage.md`](../readme_page/IncidentLogPage.md) | Document display on cards, search, CSV columns for all new fields. |
| **PM documentation** | **AIMS ID** format; **department** list; **radio net** SOP (what to collect: channel vs callsign vs “Fire & Safety net”). |

### PM references (fill when artefact is available)

- *AIMS ID* spelling/branding as used organisation-wide.
- Authoritative **department** options (fixed dropdown) or policy for “Other”.
- **Radio:** official channel names / numbering for Jalsa ops; whether the field is **mandatory** for duty holders vs **optional** for ad hoc reporters.
- Until linked: align with [`docs/POC-FRAMEWORK.md`](../docs/POC-FRAMEWORK.md).

---

## Fields — reporter identity (mandatory on submit)

| Field | API / DB name (proposed) | Rules (POC — tighten per PM) |
|-------|-------------------------|------------------------------|
| **Name** | `reporter_name` (existing) | **Already mandatory** today; keep as **full name** of person filing the report; max length as today (200) unless PM asks otherwise. |
| **AIMS ID** | `aims_id` (new) | Required string; trim; **format TBD with PM** (e.g. numeric-only, fixed width, or alphanumeric with hyphen); enforce with Zod once PM confirms. |
| **Department** | `department` (new) | Required string; either **`DEPARTMENTS` const** in `incident.ts` (preferred if PM supplies list) or constrained text with min/max length; optional **“Other — specify”** pattern if PM allows. |

**Privacy / copy:** Helper text should state identifiers are used for **duty coordination** and log integrity (exact wording from PM).

---

## Fields — radio / communications information

**Intent:** Capture **how the reporter relates to the radio plan** so control / duty office can **callback or coordinate** without guessing.

| Approach | API / DB | When to use |
|----------|----------|-------------|
| **A. Single text (POC default)** | `radio_info` (`text`, nullable or empty string) | One `<input>` or short `<textarea>`; placeholder lists examples PM prefers (*e.g. “Channel 3 · callsign Fire-1”*). **Max length** e.g. 200–500 via Zod. |
| **B. Structured (if PM insists)** | `radio_channel`, `radio_callsign` (nullable texts) | Separate fields for analytics/filtering; more UI and migration surface. |

**Mandatory vs optional:** **Default plan:** `radio_info` is **optional** (`z.string().max(...).optional()` or empty allowed) so volunteers without a handset can still submit. If PM requires **mandatory** radio details for certain roles only, that is **out of POC** unless you add role-aware validation later; otherwise make **mandatory for everyone** with Zod `.min(1)` after PM sign-off.

**Report form:** Group under a **“Radio / communications”** fieldset (or subheading) with concise helper text from PM (e.g. *“If you are on the fire & safety net, state channel and callsign.”*).

**Incident log:** Show **Radio** line on each card when non-empty; include in **search** substring and **CSV**.

**Drafts / API / DB:** Same pipeline as `aims_id` / `department`: column + `INSERT` + `mapRow` + draft shape.

---

## Behaviour (shared)

### Report form ([`ReportIncidentPage.tsx`](../src/pages/ReportIncidentPage.tsx))

- Add **AIMS ID** and **Department** as in mandatory table.
- Add **radio** field(s) per PM (single `radio_info` unless structured).
- Place identity fields in a **“Your details”** fieldset; radio in **“Radio / communications”** immediately after or below.
- **Submit** blocked until mandatory identity fields valid; radio validated only if non-empty or if PM marks required.

### Drafts (server + local)

- Extend `IncidentDraft` / `emptyIncidentDraft` and draft paths for **all** new columns.

### API POST create

- Extend `INSERT` with `aims_id`, `department`, `radio_info` (or structured equivalents).
- Reject invalid payloads with **400** + Zod flatten.

### Database migration (Neon)

- New columns: `aims_id`, `department`, `radio_info` (type `text`). Use **NULL** or `''` for legacy rows per PM; avoid silent bogus defaults.

### Incident log ([`IncidentLogPage.tsx`](../src/pages/IncidentLogPage.tsx))

- Show **Name**, **AIMS ID**, **Department**, **Radio** on each card where applicable.
- **Search:** include `aims_id`, `department`, `radio_info` in concatenated search string.

### CSV export

- Append columns in order agreed with PM (e.g. `reporter_name`, `aims_id`, `department`, `radio_info`).

### Tests

- Zod: missing mandatory identity; optional `radio_info` empty vs filled; max length.
- If radio becomes mandatory, add negative test for empty radio.

---

## Implementation checklist

- [ ] PM: AIMS ID format; department list; **radio field copy** and **mandatory vs optional**.
- [ ] DB migration + backfill for legacy incidents.
- [ ] `incident.ts` Zod + types + CSV columns + draft shape.
- [ ] `api/incidents.ts` + `incident-map.ts` + any draft endpoint.
- [ ] `ReportIncidentPage.tsx` UI (identity + radio fieldset).
- [ ] `IncidentLogPage.tsx` display + search.
- [ ] `readme_page/ReportIncidentPage.md` + `readme_page/IncidentLogPage.md`.

---

## Related plans

- [Incident log — super admin](IncidentLogSuperAdmin.md) — admin UI/exports should include new columns where relevant.
- [Rota availability](RotaAvailabilityPage.md) — unrelated.
