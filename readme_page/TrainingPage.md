# Training page

**Route:** `/training` (protected, inside `AppLayout`) — **planned**; wire in `src/App.tsx` when implemented.  
**Feature toggle:** `src/config/features.ts` → `ENABLE_TRAINING_MODULE` (`false` hides route and nav entry).  
**Planned source:** `src/pages/TrainingPage.tsx`  
**Planned content modules:**

| File | Role |
|------|------|
| `src/data/training.ts` | Topic modules: title, summary, body text / bullets, optional external links. |
| `src/data/trainingSop.ts` (or merged into `training.ts`) | **Training SOP:** title, version, effective date, owner role, scope text, ordered steps, escalation text. |
| `src/data/trainingQuestions.ts` | Multiple-choice **knowledge check** items: prompt, choices, correct index, optional rationale. |

**Deep spec:** [`plan/TrainingModule.md`](../plan/TrainingModule.md)

**Complements (shipped):** [HelpPage](../src/pages/HelpPage.tsx) (emergency / FAQ tone), [RolesPage](../src/pages/RolesPage.tsx) (duty role blurbs). PM decides how copy splits across Help vs Roles vs Training.

## Implementation status

Until the page ships, this document describes the **target** layout. Refresh after build so routes, file paths, and control labels match code.

## Purpose

Mobile-first **volunteer training**: read the **SOP**, work through **topic modules**, then complete **basic questions** to check understanding. Not a full LMS; quiz persistence on device is **informational only** unless PM defines a real sign-off process.

## Page regions (top to bottom)

| Region | Behaviour |
|--------|------------|
| **Header** | Page title + short intro (e.g. work through topics before or during duty). |
| **Training SOP** | Banner: SOP title, **version**, **effective date**, **owner role**. Then scope paragraph, numbered **steps** (title + detail), then **escalation** text; link to **Help** if emergency numbers live there. Collapsible or always visible per PM. |
| **Topic modules** | Ordered sections (`h2` per module): summary, body paragraphs / key points, optional **external links** (`rel="noopener noreferrer"` on `https:` targets). |
| **Check your understanding** | One radio group per question from `trainingQuestions.ts`; **Submit answers**; show score **X of Y**; optional Pass / try again per PM threshold; show **rationales** for wrong answers (not colour-only). |
| **Progress (optional)** | Device-local only (e.g. quiz last score, optional “read” flags) — label clearly **not a certificate**. |

## Training SOP data shape (conceptual)

- `sopTitle`, `version`, `effectiveDate` (ISO string), `ownerRole`
- `scope` (string)
- `steps`: `{ stepNumber, title, detail }[]`
- `escalation` (string)

## Quiz data shape (conceptual)

- Per question: `id`, `moduleId` | `"core"`, `prompt`, `choices: string[]`, `correctIndex`, optional `rationale`

Target **≥5** questions for demo credibility; PM replaces starter themes in [`plan/TrainingModule.md`](../plan/TrainingModule.md).

## Accessibility

- Single `h1`; modules as `h2` with `region` / `article` and `aria-labelledby` where appropriate.
- No autoplay media; embed video only if PM supplies URL and privacy stance is clear.
- Quiz: use `fieldset` / `legend` per question where practical.

## PM alignment

SOP wording, quiz answers, pass threshold, and Training vs Help vs Roles split come from **PM / H&S** artefacts. Link them in [`plan/TrainingModule.md`](../plan/TrainingModule.md) **PM references**. On SOP revision, bump version and effective date in data and note the change here.

## Removal / disabling

| Action | What to do |
|--------|------------|
| Hide | `ENABLE_TRAINING_MODULE = false`. |
| Remove | Delete `TrainingPage.tsx`, training data files, route, nav, and this file as needed; update [`docs/POC-FRAMEWORK.md`](../docs/POC-FRAMEWORK.md) if stakeholder messaging mentioned training. |

## POC limitations

- Quiz scoring and “completion” are **client-side only** unless a backend sign-off is added later.
- Content is **static in repo** until a CMS or remote source is introduced.
