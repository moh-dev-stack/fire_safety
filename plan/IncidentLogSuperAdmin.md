# Incident log — super-admin interactions (clean-up, notes, status)

**Scope:** Extend the **incident log** so **super admins** can **maintain** the log (including safe clean-up), see **internal admin notes**, and record **operational status updates** for each incident — without changing the standard volunteer experience for non–super-admin users.

**Route (existing):** `/incidents/log` — [`src/pages/IncidentLogPage.tsx`](../src/pages/IncidentLogPage.tsx)  
**API (today):** [`api/incidents.ts`](../api/incidents.ts) — GET list, POST create (authenticated; **no roles**)  
**Model:** [`src/model/incident.ts`](../src/model/incident.ts), [`api/lib/incident-map.ts`](../api/lib/incident-map.ts)

---

## Documentation outcome

| Deliverable | Role |
|-------------|------|
| This file [`plan/IncidentLogSuperAdmin.md`](IncidentLogSuperAdmin.md) | **Plan + spec** for super-admin behaviour, data model, API, security, and rollout. |
| [`readme_page/IncidentLogPage.md`](../readme_page/IncidentLogPage.md) | **Built-page reference** — extend with super-admin-only controls, visible fields, and API calls once implemented (same style as today’s tables). |
| [`docs/POC-FRAMEWORK.md`](../docs/POC-FRAMEWORK.md) | If POC scope or security posture changes (e.g. tiered access), update **with PM sign-off**. |
| **PM documentation** | Acceptance criteria for **who** is a super admin, **what** “clean” means (delete vs archive), retention, and **audit** expectations; link under **PM references** below. |

### PM references (fill when artefact is available)

- *Link PRD / tickets for: incident lifecycle, data retention, GDPR/reporter privacy, who may purge records.*
- Until linked: treat stakeholder baseline as [`docs/POC-FRAMEWORK.md`](../docs/POC-FRAMEWORK.md) and [`presentation/`](../presentation/).

---

## Current gaps (baseline)

- Auth is **binary** (signed in or not); there is **no super-admin** distinction in [`api/lib/auth.ts`](../api/lib/auth.ts) or session payload.
- `incidents` table (per [`api/incidents.ts`](../api/incidents.ts)) has no **`admin_notes`**, **`status`**, or **`deleted_at`** / archival flag.
- [`IncidentLogPage.tsx`](../src/pages/IncidentLogPage.tsx) is read-only aside from filters, CSV export, and navigation — **no** per-row admin actions.

---

## Product behaviour (planned)

### 1. Super-admin recognition (POC options — pick one with PM/security)

| Approach | Pros | Cons |
|----------|------|------|
| **A. Second credential via env** e.g. `SUPER_ADMIN_PASSWORD` — after normal login, optional “Unlock admin” step sets a short-lived **admin claim** in session or httpOnly cookie | Simple for demo | Two passwords to rotate; claim must be tamper-proof |
| **B. Session includes `role: 'super_admin'`** when login uses a dedicated admin account (requires user table or fixed admin secret) | Cleaner model | More setup |
| **C. Separate admin route** `/admin/...` with stricter auth | Clear separation | More pages |

**Plan default for POC:** **A or B** documented in `DEVELOPER.md` — server verifies admin on **every** mutating API call; **never** trust client-only flags.

### 2. “Clean the log” (super-admin only)

Goal: Let super admins **interact** with stored incidents to fix POC clutter (duplicates, tests, wrong submissions) **safely**.

| Capability | Behaviour |
|---------|------------|
| **Single-incident archive / delete** | Prefer **soft delete**: set `deleted_at` (timestamp) so GET list for **volunteers** excludes archived rows; super admins see toggle “Show archived” or a dedicated filter. **Hard delete** only if PM mandates and Blob/image cleanup is defined. |
| **Bulk action (optional later)** | e.g. “Archive all visible in current filter” — requires strong confirmation + optional **export CSV first** prompt. |
| **Audit** | Log `archived_by`, `archived_at` (or equivalent) for PM/stakeholder traceability where required. |

