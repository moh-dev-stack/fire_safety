# Jalsa Salana 2026 — Fire & Safety web app

Internal web app for **Jalsa Salana 2026** (UK Islamabad site), **24–26 July 2026**. It is **mobile-first** so duty holders can use it on phones in the field.

## What the website includes

- **Login** — username **`admin`** (full app) or **`user`** (report / help / training only), same fixed password **`1234`** in code (POC only, not high-security).
- **Team info** — roles, names, and contacts. The first version uses **placeholder names** (Person A, B, C); replace copy in [`src/data/team.ts`](src/data/team.ts).
- **Rota** — three days (**24 / 25 / 26 July 2026**) with **times** and **people** on each shift. Placeholder data lives in [`src/data/rota.ts`](src/data/rota.ts).
- **Incident reports** — standard form, list of submitted incidents, and **Download incidents as CSV** (same columns every time). Data is stored in **Postgres** (e.g. Neon): it **is not wiped when you redeploy on Vercel** as long as production `DATABASE_URL` always points at the same database.
- **Map** — OpenStreetMap view centred on **Islamabad, UK** (Jalsa site), with pan/zoom on touch devices.
- **Scheduled CSV snapshots** — Vercel Cron can upload timestamped CSV copies to **Vercel Blob** (optional; needs `BLOB_READ_WRITE_TOKEN` and `CRON_SECRET`).

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Leaflet, Zod (shared incident model), Vercel Serverless Functions, Neon serverless Postgres, optional Vercel Blob.

## Developer setup

See **[DEVELOPER.md](DEVELOPER.md)** — start with **What to do next (first-time setup)** for Neon, `sql/schema.sql`, and `.env.local`.

**Run locally:** `npm run dev` (starts **API on port 3000** and **Vite on 5173**), then open **http://localhost:5173/**. Sign in with username **`admin`** or **`user`** and password **`1234`**.

If the page loads but sign-in fails or you see a “cannot reach the server” message, you are usually running **Vite alone** (`npm run dev:vite`) without the API — use **`npm run dev`** instead, or run **`npm run dev:api`** in a second terminal. Ensure **`.env.local`** has **`SESSION_SECRET`** (16+ characters); see [DEVELOPER.md](DEVELOPER.md).

## Licence

Private / internal use for Jalsa fire and safety volunteers.
