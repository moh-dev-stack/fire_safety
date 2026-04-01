# Venue readiness checklist

**Route:** `/venue-checklist` (protected, inside `AppLayout`)  
**Feature toggle:** `src/config/features.ts` → `ENABLE_VENUE_CHECKLIST`; set `VITE_ENABLE_VENUE_CHECKLIST=false` to hide route and nav.  
**Sources:** `src/pages/VenueChecklistPage.tsx`, `src/data/venueChecklistItems.ts`

## Purpose

**Three areas** — **Kitchen**, **Car park**, and **Langar** — each with **different** checklist lines. There is **no site / event dropdown**; one form covers the venue.

Per line: **checkbox** (done) and **comment** (required when checked). The **draft** autosaves to `localStorage` while you work.

**Submit checklist** stores a **snapshot** (timestamp, optional verifier name, all rows) in a **submissions list** on the device. **Submissions** below shows each completed submit, newest first (only tasks marked done, grouped by area).

## Storage (`localStorage`)

| Key | Shape |
|-----|--------|
| `fire-safety-venue-checklist-draft-v2` | `Record<itemId, { done, comment }>` — work in progress |
| `fire-safety-venue-checklist-submissions-v2` | `Array<{ id, submittedAt, verifier, rows }>` |

**Export JSON** downloads `{ exportedAt, submissions, currentDraft }` for backup.

## Items template

Edit **`src/data/venueChecklistItems.ts`** — `area`: `kitchen` \| `car_park` \| `langar`, `areaTitle`, `label`. Order of sections comes from **`VENUE_AREA_ORDER`**.
