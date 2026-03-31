# Training module — in-app volunteer training (POC)

**Scope:** Add a **Training** area inside the signed-in app: structured **topics**, a clear **training SOP** (standard operating procedure) volunteers can follow on duty, and **basic knowledge questions** (simple checks) after topics — mobile-first, static data in repo. **POC:** no full LMS; optional “I’ve reviewed” / quiz pass stored in `localStorage` only — **not** audit-grade unless PM adds a real sign-off process later.

**Planned route:** `/training` (protected, inside `AppLayout`)  
**Planned source:** `src/pages/TrainingPage.tsx`  
**Planned content:**  
- `src/data/training.ts` — modules/lessons (title, summary, body, links, key points).  
- `src/data/trainingSop.ts` (or a top-level block inside `training.ts`) — **SOP** metadata + procedural steps (see below).  
- `src/data/trainingQuestions.ts` — **basic questions** (multiple-choice) keyed to modules or a global “core” set (see below).  
**Feature toggle:** `src/config/features.ts` → `ENABLE_TRAINING_MODULE` (set `false` to hide route + nav; or comment marked blocks in `App.tsx` / `AppLayout.tsx`)

**Related UI today:** [`src/pages/HelpPage.tsx`](../src/pages/HelpPage.tsx), [`src/pages/RolesPage.tsx`](../src/pages/RolesPage.tsx) — training should **complement** Help (FAQ / emergency) and Roles (duty descriptions), not duplicate them; PM decides split of copy.

---

## Documentation outcome

| Deliverable | Role |
|-------------|------|
| This file [`plan/TrainingModule.md`](TrainingModule.md) | **Plan + spec** — information architecture, toggle, accessibility, PM alignment. |
| [`readme_page/TrainingPage.md`](../readme_page/TrainingPage.md) | **Built-page reference** — route, source, data file, layout regions, links (same style as [`readme_page/RotaPage.md`](../readme_page/RotaPage.md) / [`readme_page/IncidentLogPage.md`](../readme_page/IncidentLogPage.md)). |
| [`docs/POC-FRAMEWORK.md`](../docs/POC-FRAMEWORK.md) | Update **Goal** / audience table when training is part of the stakeholder story (**with PM**). |
| [`presentation/`](../presentation/) | Optional deck slide if stakeholders demo onboarding. |

### PM references (fill when artefact is available)

- Official **training SOP** source (version number, owner, review date) — *this app hosts a copy aligned to PM / H&S*, not the legal master unless PM says otherwise.
- **Quiz** pass threshold (e.g. 80% or “all correct”) and whether retries are unlimited.
- Official training **syllabus**, **sign-off** requirements (if any), and wording aligned with H&S policy.
- What belongs in **Training** vs **Help** vs **Roles**.
- Until linked: use [`docs/POC-FRAMEWORK.md`](../docs/POC-FRAMEWORK.md) and existing copy tone from Help/Roles.

---

## Training SOP (standard operating procedure)

**Goal:** Give volunteers a **single, ordered procedure** for “during duty” expectations: before shift, during incident, radio use, reporting, handover — as PM defines.

| Element | Behaviour (POC) |
|---------|------------------|
| **Metadata** | `sopTitle`, `version`, `effectiveDate` (string ISO), `ownerRole` (e.g. “Fire Safety Lead”) — display in a small **banner** at top of SOP section. |
| **Scope & audience** | Short paragraph: who must follow this SOP (e.g. all fire & safety volunteers on site). |
| **Procedure** | Ordered **steps** — `{ stepNumber, title, detail }[]` — `detail` can be bullets or multi-paragraph strings from PM.doc. |
| **Escalation** | Final subsection: *when and how to escalate* (e.g. control channel, duty lead, emergency services) — text from PM; link to **Help** if that page holds emergency numbers. |
| **Placement in UI** | Either **(A)** dedicated collapsible region **“Training SOP”** at top of `/training`, or **(B)** first module that is always expanded — PM picks. |

**Authoring:** PM supplies wording; engineering maps it into `trainingSop.ts`. On each PM revision, bump `version` and `effectiveDate` in data and note change in `readme_page/TrainingPage.md` or internal changelog.

---

## Basic knowledge questions (POC)

**Goal:** After reading (or at page bottom), volunteers answer **short multiple-choice** questions tied to learning objectives — reinforces incident flow, radio discipline, and SOP highlights.

| Element | Behaviour (POC) |
|---------|------------------|
| **Data shape** | Per question: `id`, `moduleId` or `"core"`, `prompt`, `choices: string[]`, `correctIndex` (single answer), optional `rationale` (shown after submit — explains correct answer). |
| **UI** | **“Check your understanding”** region: render N questions (start with **5–10** total across all modules); radio group per question; **Submit answers** button. |
| **Scoring** | Show **X of Y correct**; if PM sets threshold, show **Pass** / **Try again**; **unlimited retries** unless PM caps attempts. |
| **Feedback** | After submit: highlight wrong items, show `rationale` for misses (accessibility: text, not colour alone). |
| **Persistence** | Optional: `localStorage` key `training-quiz-last-score` + timestamp — **device-local only**; no server certificate. |

