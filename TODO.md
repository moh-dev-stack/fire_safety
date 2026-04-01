# TODO checklist — Fire & Safety POC (from product / plan backlog)

Use this as a working list. **Specs:** [`plan/`](plan/) and [`readme_page/`](readme_page/). Check items off as you ship them.

---

## Rota maker (availability) — **removed**

The `/rota/availability` page, `rotaAvailability` data module, and feature flag were deleted. Historical spec: [`plan/RotaAvailabilityPage.md`](plan/RotaAvailabilityPage.md).

---

## Incident report — mandatory fields & radio

**Spec:** [`plan/IncidentMandatoryReporterFields.md`](plan/IncidentMandatoryReporterFields.md) · **Docs:** [`readme_page/ReportIncidentPage.md`](readme_page/ReportIncidentPage.md), [`readme_page/IncidentLogPage.md`](readme_page/IncidentLogPage.md)

**Shipped:** mandatory **free-text `department`**, optional **`incident_w3w`** (+ `/api/what3words/*` proxy, `W3W_API_KEY`), report/log/CSV/drafts/tests updated.

- [ ] PM: AIMS ID format, radio field copy and mandatory vs optional
- [ ] Neon migration: `aims_id`, `radio_info` (+ backfill strategy for existing rows)
- [ ] Extend model/API/UI for AIMS + radio; log search + CSV
- [ ] Tests for new fields

---

## Users & roles — admin (sees everything) vs restricted

**Goal:** **Two login tiers** for the POC: an **admin** account that sees **all** data and controls; a **restricted** (volunteer) account with a **narrower** view and no dangerous mutations.

**Spec:** [`plan/IncidentLogSuperAdmin.md`](plan/IncidentLogSuperAdmin.md) — extend with explicit **restricted** redaction rules if not already detailed.

- [ ] **PM:** what restricted users **must not** see or do (e.g. `admin_notes`, operational status editor, archived rows, bulk export fields, `reporter_contact` redaction on cards)
- [ ] **Two passwords / env vars:** e.g. admin vs volunteer secret in `api/login.ts` (or single table later) — names and rotation in [`DEVELOPER.md`](DEVELOPER.md)
- [ ] **Session claim:** after login, server sets **role** in signed session only — e.g. `admin` | `restricted` (never from client JSON alone)
- [ ] **`api/lib/auth.ts`:** helpers such as `requireAuth`, `requireAdmin`; use on every admin-only route
- [ ] **`/api/me` (or extend existing auth response):** return `role` so [`AuthProvider`](src/auth/AuthProvider.tsx) / [`useAuth`](src/auth/useAuth.ts) can branch UI
- [ ] **Admin experience:** full incident log, super-admin panel, show archived filter, CSV with all columns, any future “staff only” nav
- [ ] **Restricted experience:** same app shell but **no** admin panels, **no** archive/delete/status PATCH, list **excludes** archived; hide or mask fields per PM; **403** from API if they hit admin URLs
- [ ] **Login copy:** short line on [`LoginPage`](src/pages/LoginPage.tsx) that operators use the correct credential tier (without revealing which password is which in production — PM/security)
- [ ] **Docs:** update [`readme_page/LoginPage.md`](readme_page/LoginPage.md) and [`readme_page/IncidentLogPage.md`](readme_page/IncidentLogPage.md) with role matrix

---

## Incident log — super admin

**Spec:** [`plan/IncidentLogSuperAdmin.md`](plan/IncidentLogSuperAdmin.md) · **Doc:** [`readme_page/IncidentLogPage.md`](readme_page/IncidentLogPage.md)  
**Depends on:** the **Users & roles** section above — super-admin UI is **admin**-only.

- [ ] PM: who may use admin account, soft archive vs hard delete, retention, audit, CSV rules for admin columns
- [ ] Super-admin auth aligns with the **admin** role (same session tier — avoid a second mystery password unless PM wants it)
- [ ] Neon: `admin_notes`, `operational_status`, `status_updated_at`, `status_comment`, `deleted_at` (and audit cols if needed)
- [ ] API: `isSuperAdmin`; GET list respects archive; PATCH notes/status; archive endpoint
- [ ] `IncidentLogPage.tsx`: super-admin panel (notes, status, archive) + optional “show archived”
- [ ] Document in `DEVELOPER.md` how to configure admin access
- [ ] Remove or shrink **“Planned — super admin”** in readme when live

---

## Training module (SOP + quiz)

**Spec:** [`plan/TrainingModule.md`](plan/TrainingModule.md) · **Doc:** [`readme_page/TrainingPage.md`](readme_page/TrainingPage.md)

**Shipped (POC):** `/training` hub + `/training/fire-extinguishers` (`src/data/trainingFireExtinguishers.ts`, five MCQs, `public/training/*.svg`), `ENABLE_TRAINING_MODULE`, last-score `localStorage`.

- [x] Add `ENABLE_TRAINING_MODULE` to `src/config/features.ts`
- [x] Fire extinguisher + fire triangle module + **5** MCQs + images
- [x] `TrainingPage.tsx` + gated routes/nav
- [x] Refresh [`readme_page/TrainingPage.md`](readme_page/TrainingPage.md)
- [ ] PM-approved full **SOP** text → `src/data/trainingSop.ts` (or merged) if beyond current module
- [ ] Broader topic modules → `src/data/training.ts` as needed
- [ ] Update [`docs/POC-FRAMEWORK.md`](docs/POC-FRAMEWORK.md) / presentation when PM wants training in stakeholder story

