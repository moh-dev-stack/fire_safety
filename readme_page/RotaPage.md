# Rota page

**Route:** `/rota` (protected)  
**Source:** `src/pages/RotaPage.tsx`  
**Data:** `src/data/rota.ts` — `RotaDay` / `RotaEntry` types and `rotaDays` array

## Purpose

Show **who is on duty** by calendar day, with time bands and optional notes.

## UI structure

| Section | Behaviour |
|---------|-----------|
| **Header** | Title “Duty rota”; subtitle warns data is **placeholder** and should be replaced with final rota. |
| **Per-day sections** | One `<section>` per `rotaDays` item; header shows `day.label` + formatted `day.dateIso` (see date formatting below). |
| **Per-slot rows** | For each `day.entries` item: left column **time** (`e.time`), right column **people** (`e.people`) and optional **notes** (`e.notes`). |

## Date formatting

- `formatDate(iso)` parses `dateIso` as local noon: `new Date(iso + "T12:00:00")` then `toLocaleDateString("en-GB", { weekday, day, month, long, year })`.
- Example: `2026-07-24` → long weekday + British-style date.

## Current data shape (POC)

Each **`RotaDay`** has:

- `label`: e.g. Friday / Saturday / Sunday  
- `dateIso`: `YYYY-MM-DD` matching Jalsa dates  
- `entries[]`: `{ time, people, notes? }`

**Snapshot** (edit `rota.ts` then refresh this list in the doc):

| Day | `dateIso` | Sample time bands |
|-----|-----------|-------------------|
| Friday | 2026-07-24 | 07:00–12:00, 12:00–18:00, 18:00–22:00 |
| Saturday | 2026-07-25 | 07:00–12:00, 12:00–18:00, 18:00–22:00 |
| Sunday | 2026-07-26 | 07:00–12:00, 12:00–18:00, 18:00–21:00 |

People strings use placeholder names Person A/B/C rotated across shifts.

## Interactions

- No dropdowns or filters; vertical scroll only.

## POC limitations & likely adjustments

- Replace placeholders; align dates with `JALSA_DAYS` in `src/model/incident.ts` if the event moves.
- Add PDF export, ICS, or sync from ops tooling if needed.
- **After any rota data change**, update [README.md](./README.md) snapshot table here if you maintain it.