**Starter question themes** (replace copy with PM — examples only):

1. **Reporting:** When should you submit an incident report in the app? *(e.g. choices: only for fires / for any fire-safety-related concern / only after the event — correct: fire-safety-related concern per PM policy.)*  
2. **Severity:** Who sets initial severity on the form? *(reporter selects from Low/Medium/High per app — correct: reporter uses best judgement.)*  
3. **Radio:** If you need the duty office while on net, what should you include in your radio info on the report? *(correct per [`IncidentMandatoryReporterFields.md`](IncidentMandatoryReporterFields.md) radio field intent.)*  
4. **SOP:** First action when you witness a serious injury on site? *(correct answer text from PM SOP / Help — e.g. summon first aid / preserve scene per policy.)*  
5. **Evacuation:** Where do assembly / escalation details primarily live? *(e.g. Help page / training / verbal only — correct per PM.)*

Add at least **5** questions in data for demo credibility; PM expands set.

---

## Information architecture (POC)

| Area | Behaviour |
|------|-------------|
| **Landing** | Page title + short intro (“Work through these topics before or during duty”). |
| **SOP region** | Training SOP block (metadata + steps + escalation) — see [Training SOP](#training-sop-standard-operating-procedure). |
| **Topics** | Ordered list of **modules**; each expands or links to an anchor section (accordion or stacked `<section>` with headings). |
| **Content blocks** | Per module: **title**, **summary** (1–2 lines), **body** (markdown-like: support paragraphs + bullet lists in TS strings, or small MD if you introduce a loader later). |
| **Links** | Optional per module: `{ label, href }` to PDFs, video, or what3words site policy — `rel="noopener noreferrer"` for external URLs. |
| **Quiz** | **Basic questions** section — see [Basic knowledge questions](#basic-knowledge-questions-poc). |
| **Progress** | Optional `localStorage`: module ids read, quiz last score — clearly labelled **not a certificate**. |

Suggested **starter topics** (replace with PM list):

1. **Incident reporting** — when to use the app, severity, photos, name / AIMS / department ([`IncidentMandatoryReporterFields.md`](IncidentMandatoryReporterFields.md)).
2. **Radio & comms** — how net fits with reporting; cross-link to reporter **radio** field intent.
3. **Site & assembly awareness** — tie-in to [`MapPage`](../src/pages/MapPage.tsx) / locations list in `incident.ts`.
4. **Evacuation & crowd safety (high level)** — pointer to Help for emergencies if appropriate.

---

## UX & accessibility

- **Mobile-first:** readable line length, tap targets, collapsible sections to reduce scroll fatigue.
- **Semantics:** one `h1`, modules as `h2` + `region` or `article` with `aria-labelledby`.
- **No autoplay** video; embed only if PM provides hosted URL and privacy stance is clear.

---

## Implementation notes

- **Routing:** `<Route path="training" element={<TrainingPage />} />` when `ENABLE_TRAINING_MODULE` is true ([`src/App.tsx`](../src/App.tsx)).
- **Nav:** Label e.g. **“Training”** near Help/Roles ([`AppLayout.tsx`](../src/components/AppLayout.tsx)); group lines with `TRAINING_MODULE` comments for easy comment-out.
- **Styling:** Match existing Tailwind patterns (`rounded-xl`, borders, `space-y-*`) like [`RolesPage.tsx`](../src/pages/RolesPage.tsx).
- **Quiz logic:** Pure client-side scoring from `trainingQuestions.ts`; no new API.
- **Tests:** Optional: smoke test for SOP title + one question render; unit test for score reducer if non-trivial.

---

## Removal / disabling

| Action | What to do |
|--------|------------|
| **Hide** | `ENABLE_TRAINING_MODULE = false` in `src/config/features.ts`. |
| **Remove feature** | Delete `TrainingPage.tsx`, `training.ts`, `trainingSop.ts`, `trainingQuestions.ts` (as applicable), route, nav, `readme_page/TrainingPage.md`, and flag; refresh POC framework if it mentioned training. |

---

## Implementation checklist

- [ ] PM: topic list; **approved SOP text** (version, steps, escalation); **quiz** questions + correct answers + rationales; pass threshold.
- [ ] Add `ENABLE_TRAINING_MODULE` to `src/config/features.ts` (or extend if file exists).
- [ ] Add `src/data/training.ts` (modules), `src/data/trainingSop.ts` (or merged), `src/data/trainingQuestions.ts` (≥5 MCQs).
- [ ] Add `src/pages/TrainingPage.tsx` (SOP block, modules, quiz UI + scoring).
- [ ] Wire conditional route + nav in `App.tsx` / `AppLayout.tsx`.
- [ ] Add `readme_page/TrainingPage.md`; update `docs/POC-FRAMEWORK.md` if scope changes.

---

## Related plans

- [Mandatory reporter fields & radio](IncidentMandatoryReporterFields.md) — content can reference form fields.
- [Rota availability](RotaAvailabilityPage.md) — separate; training might mention duty shifts at high level.
- [Incident log — super admin](IncidentLogSuperAdmin.md) — separate operational concern.
