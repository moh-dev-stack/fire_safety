# Rota availability page (rota maker)

**Route:** `/rota/availability` (protected, inside `AppLayout`) — **planned**; wire in `src/App.tsx` when implemented.  
**Feature toggle:** `src/config/features.ts` → `ENABLE_ROTA_AVAILABILITY_PAGE` (`false` hides route and nav entry).  
**Planned source:** `src/pages/RotaAvailabilityPage.tsx`  
**Planned data:** `src/data/rotaAvailability.ts` — shift slot ids and labels; reuse **`JALSA_DAYS`** / `jalsaDaySelectLabel` from `src/model/incident.ts`  
**Deep spec:** [`plan/RotaAvailabilityPage.md`](../plan/RotaAvailabilityPage.md)

**Related (shipped today):** read-only duty grid — [RotaPage.md](./RotaPage.md) (`/rota`, `src/data/rota.ts`).

## Implementation status

Until the page ships, this document describes the **target** behaviour from the plan. After implementation, align this file with the real components and props.

## Purpose

Collect **per-person availability** for the Jalsa weekend POC (24–26 July 2026). One submission = one person: **name**, optional **what3words** geotag, and which **shift blocks** they can work per day. Data is **device-local** for the POC (`localStorage`); the page shows an **aggregate** (who is available per date/slot) and **JSON export** for organisers.

## Form controls

| Control | Required | Behaviour |
|---------|----------|------------|
| **Name** | Yes | Text; trimmed; at least one character. |
| **what3words** | No | Optional; normalise (`///` stripped, canonical lowercase `word.word.word`); light client format check if non-empty; [what3words.com](https://what3words.com/) helper link (`rel="noopener noreferrer"`). Invalid non-empty value blocks submit. |
| **Per-day slots** | At least one globally | For each `JALSA_DAYS` date: checkboxes for **Morning** `08:00–14:00`, **Afternoon** `14:00–20:00`, **Night** `20:00–08:00` (copy must state night runs into the **next calendar day**). |
| **Submit** | — | Disabled or blocked with message if no slot selected or if what3words invalid when filled. |
| **Export JSON** | — | Downloads all submissions stored under the namespaced `localStorage` key (see below). |

## Persistence (`localStorage`)

| Key (example) | Shape (conceptual) |
|---------------|-------------------|
| `fire-safety-rota-availability` (or as implemented) | Append-only list of `{ id, submittedAt, name, what3words \| null, slots: Record<dateIso, slotId[]> }` |

Exact key and JSON shape: keep in sync with `RotaAvailabilityPage.tsx` once built.

## Summary region

After submit (and on load): for each **date** and **slot**, list **names** of people who selected that slot; show **what3words** beside a name when present.

## Errors and feedback

| State | UI |
|--------|-----|
| Validation | Inline or alert: missing name, no slots, bad what3words format. |
| Success | Confirmation after append; optional **clear form** for another person on the same device. |

## Removal / disabling

| Action | What to do |
|--------|------------|
| Hide feature | Set `ENABLE_ROTA_AVAILABILITY_PAGE` to `false` in `src/config/features.ts`. |
| Remove entirely | Delete page, data module, flag wiring, and this readme if desired; keep [`plan/RotaAvailabilityPage.md`](../plan/RotaAvailabilityPage.md) for history if useful. |

## PM alignment

Copy for shifts, event naming, and geotagging should match PM / stakeholder docs. Trace links in [`plan/RotaAvailabilityPage.md`](../plan/RotaAvailabilityPage.md) **PM references** when available. Update [`docs/POC-FRAMEWORK.md`](../docs/POC-FRAMEWORK.md) if the POC story changes.

## POC limitations

- **Single-browser** pool only unless a server API is added later.
- No edit/delete of past submissions in the base spec (optional follow-up).
