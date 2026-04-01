# Page documentation (POC)

This folder documents each screen in the **Fire & Safety — Jalsa** web app. The app is a **proof of concept**: behaviour, copy, data, and integrations are intentionally simplified and should be reviewed before any production use.

## Keeping this guide up to date

**Treat this folder as living documentation.** When you change the app, refresh the matching file here so stakeholders still have an accurate field list, dropdown inventory, and “where to edit” pointers.

| If you change… | Update these docs (minimum) |
|----------------|----------------------------|
| Incident model: days, categories, locations, time slots, severity, **department**, **what3words**, **or planned fields** (AIMS ID, radio, admin/status) | [ReportIncidentPage.md](./ReportIncidentPage.md), [IncidentLogPage.md](./IncidentLogPage.md), [plan/IncidentMandatoryReporterFields.md](../plan/IncidentMandatoryReporterFields.md), [plan/IncidentLogSuperAdmin.md](../plan/IncidentLogSuperAdmin.md), and the tables below if you mirror them here |
| Training page, SOP, or quiz data | [TrainingPage.md](./TrainingPage.md), [plan/TrainingModule.md](../plan/TrainingModule.md) |
| Team copy or roster | [TeamPage.md](./TeamPage.md) |
| Rota structure or placeholder names | [RotaPage.md](./RotaPage.md) |
| Login flow or default credentials | [LoginPage.md](./LoginPage.md) |
| Map centre, zoom, or tile provider | [MapPage.md](./MapPage.md) |
| Routes in `App.tsx` | Route table below + any page doc paths |

**Canonical source of truth for dropdown values** (incidents) is **`src/model/incident.ts`**. **On-site incident dates** (`JALSA_DAYS`) are loaded from the **active event** in **`src/data/events.ts`** (set `EVENT_ID` / `VITE_EVENT_ID`; default `jalsa-2026-islamabad`). Team/rota lists live in **`src/data/team.ts`** and **`src/data/rota.ts`**. If this README duplicates enums, prefer re-reading those files when in doubt.

---

## Routes quick reference

| Path | Page | Doc |
|------|------|-----|
| `/login` | Sign-in | [LoginPage.md](./LoginPage.md) |
| `/` (index) | Team overview | [TeamPage.md](./TeamPage.md) |
| `/rota` | Duty rota | [RotaPage.md](./RotaPage.md) |
| `/training` | Training hub — gated by `VITE_ENABLE_TRAINING` | [TrainingPage.md](./TrainingPage.md) |
| `/training/fire-extinguishers` | Fire extinguishers + triangle + 5-question quiz | [TrainingPage.md](./TrainingPage.md) |
| `/venue-checklist` | Kitchen / car park / langar checklist, submit + history — gated by `VITE_ENABLE_VENUE_CHECKLIST` | [VenueChecklistPage.md](./VenueChecklistPage.md) |
| `/incidents` | Report incident | [ReportIncidentPage.md](./ReportIncidentPage.md) |
| `/incidents/log` | Incident log | [IncidentLogPage.md](./IncidentLogPage.md) |
| `/map` | Site map | [MapPage.md](./MapPage.md) |

Unknown paths redirect to `/` (see `src/App.tsx`). **Feature flags:** defaults are **on** unless the matching `VITE_*` env is set to `false` — see `src/config/features.ts`.

---

## Shared incident enums (snapshot)

These drive **Report incident** `<select>`s and **Incident log** filters. **Update this table when you edit `src/model/incident.ts`.**

### Incident date (`JALSA_DAYS`)

Values come from **`getActiveEvent().dates`** in [`src/data/events.ts`](../src/data/events.ts). Default event **`jalsa-2026-islamabad`**:

| Stored value (ISO) | Label in UI |
|--------------------|-------------|
| `2026-07-24` | (locale weekday + date) |
| `2026-07-25` | … |
| `2026-07-26` | … |

Labels use `jalsaDaySelectLabel()` (`en-GB`). **Test events** in the same file use other ISO ranges (e.g. `test-fire-drill-mar-2026`, `test-winter-ops-2026`) — switch with `EVENT_ID` / `VITE_EVENT_ID` (see [DEVELOPER.md](../DEVELOPER.md)).

### Time on site (`INCIDENT_TIME_SLOTS`)

Half-hour steps from **06:00** through **23:30** (e.g. `06:00`, `06:30`, … `23:00`, `23:30`). Generated in code, not a flat manual list.

### Category (`INCIDENT_TYPE_CODES` → `value` / label)

| `value` (API / DB) | Dropdown label (human text) |
|--------------------|-----------------------------|
| `Fire` | Fire — alarm, panel, smoke, or suspected fire |
| `Medical` | Medical / first aid |
| `Crowd` | Crowd — density, flow, evacuation, or assembly |
| `Weather` | Severe weather impact |
| `Equipment` | Equipment fault (safety-related) |
| `Other` | Other — hazard, near-miss, or uncategorised |

Legacy string mappings for old rows: see `LEGACY_INCIDENT_TYPE_TO_CODE` in `incident.ts`.

### Severity (`SEVERITY_LEVELS`)

`Low`, `Medium`, `High` (exact casing).

### Location on site (`SITE_LOCATIONS`)

1. Main Jalsa marquee / Langar area  
2. Parking — main field  
3. Parking — overflow  
4. Entrance / Gate A  
5. Entrance / Gate B  
6. Jalsa Gah (prayer area)  
7. Children's & Lajna marquee area  
8. Bazar / exhibitions  
9. Campsite / accommodation field  
10. Medical / first-aid tent  
11. Fire & safety control / duty office  
12. Outdoor tracks & connecting paths  
13. Other — describe in “What happened”  

---

## POC — what to expect

- **Auth** validates against the backend (`api.login`); UI defaults are demo convenience, not security.
- **Team and rota** are static TypeScript data; no CMS.
- **Incidents** use Zod + API; server must accept the same codes and location strings as the client.
- **Map** is one marker and OSM tiles; not a GIS product.

### Per-page docs

- [LoginPage.md](./LoginPage.md)
- [TeamPage.md](./TeamPage.md)
- [RotaPage.md](./RotaPage.md)
- [TrainingPage.md](./TrainingPage.md)
- [VenueChecklistPage.md](./VenueChecklistPage.md)
- [ReportIncidentPage.md](./ReportIncidentPage.md)
- [IncidentLogPage.md](./IncidentLogPage.md)
- [MapPage.md](./MapPage.md)
