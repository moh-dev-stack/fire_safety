# Developer guide — Jalsa Fire & Safety

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm
- [Vercel](https://vercel.com) account and Git repo connection (for production)
- [Neon](https://neon.tech) (or any Postgres) database and connection string

## What to do next (first-time setup)

Follow this order once per machine / environment:

1. **Create a Neon database** — In the [Neon console](https://console.neon.tech), create a project and copy the Postgres connection string (`DATABASE_URL`).
2. **Apply the schema** — From the repo (after `.env.local` has `DATABASE_URL`):  
   `npm run db:apply`  
   Or paste [`sql/schema.sql`](sql/schema.sql) into Neon **SQL Editor**, or use `psql "$DATABASE_URL" -f sql/schema.sql`.
3. **Local env file** — `cp .env.example .env.local` and set at minimum:
   - `DATABASE_URL` — your Neon URL  
   - `SESSION_SECRET` — random string, **at least 16 characters** (e.g. `openssl rand -hex 32`)  
   Login uses **usernames** **`admin`** or **`user`** with the **same** fixed password **`1234`** in [`api/login.ts`](api/login.ts) (POC only; not env-configurable). `admin` gets the full app shell; `user` sees only Report, Help, and Training (plus server blocks listing/exporting all incidents).
   - **Optional — event / dates:** Incident date options and the app header use the active entry in [`src/data/events.ts`](src/data/events.ts). Set **`EVENT_ID`** and **`VITE_EVENT_ID`** to the same `id` (see [`.env.example`](.env.example)). Default: **`jalsa-2026-islamabad`**. Test presets: **`test-fire-drill-mar-2026`**, **`test-winter-ops-2026`**. Restart Vite + local API after changing so [`src/model/incident.ts`](src/model/incident.ts) reloads `JALSA_DAYS`.
4. **Vercel Blob** — Set `BLOB_READ_WRITE_TOKEN` (see [Blob](https://vercel.com/docs/vercel-blob)) so **incident photo uploads** work (`POST /api/incidents/blob-upload` + client upload). Without it, uploads return **503**. For **optional** scheduled CSV snapshots, also add `CRON_SECRET`; without the token, `/api/cron/snapshot-incidents` returns 503. There is **no** Vercel Cron in this repo—call the route manually, wire an external scheduler, or add a `crons` entry in `vercel.json` if you use **Pro**. Unit tests mock Blob and do **not** need this token; only manual upload smoke tests do.
5. **Run locally** — `npm run dev` (or `npm run dev:all`, same thing), open **http://localhost:5173/**, sign in, create an incident, **Download incidents as CSV**. (Or `npx vercel dev` after `vercel login`.)
6. **Deploy to Vercel** — Connect the repo, set the **same** variables in **Production** env. **Keep `DATABASE_URL` unchanged** across deploys so incident data is not “lost” (it lives in Neon, not in the deploy bundle).

## Quick start

```bash
git clone <repo>
cd fire_saftey_poc
npm install
cp .env.example .env.local
# Edit .env.local: DATABASE_URL, SESSION_SECRET, BLOB_READ_WRITE_TOKEN (photos), optionally CRON_SECRET
```

Apply the database schema **once** against your Neon database (SQL console or `psql`):

```bash
# Example: paste sql/schema.sql into Neon SQL Editor and run.
cat sql/schema.sql
```

**Recommended — full stack without Vercel CLI login** (API on **:3000**, Vite on **:5173** with `/api` proxied):

```bash
npm run dev
```

Open **http://localhost:5173/** and sign in with password **1234**. Ensure `.env.local` includes a strong **`SESSION_SECRET`** (16+ characters).

**Alternative — Vercel dev** (after `vercel login`):

```bash
npx vercel dev
```

Use the URL Vercel prints (often one port for both UI and API).

**Frontend only** — Vite without the local API (`/api` calls fail unless something listens on **:3000**, e.g. `vercel dev`):

```bash
npm run dev:vite
```

## Project structure

| Path | Purpose |
|------|---------|
| `src/` | React app (pages, components, auth, `model/incident.ts`) |
| `src/data/team.ts`, `src/data/rota.ts` | Editable **team** and **rota** content (placeholders in v1) |
| `api/` | Vercel Serverless handlers (`login`, `logout`, `me`, `incidents`, `incidents/export`, `cron/snapshot-incidents`) |
| `api/lib/` | DB (Neon), session cookie, auth helper, row mapping |
| `sql/schema.sql` | Postgres DDL for `incidents` |
| `vercel.json` | SPA rewrite, build output |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes† | Neon pooled connection string (stable across deploys). †If unset, the API falls back to `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, then `POSTGRES_URL_NON_POOLING` (common with Neon’s Vercel integration). |
| `SESSION_SECRET` | Yes | Min 16 chars; signs the HTTP-only session cookie (`jose` HS256) |
| `CRON_SECRET` | For secured cron | Vercel sends `Authorization: Bearer <CRON_SECRET>` when this is set in the project |
| `BLOB_READ_WRITE_TOKEN` | For photos & snapshots | Vercel Blob read/write token; without it, incident photo uploads return **503** and cron snapshot returns **503** |
| `W3W_API_KEY` | Optional | [what3words](https://developer.what3words.com/) API key for `/api/what3words/autosuggest` and `/api/what3words/convert` (signed-in users only). Without it, those routes return **503** / empty suggestions; incident reports still work. |

**Client (Vite):** Optional `VITE_ENABLE_TRAINING`, `VITE_ENABLE_VENUE_CHECKLIST` — set to `false` to hide those routes and nav entries (`src/config/features.ts`). Defaults: enabled.

In the Vercel dashboard, set these for **Production** (and optionally **Preview** with a **separate** `DATABASE_URL` so previews do not touch production data).

## Authentication

- `POST /api/login` with JSON `{ "username": "admin" | "user", "password": "1234" }` sets an **HttpOnly** cookie `jalsa_session` (JWT includes a `role` claim matching the username; password is **fixed in code** for this POC).
- `POST /api/logout` clears it.
- `GET /api/me` returns `200 { "ok": true, "role": "admin" | "user" }` if the cookie is valid (otherwise **401**).
- Incident **create** routes accept either role; **listing** incidents and **CSV export** require **`admin`** (**403** for `user`).

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/login` | No | Body: `{ username: "admin" \| "user", password }` — only **`1234`** is accepted as password |
| POST | `/api/logout` | No | Clears session |
| GET | `/api/me` | Session | `200` → `{ ok: true, role }` |
| GET | `/api/incidents` | Session (`admin`) | List incidents, newest first — **`403`** if `role` is `user` |
| POST | `/api/incidents` | Session | Create incident (body validated with Zod; optional `image_urls` HTTPS Blob URLs, see `src/model/incident.ts`) |
| POST | `/api/incidents/blob-upload` | Session | Client-upload handshake for Vercel Blob (`handleUpload`); requires `BLOB_READ_WRITE_TOKEN` |
| GET | `/api/incidents/export` | Session (`admin`) | CSV download — **`403`** if `role` is `user` |
| GET | `/api/what3words/autosuggest` | Session | Query: `input` — proxies to what3words autosuggest (requires `W3W_API_KEY`) |
| GET | `/api/what3words/convert` | Session | Query: `words` — verifies a three-word address via what3words convert (requires `W3W_API_KEY`) |
| GET | `/api/cron/snapshot-incidents` | `Authorization: Bearer ${CRON_SECRET}` | Full CSV dump to Vercel Blob (filename includes UTC timestamp) |

## Incident data model

Single source of truth: **[`src/model/incident.ts`](src/model/incident.ts)**.

- **Zod** `incidentCreateSchema` for `POST` bodies.
- **`INCIDENT_CSV_COLUMNS`** + **`rowsToCsv`** for CSV (used by export **and** cron snapshot).
- **Enums:** `incident_type` (`Fire`, `Medical`, …), optional `severity` (`Low` | `Medium` | `High`).
- **Required** `department` (free text); **optional** `incident_w3w` (what3words); **`incident_date`** must be one of the active event’s `JALSA_DAYS` (default event: 24–26 July 2026).
- **`image_urls`** — optional array of HTTPS URLs on the `*.public.blob.vercel-storage.com` host (max **8**), populated after client upload.

To add a field: update Zod schema, `sql/schema.sql` (migration), `mapRow` in `api/lib/incident-map.ts`, form/UI, and `INCIDENT_CSV_COLUMNS`.

## Content maintenance

- **Team:** edit [`src/data/team.ts`](src/data/team.ts).
- **Rota:** edit [`src/data/rota.ts`](src/data/rota.ts).

## Deploy to Vercel

1. Connect the Git repository.
2. Framework preset: **Vite** (or use existing `vercel.json` `buildCommand` / `outputDirectory`).
3. Set all environment variables for **Production**.
4. After first deploy, run `sql/schema.sql` against the **production** database if the table is missing.
5. **Snapshots (optional):** If you use Blob backups, set `CRON_SECRET` and `BLOB_READ_WRITE_TOKEN`. Nothing runs on a schedule unless you trigger `GET /api/cron/snapshot-incidents` yourself or add Vercel Cron / another job (see step 4).
6. Smoke-test **login**, **submit incident**, **download CSV**, and **map** on a phone.

Cookies use **`Secure`** in production (`VERCEL=1` or `NODE_ENV=production`).

## Troubleshooting

- **401 on API after login** — Check `SESSION_SECRET` length; ensure requests use `credentials: 'include'` (already set in `src/lib/api.ts`).
- **500 on incidents** — `DATABASE_URL` wrong or `incidents` table missing; run `sql/schema.sql`.
- **Empty incidents on Preview** — Preview may use a different database; production data is unchanged.
- **Cron 401** — `CRON_SECRET` mismatch; Vercel must send the same Bearer token your handler expects.
- **Cron 503** — `BLOB_READ_WRITE_TOKEN` not set (snapshots disabled).
- **Photo upload 503** — `BLOB_READ_WRITE_TOKEN` missing; set it in `.env.local` for local API (`npm run dev`).
- **Photo upload 401** — Session expired; sign in again.