---

## Venue checklist page

**Doc:** [`readme_page/VenueChecklistPage.md`](readme_page/VenueChecklistPage.md)

- [x] `ENABLE_VENUE_CHECKLIST`, `/venue-checklist`, Kitchen + Car park + Langar checklists (no site dropdown), draft autosave, **submit** + **submissions** list, JSON export (`draft-v2` / `submissions-v2` keys)

---

## Multi-site (different sites)

**Goal:** Run or demo the same app **per event site** (different dates, map, location lists, copy) without forking the repo.

- [ ] PM: list of **sites** (e.g. Islamabad UK, future venues) and what must change per site
- [ ] Single **site config** slice: event name, date range (`JALSA_DAYS` equivalent), default map centre/zoom, optional logo/key colour (if UI supports)
- [ ] **Location list** (`SITE_LOCATIONS` or per-site override): ensure car park + kitchen entries exist where needed (see below)
- [ ] **Build/runtime switch**: e.g. `VITE_EVENT_SITE=islamabad-2026` or dropdown for demos — document in [`DEVELOPER.md`](DEVELOPER.md)
- [ ] **Data files** split or merged: `team.ts` / `rota.ts` / training copy per site or parametrized
- [ ] **Neon / API**: if one DB serves multiple sites, add `site_id` (or event key) on incidents + filter in API (plan migration with PM)
- [ ] Update [`docs/POC-FRAMEWORK.md`](docs/POC-FRAMEWORK.md) and presentation when multi-site story is real

---

## Venue extensions — car park

**Goal:** Car park is explicitly covered in **locations**, **training**, **map**, and **ops checklists**.

- [ ] **Incident form / `SITE_LOCATIONS`:** distinct options if PM wants (e.g. “Parking — main field”, “Parking — overflow”, **“Parking — pedestrian routes / gates”**, “Parking — vehicle incident zone”) — align with [`src/model/incident.ts`](src/model/incident.ts) + DB
- [ ] **Map ([`MapPage`](src/pages/MapPage.tsx)):** marker(s) or notes for car-park assembly / hazards (per site)
- [ ] **Training (`training.ts`):** module or SOP bullets: traffic flow, **keeping emergency access clear**, fuel/vehicle incident **who to radio**, bad weather parking
- [ ] **SOP (`trainingSop.ts`):** car-park-specific escalation (duty office, marshals)
- [ ] **Rota / team:** optional rows for parking stewards in [`src/data/team.ts`](src/data/team.ts) / rota if applicable
- [ ] **Quiz:** at least one MCQ on parking / access (when training ships)

---

## Venue extensions — kitchen / langar

**Goal:** Kitchen / catering / langar areas have **clear reporting paths**, **locations**, and **training** (fires, burns, gas/LPG if relevant — **PM / H&S only**).

- [ ] **`SITE_LOCATIONS`:** add or refine strings PM approves (e.g. **“Kitchen / langar preparation”**, **“Serving marquee — hot food”**, “Greases / oil storage — if separate”) — keep in sync with API + Neon
- [ ] **Incident categories:** confirm whether existing `INCIDENT_TYPE_CODES` cover kitchen (Fire, Equipment, Other) or PM wants a dedicated label in description/SOP only
- [ ] **Training:** module on **grease/oil fire basics**, isolations, evacuating catering zones, **not fighting oil fires with water** (wording from PM)
- [ ] **SOP:** first aid / fire for kitchen; who notifies duty lead; gas isolation wording if on site
- [ ] **Map:** marker or annotation for kitchen/langar cluster (per site)
- [ ] **Quiz:** at least one MCQ tied to kitchen / catering safety (when training ships)

---

## Product & technical extensions (optional)

*Use only if you need these beyond the core POC.*

- [ ] **Feature flags / plug-in pages:** extra routes behind `src/config/features.ts` (pattern from rota availability / training plans)
- [ ] **PWA / offline:** service worker, install prompt, offline incident draft queue (larger piece)
- [ ] **Browser extension:** scope TBD (e.g. quick link to report URL — only if stakeholders ask)
- [ ] **Integrations:** CSV webhook, email digest, Microsoft Teams — PM + security review first
- [ ] **Export file formats:** extra extensions (e.g. `.xlsx`) beyond CSV — new dependency + API surface

---

## Docs & index

- [ ] [`readme_page/README.md`](readme_page/README.md) — keep routes / maintenance table aligned when pages ship or are removed
- [ ] [`plan/*`](plan/) — tick implementation checklists inside each plan file when you prefer detail there
- [ ] PM artefact links filled in under **PM references** in each plan

---

## Optional / later

- [ ] Rota availability (if reintroduced): server + DB for pooled submissions (multi-device)
- [ ] Training: formal completion / sign-off backend (if PM requires)
- [ ] what3words: API autosuggest (needs key)
- [ ] Incident log: pagination + server-side filters for large events
