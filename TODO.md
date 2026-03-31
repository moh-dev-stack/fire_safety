# TODO checklist — Fire & Safety POC (from product / plan backlog)

Use this as a working list. **Specs:** [`plan/`](plan/) and [`readme_page/`](readme_page/). Check items off as you ship them.

---

## Rota maker (availability)

**Spec:** [`plan/RotaAvailabilityPage.md`](plan/RotaAvailabilityPage.md) · **Doc:** [`readme_page/RotaAvailabilityPage.md`](readme_page/RotaAvailabilityPage.md)

- [ ] Add `src/config/features.ts` with `ENABLE_ROTA_AVAILABILITY_PAGE`
- [ ] Add `src/data/rotaAvailability.ts` (6 h slots: 08:00–14:00, 14:00–20:00; night 20:00–08:00; reuse `JALSA_DAYS`)
- [ ] Optional `src/lib/what3words-format.ts` (normalise + validate `word.word.word`)
- [ ] Implement `src/pages/RotaAvailabilityPage.tsx` (name, optional what3words, per-day checkboxes, submit, summary, JSON export, `localStorage`)
- [ ] Gate `<Route path="rota/availability" … />` and nav item on the flag; `ROTA_AVAILABILITY_PAGE` comment blocks for easy comment-out
- [ ] Refresh [`readme_page/RotaAvailabilityPage.md`](readme_page/RotaAvailabilityPage.md) to match shipped UI (remove “planned” wording where accurate)
- [ ] PM references + copy alignment; update [`docs/POC-FRAMEWORK.md`](docs/POC-FRAMEWORK.md) / presentation if scope changes

---

## Incident report — mandatory fields & radio

**Spec:** [`plan/IncidentMandatoryReporterFields.md`](plan/IncidentMandatoryReporterFields.md) · **Docs:** [`readme_page/ReportIncidentPage.md`](readme_page/ReportIncidentPage.md), [`readme_page/IncidentLogPage.md`](readme_page/IncidentLogPage.md)

- [ ] PM: AIMS ID format, department list (`DEPARTMENTS` or free text rules), radio field copy and mandatory vs optional
- [ ] Neon migration: `aims_id`, `department`, `radio_info` (+ backfill strategy for existing rows)
- [ ] Extend `src/model/incident.ts` (Zod, `IncidentDraft`, `IncidentRow`, `INCIDENT_CSV_COLUMNS`)
- [ ] Extend `api/incidents.ts`, `api/lib/incident-map.ts`, draft endpoints as needed
- [ ] `ReportIncidentPage.tsx`: AIMS ID, department, radio / comms fieldset
- [ ] Extend draft autosave (local + server) for new fields
- [ ] `IncidentLogPage.tsx`: display + search includes `aims_id`, `department`, `radio_info`
- [ ] Tests: schema / critical path if you have coverage
- [ ] Move **“Planned”** sections in readmes into live tables when done

---

## Incident log — super admin

**Spec:** [`plan/IncidentLogSuperAdmin.md`](plan/IncidentLogSuperAdmin.md) · **Doc:** [`readme_page/IncidentLogPage.md`](readme_page/IncidentLogPage.md)

- [ ] PM: who is super admin, soft archive vs hard delete, retention, audit, CSV rules for admin columns
- [ ] Super-admin auth (e.g. env credential + session claim — see plan options)
- [ ] Neon: `admin_notes`, `operational_status`, `status_updated_at`, `status_comment`, `deleted_at` (and audit cols if needed)
- [ ] API: `isSuperAdmin`; GET list respects archive; PATCH notes/status; archive endpoint
- [ ] `IncidentLogPage.tsx`: super-admin panel (notes, status, archive) + optional “show archived”
- [ ] Document in `DEVELOPER.md` how to configure admin access
- [ ] Remove or shrink **“Planned — super admin”** in readme when live

---

## Training module (SOP + quiz)

**Spec:** [`plan/TrainingModule.md`](plan/TrainingModule.md) · **Doc:** [`readme_page/TrainingPage.md`](readme_page/TrainingPage.md)

- [ ] Add `ENABLE_TRAINING_MODULE` to `src/config/features.ts`
- [ ] PM-approved **SOP** text → `src/data/trainingSop.ts` (or merged)
- [ ] Topic modules → `src/data/training.ts`
- [ ] **≥5** MCQs + rationales → `src/data/trainingQuestions.ts`
- [ ] `src/pages/TrainingPage.tsx`: SOP block, modules, “Check your understanding”, client-side scoring
- [ ] Gate route + nav; `TRAINING_MODULE` comment blocks optional
- [ ] Optional `localStorage` for last quiz score (label as non-certificate)
- [ ] Refresh [`readme_page/TrainingPage.md`](readme_page/TrainingPage.md) post-build; update [`docs/POC-FRAMEWORK.md`](docs/POC-FRAMEWORK.md) if training is in stakeholder story

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

- [ ] [`readme_page/README.md`](readme_page/README.md) — keep routes / maintenance table aligned when `/rota/availability` and `/training` ship
- [ ] [`plan/*`](plan/) — tick implementation checklists inside each plan file when you prefer detail there
- [ ] PM artefact links filled in under **PM references** in each plan

---

## Optional / later

- [ ] Rota availability: server + DB for pooled submissions (multi-device)
- [ ] Training: formal completion / sign-off backend (if PM requires)
- [ ] what3words: API autosuggest (needs key)
- [ ] Incident log: pagination + server-side filters for large events
