---
marp: true
theme: default
paginate: true
size: 16:9
math: false
style: |
  section {
    font-size: 24px;
    padding: 40px 48px 52px 48px;
    justify-content: flex-start;
    align-items: stretch;
    overflow: visible;
    box-sizing: border-box;
  }
  h1 { font-size: 44px; line-height: 1.15; margin: 0 0 0.25em 0; }
  h2 { font-size: 32px; line-height: 1.2; margin: 0 0 0.45em 0; }
  h2 + * { margin-top: 0; }
  p { font-size: 24px; line-height: 1.38; margin: 0.35em 0; }
  ul, ol { margin: 0.35em 0 0 0; padding-left: 1.15em; }
  li {
    font-size: 23px;
    line-height: 1.42;
    margin: 0.22em 0;
  }
  strong { font-weight: 700; }
  .split {
    display: grid;
    grid-template-columns: minmax(300px, 42%) minmax(0, 1fr);
    gap: 28px 36px;
    width: 100%;
    align-items: start;
    flex: 1 1 auto;
    min-height: 0;
    margin-top: 0.15em;
  }
  .split .shot {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-width: 0;
  }
  .split .shot img {
    max-height: 460px;
    max-width: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    margin: 0;
  }
  .text-only li { font-size: 24px; line-height: 1.44; margin: 0.28em 0; }
  .text-only.tight li { font-size: 22px; line-height: 1.4; }
---

# Jalsa 2026 · Fire & Safety

**Web app walkthrough** · Proof of concept

24–26 July · Islamabad, UK

---

## What this app is

<div class="text-only">

- **On-site coordination** for fire and safety during the event
- **Mobile-friendly** layout: header nav on desktop, bottom tabs on phones
- **Password login** (POC), then: team info, rota, **report / log** incidents, venue **map**, **help** and **role** reference

</div>

---

## Login (`/login`)

<div class="split">
<div class="text">

- Shared **POC password**; login sets a **session cookie**
- After sign-in, user lands on **Team** (or the page they tried to open)

</div>
<div class="shot">

![](screenshots/01-login.png)

</div>
</div>

---

## Team (`/`)

<div class="split">
<div class="text">

- **Roster cards**: role, name, contact, notes
- Main **who to call** view right after login

</div>
<div class="shot">

![](screenshots/02-team.png)

</div>
</div>

---

## Rota (`/rota`)

<div class="split">
<div class="text">

- **Duty rota** by day and time slot
- Placeholder data until the **final schedule** is loaded

</div>
<div class="shot">

![](screenshots/03-rota.png)

</div>
</div>

---

## Report incident (`/incidents`)

<div class="split">
<div class="text">

- **Form:** type, severity, location, date/time slots, description, actions, reporter
- **Draft save** and optional **photo uploads** before submit

</div>
<div class="shot">

![](screenshots/04-report.png)

</div>
</div>

---

## Incident log (`/incidents/log`)

<div class="split">
<div class="text">

- **Search** and browse submitted incidents
- **Filters** and **photos** per record; ties back to reporting

</div>
<div class="shot">

![](screenshots/05-log.png)

</div>
</div>

---

## Map (`/map`)

<div class="split">
<div class="text">

- **Leaflet** map centered on the **venue** (Islamabad, UK)
- **Geographic context** for responders and briefings

</div>
<div class="shot">

![](screenshots/06-map.png)

</div>
</div>

---

## Help (`/help`)

<div class="split">
<div class="text">

- **Guidance** sections (evacuation, reporting, escalation, …)
- How to use the app for **non-urgent** incident reporting

</div>
<div class="shot">

![](screenshots/07-help.png)

</div>
</div>

---

## Roles (`/roles`)

<div class="split">
<div class="text">

- **Duty role** descriptions and **tips**
- Complements the **Team** contact cards

</div>
<div class="shot">

![](screenshots/08-roles.png)

</div>
</div>

---

## Mobile shell

<div class="split">
<div class="text">

- **Bottom navigation** on small screens
- Same **routes** as desktop; layout fits the viewport

</div>
<div class="shot">

![](screenshots/09-shell-mobile.png)

</div>
</div>

---

## Tech stack (1/2)

<div class="text-only tight">

- **Frontend:** React 19, **TypeScript**, **Vite**, **Tailwind CSS v4**, **React Router** v7
- **Map:** Leaflet + react-leaflet (OpenStreetMap)
- **Validation:** **Zod** (shared with API)

</div>

---

## Tech stack (2/2)

<div class="text-only tight">

- **Tests:** Vitest, React Testing Library
- **API:** **Vercel Serverless** (`api/**/*.ts`); **local:** Express in `scripts/local-api.ts` (Vite proxy)
- **Auth:** HTTP-only cookie + **JWT** via **jose** (HS256, `SESSION_SECRET`)

</div>

---

## Storage: database & files

<div class="text-only tight">

- **Database:** **Neon** serverless **Postgres** for incidents, drafts, structured fields
- Env: `DATABASE_URL` / `POSTGRES_*` (often **Vercel ↔ Neon**). Data **survives redeploys** if URLs stay on the same DB
- **Files:** **Vercel Blob** for **incident images** (`@vercel/blob`, `BLOB_READ_WRITE_TOKEN`)
- **Optional:** **Cron** uploads **CSV snapshots** of incidents to Blob when configured

</div>

---

## Hosting & environments

<div class="text-only tight">

- **Production:** **Vercel**: `npm run build` → **`dist`**; SPA **rewrites**; **`api/`** as serverless functions (`vercel.json`)
- **Prod services:** Vercel + **Neon** + **Blob** via project env vars
- **Local dev:** Vite + **local API** + **`.env.local`**

</div>

---

Thank you. Questions welcome.