Non-super-admins: **no** delete/archive controls; list unchanged aside from not seeing archived rows.

### 3. Admin notes (super-admin visible; internal)

| Field | Behaviour |
|-------|------------|
| **`admin_notes`** | Free text (bounded length, e.g. 4k chars), **not** shown on public-facing copy or to reporters; editable only via super-admin API. |
| **UI** | On each incident card (or expandable **Admin** panel): textarea + **Save**; show **last updated** if tracked. |

PM should confirm whether **any** part of admin notes may appear in exports (default: **include in super-admin CSV only** or separate export).

### 4. Status updates (operational lifecycle)

| Field | Behaviour |
|-------|------------|
| **`operational_status`** | Small enum aligned with PM (e.g. `Received`, `Under review`, `Actioned`, `Closed`) — exact strings TBD in `incident.ts` + DB CHECK or text. |
| **`status_updated_at`** | Auto-set when status changes. |
| **`status_comment`** (optional) | Short public-facing or internal line when status changes — PM decides visibility; default **super-admin only** like notes if uncertain. |

**UI:** Super admins get a status `<select>` + optional comment + **Update status**; show a **timeline** or single line “Status: X · updated &lt;date&gt;” on the card (**all** signed-in users may see **status** for transparency, or **super-admin only** per PM — document choice in `readme_page`).

---

## Technical outline

1. **Database migration (Neon):** Add columns `admin_notes`, `operational_status`, `status_updated_at`, `status_comment` (nullable), `deleted_at`, optional `archived_by`/audit fields. Backfill: `operational_status = 'Received'`, `deleted_at` null.
2. **Session / auth helper:** e.g. `isSuperAdmin(req)` in [`api/lib/auth.ts`](../api/lib/auth.ts) (or sibling module), used by new handlers.
3. **API:**
   - Extend **GET** `/api/incidents`: default omit `deleted_at IS NOT NULL`; super admin query param `include_archived=1` or separate endpoint.
   - **PATCH** `/api/incidents/[id]` (or `api/incidents/patch.ts`): update `admin_notes`, `operational_status`, `status_comment` — **super admin only**.
   - **DELETE** or **POST archive**: set `deleted_at` — **super admin only**.
4. **Client:** [`src/lib/api.ts`](../src/lib/api.ts) — new functions; [`IncidentLogPage.tsx`](../src/pages/IncidentLogPage.tsx) — render admin panel when `useAuth()` (extended) exposes `isSuperAdmin`.
5. **CSV export:** Extend columns for admin export or keep volunteer CSV unchanged — **PM decision**.

---

## Security & UX guardrails

- **Confirmations:** Destructive actions (archive/delete) use a **modal** with typed confirm or clear “Archive incident #id” label.
- **Rate limiting / logging:** Consider basic logging server-side for admin mutations (POC minimum: `console` + Vercel logs).
- **Reporter data:** Cleaning the log may remove personal data — align with **PM** on retention and legal notice.

---

## Implementation checklist

- [ ] PM sign-off on status enum, visibility of status vs admin notes, soft vs hard delete, export rules.
- [ ] DB migration + `mapRow` / `IncidentRow` / Zod for PATCH body.
- [ ] Super-admin auth mechanism + env docs in [`DEVELOPER.md`](../DEVELOPER.md).
- [ ] API handlers + tests if present for API helpers.
- [ ] `IncidentLogPage` admin UI + `readme_page/IncidentLogPage.md` update.
- [ ] [`docs/POC-FRAMEWORK.md`](../docs/POC-FRAMEWORK.md) if tiered access changes POC messaging.

---

## Related plans

- [Mandatory reporter fields (name, AIMS ID, department)](IncidentMandatoryReporterFields.md) — extends each incident row; **super-admin UI and exports** should include these columns where relevant.
- [Rota availability / rota maker](RotaAvailabilityPage.md) — separate feature; no overlap except shared PM documentation discipline.
