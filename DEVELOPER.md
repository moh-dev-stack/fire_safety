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
   Login uses a **fixed** password **`1234`** in [`api/login.ts`](api/login.ts) (POC only; not env-configurable).
4. **Optional: Blob CSV snapshots** — For production on Vercel, add `CRON_SECRET` and `BLOB_READ_WRITE_TOKEN` (see [Blob](https://vercel.com/docs/vercel-blob)); without them, `/api/cron/snapshot-incidents` returns 503. There is **no** Vercel Cron in this repo—call the route manually, wire an external scheduler, or add a `crons` entry in `vercel.json` if you use **Pro**.
5. **Run locally** — `npm run dev:all`, open **http://localhost:5173/**, sign in, create an incident, **Download incidents as CSV**. (Or `npx vercel dev` after `vercel login`.)
6. **Deploy to Vercel** — Connect the repo, set the **same** variables in **Production** env. **Keep `DATABASE_URL` unchanged** across deploys so incident data is not “lost” (it lives in Neon, not in the deploy bundle).

## Quick start

```bash
git clone <repo>
cd fire_saftey_poc
npm install
cp .env.example .env.local
# Edit .env.local: DATABASE_URL, SESSION_SECRET, optionally CRON_SECRET + BLOB_READ_WRITE_TOKEN
```

Apply the database schema **once** against your Neon database (SQL console or `psql`):

```bash
# Example: paste sql/schema.sql into Neon SQL Editor and run.
cat sql/schema.sql
```

**Recommended — full stack without Vercel CLI login** (API on **:3000**, Vite on **:5173** with `/api` proxied):

```bash
npm run dev:all
```

Open **http://localhost:5173/** and sign in with password **1234**. Ensure `.env.local` includes a strong **`SESSION_SECRET`** (16+ characters).

**Alternative — Vercel dev** (after `vercel login`):

```bash
npx vercel dev
```

Use the URL Vercel prints (often one port for both UI and API).

**Frontend only** (`/api` will error until the API is running):

```bash
npm run dev
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
| `DATABASE_URL` | Yes | Neon Postgres connection string (production must stay **stable** across deploys so data is not “lost”) |
| `SESSION_SECRET` | Yes | Min 16 chars; signs the HTTP-only session cookie (`jose` HS256) |
| `CRON_SECRET` | For secured cron | Vercel sends `Authorization: Bearer <CRON_SECRET>` when this is set in the project |
| `BLOB_READ_WRITE_TOKEN` | For snapshots | Vercel Blob read/write token; without it, cron snapshot returns 503 |

In the Vercel dashboard, set these for **Production** (and optionally **Preview** with a **separate** `DATABASE_URL` so previews do not touch production data).

## Authentication

- `POST /api/login` with JSON `{ "password": "1234" }` sets an **HttpOnly** cookie `jalsa_session` (password is **fixed in code** for this POC).
- `POST /api/logout` clears it.
- `GET /api/me` returns 200 if the cookie is valid.
- Incident routes require a valid session.

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/login` | No | Body: `{ password }` — only **`1234`** is accepted |
| POST | `/api/logout` | No | Clears session |
| GET | `/api/me` | Session | Session check |
| GET | `/api/incidents` | Session | List incidents, newest first |
| POST | `/api/incidents` | Session | Create incident (body validated with Zod, see `src/model/incident.ts`) |
| GET | `/api/incidents/export` | Session | CSV download (`Content-Disposition: attachment`) |
| GET | `/api/cron/snapshot-incidents` | `Authorization: Bearer ${CRON_SECRET}` | Full CSV dump to Vercel Blob (filename includes UTC timestamp) |

## Incident data model

Single source of truth: **[`src/model/incident.ts`](src/model/incident.ts)**.

- **Zod** `incidentCreateSchema` for `POST` bodies.
- **`INCIDENT_CSV_COLUMNS`** + **`rowsToCsv`** for CSV (used by export **and** cron snapshot).
- **Enums:** `incident_type` (`Fire`, `Medical`, …), optional `severity` (`Low` | `Medium` | `High`).
- **Optional** `incident_date` must be one of `2026-07-24`, `2026-07-25`, `2026-07-26` when provided.

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
