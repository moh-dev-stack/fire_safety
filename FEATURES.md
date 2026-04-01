# Feature catalog — Jalsa Fire & Safety POC

How the app is split today: **public** vs **authenticated**, then **`admin`** vs **`user`** (same team password `1234`; username picks the tier).

## Authentication & sessions

| Feature | Description |
|--------|-------------|
| Login (`/login`) | Username `admin` or `user`, shared POC password. |
| Session cookie | HttpOnly `jalsa_session` JWT with `role` claim (`admin` \| `user`). |
| Log out | Clears session (from shell header on all authenticated pages). |
| Session restore | `GET /api/me` returns `{ ok, role }`; invalid or legacy tokens → 401. |

## API (serverless / local Express)

| Route | Purpose |
|-------|---------|
| `POST /api/login` | Issue session; body `{ username, password }`. |
| `POST /api/logout` | Clear cookie. |
| `GET /api/me` | Return `{ ok: true, role }` if valid. |
| `GET /api/incidents` | List incidents (**admin only**; **403** for `user`). |
| `POST /api/incidents` | Create incident (authenticated **admin** or **user**). |
| `GET/PUT/DELETE /api/incidents/draft` | Autosave draft per session (both tiers). |
| `POST /api/incidents/blob-upload` | Vercel Blob handshake for report photos (both tiers; needs token on server). |
| `GET /api/incidents/export` | CSV download (**admin only**; **403** for `user`). |
| `GET /api/cron/snapshot-incidents` | CSV snapshot to Blob (**Bearer CRON_SECRET**; not session). |

## Frontend routes & pages

Feature flags (Vite): `VITE_ENABLE_TRAINING`, `VITE_ENABLE_VENUE_CHECKLIST` — set to `false` to hide modules (defaults: on).

### Available to both tiers (after login)

| Route | Page | Feature |
|-------|------|---------|
| `/incidents` | Report incident | Full report flow: validation, optional manual what3words text, photos (Blob), draft autosave, submit to DB. |
| `/help` | Help | Static help content. |

### Training module (when enabled)

| Route | Feature |
|-------|---------|
| `/training` | Training hub (fire triangle, extinguishers, quiz, etc.). |
| `/training/fire-extinguishers` | Redirects to `/training`. |

### Admin-only shell (hidden from `user` nav + route guard → `/incidents`)

| Route | Page | Feature |
|-------|------|---------|
| `/` | Team | Team / event overview content (`src/data/team.ts`). |
| `/rota` | Rota | Duty rota content (`src/data/rota.ts`). |
| `/venue-checklist` | Venue checklist | Readiness checklist (local persistence + submissions) when flag on. |
| `/incidents/log` | Incident log | Searchable log, photos/lightbox, **CSV export** (admin API). |
| `/map` | Map | Leaflet map around venue. |
| `/roles` | Roles | Duty roles copy (content page). |

### Global behaviour

| Feature | Description |
|---------|-------------|
| App shell | Header (event title), nav (desktop + mobile bottom bar for `user`: Report → Training → Help), logout. |
| Deep links | Unknown paths → `Navigate` to `/`; `user` on admin-only routes → redirect to `/incidents`. |
| Active event | Header / incident dates driven by `src/data/events.ts` and optional `VITE_EVENT_ID`. |

## Incident domain (report + log)

- **Types / severity / locations / departments** — model in `src/model/incident.ts`; DB via Neon when configured.
- **Images** — Up to 8 URLs; client upload to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set.
- **CSV** — Column layout shared for export and optional cron snapshot.

## Operational / dev

| Feature | Description |
|---------|-------------|
| Local stack | `npm run dev` — API `:3000`, Vite `:5173` with `/api` proxy (`scripts/local-api.ts`). |
| Schema | `npm run db:apply` / `sql/schema.sql` for Postgres. |
| Unit tests | `npm test` (Vitest: models, pages, API session role, layout nav, etc.). |
| API smoke | `npm run smoke` — hits local API (start `npm run dev:api` first); checks auth, roles, incident gates, draft, optional W3w. |

## Smoke & verification

| Command | What it covers |
|--------|----------------|
| `npm test` | Incident model, report/log page behaviours, events, training data, session JWT role, `postLoginPath`, AppLayout nav by role. |
| `npm run smoke` | Live HTTP checks on `:3000`: anonymous `me`, login failures, admin/user login + `me`, user forbidden on list/export, admin list/export (or DB warning), user draft GET, logout; then `me` with no cookie → 401. |

### Manual UI checklist (browser)

With `npm run dev`, open `http://localhost:5173/`:

1. **Login** — Wrong password rejected; `admin` + `1234` reaches Team home; `user` + `1234` lands on Report (`/incidents`).
2. **Admin nav** — Team, Rota, Training (if on), Venue (if on), Report, Log, Map, Help, Roles visible; Log loads data / export if DB configured.
3. **User nav** — Only Report, Training (if on), Help; visiting `/` or `/map` redirects to Report.
4. **Report** — Form loads; draft autosave if DB ok; submit flow (optional full submit with valid data).
5. **Help / Training** — Pages render without errors.
6. **Logout** — Returns to login; protected routes redirect to login when unauthenticated.

## Security notes (POC)

- Anyone with the shared password can sign in as **`admin`** by choosing that username.
- Restricting Team/Rota/Map/etc. is **UI + routing**; **incident list/export** is enforced on the **API**.
