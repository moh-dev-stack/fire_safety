# Jalsa 2026 · Fire & Safety: presentation assets

This folder holds a **walkthrough slide deck** (Markdown + PDF) and **screenshots** of each app screen. Use it for demos, handovers, or stakeholder reviews.

## What’s here

| File / folder | Purpose |
|---------------|---------|
| [`deck.md`](./deck.md) | [Marp](https://marp.app/) slide source. Export this to PDF. |
| [`screenshots/`](./screenshots/) | One PNG per route (see checklist below). |
| `deck.pdf` | Generated output (after you run Marp; safe to regenerate). |

## App context

The web app is a **proof of concept** for on-site fire and safety coordination during **Jalsa 2026** (24–26 July, Islamabad, UK). It is a React + Vite single-page app with password login, incident reporting, an incident log, reference pages (team, rota, roles, help), and a venue map.

## Run the app locally (for fresh screenshots)

From the repository root:

```bash
npm install
npm run dev
```

This starts the API on port **3000** and the Vite dev server (typically **http://127.0.0.1:5173**). Open that URL in a browser.

**Login (POC):** password `1234` (see `api/login.ts`). The API needs `SESSION_SECRET` in `.env.local` (see project README if login errors).

## Screenshot checklist

Capture **full-page** or **viewport** shots that show each screen clearly. Save PNGs into `screenshots/` using these names so they match `deck.md`:

| Order | Route | Suggested filename |
|------:|-------|---------------------|
| 1 | `/login` | `01-login.png` |
| 2 | `/` (Team) | `02-team.png` |
| 3 | `/rota` | `03-rota.png` |
| 4 | `/incidents` (Report) | `04-report.png` |
| 5 | `/incidents/log` (Log) | `05-log.png` |
| 6 | `/map` | `06-map.png` |
| 7 | `/help` | `07-help.png` |
| 8 | `/roles` | `08-roles.png` |
| 9 | Any authenticated page at **narrow width** (~390px) to show bottom nav | `09-shell-mobile.png` |

Re-capture after UI changes so the deck stays accurate.

**Automated capture:** with the dev stack running (`npm run dev`), from the repo root:

```bash
npm run presentation:capture
```

This runs [`capture-screenshots.mjs`](./capture-screenshots.mjs) (Playwright). Override `BASE_URL` if Vite uses another port (e.g. `BASE_URL=http://127.0.0.1:5174 npm run presentation:capture`).

## Build the PDF slide deck

Install is not required globally; Marp runs via `npx`:

```bash
npm run presentation:pdf
```

Or from `presentation/`:

```bash
npx --yes @marp-team/marp-cli --no-stdin --allow-local-files deck.md --pdf deck.pdf
```

**Alternative:** open `deck.md` in VS Code with the [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) extension and use **Export Slide Deck → PDF**.

## Narrative (README-friendly summary)

1. **Login:** Single shared password for the POC; session cookie thereafter.  
2. **Team:** Event-specific intro and contact cards for key fire & safety roles.  
3. **Rota:** Who is on duty by day and time slot (placeholder data until final rota).  
4. **Report:** Structured incident form: type, severity, location, timing, description, optional photo uploads, draft save.  
5. **Log:** Searchable list of submitted incidents with filters and photo viewing.  
6. **Map:** Leaflet map centered on the venue for spatial context.  
7. **Help:** Operational guidance and links into reporting.  
8. **Roles:** Expanded duty role descriptions and practical tips.  

The shell uses a **sticky header**, **desktop nav**, and **mobile bottom navigation** for quick access between sections.

### Technical snapshot (see `deck.md` slides)

- **Stack:** React 19, TypeScript, Vite, Tailwind v4, React Router, Leaflet, Zod; API as **Vercel serverless** functions (Express locally); sessions via **jose** (JWT in HTTP-only cookie).
- **Database:** **Neon Postgres** for incidents and related structured data.
- **Images (and optional CSV exports to object storage):** **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`).
- **Deployment:** **Vercel** (static front end + `api/` functions), with Neon and Blob wired through project env vars.
