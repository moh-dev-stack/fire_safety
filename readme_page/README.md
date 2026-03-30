# Page documentation (POC)

This folder documents each screen in the **Fire & Safety — Jalsa** web app. The app is a **proof of concept**: behaviour, copy, data, and integrations are intentionally simplified and should be reviewed before any production use.

## Keeping this guide up to date

**Treat this folder as living documentation.** When you change the app, refresh the matching file here so stakeholders still have an accurate field list, dropdown inventory, and “where to edit” pointers.

| If you change… | Update these docs (minimum) |
|----------------|----------------------------|
| Incident model: days, categories, locations, time slots, severity | [ReportIncidentPage.md](./ReportIncidentPage.md), [IncidentLogPage.md](./IncidentLogPage.md), and the tables below if you mirror them here |
| Team copy or roster | [TeamPage.md](./TeamPage.md) |
| Rota structure or placeholder names | [RotaPage.md](./RotaPage.md) |
| Login flow or default credentials | [LoginPage.md](./LoginPage.md) |
| Map centre, zoom, or tile provider | [MapPage.md](./MapPage.md) |
| Routes in `App.tsx` | Route table below + any page doc paths |

**Canonical source of truth for dropdown values** (incidents) is **`src/model/incident.ts`**. Team/rota lists live in **`src/data/team.ts`** and **`src/data/rota.ts`**. If this README duplicates enums, prefer re-reading those files when in doubt.

---

## Routes quick reference

| Path | Page | Doc |
|------|------|-----|
| `/login` | Sign-in | [LoginPage.md](./LoginPage.md) |
| `/` (index) | Team overview | [TeamPage.md](./TeamPage.md) |
| `/rota` | Duty rota | [RotaPage.md](./RotaPage.md) |
| `/incidents` | Report incident | [ReportIncidentPage.md](./ReportIncidentPage.md) |
| `/incidents/log` | Incident log | [IncidentLogPage.md](./IncidentLogPage.md) |
| `/map` | Site map | [MapPage.md](./MapPage.md) |

Unknown paths redirect to `/` (see `src/App.tsx`).

---

## Shared incident enums (snapshot)

These drive **Report incident** `<select>`s and **Incident log** filters. **Update this table when you edit `src/model/incident.ts`.**

### Incident date (`JALSA_DAYS`)

| Stored value (ISO) | Label in UI |
|--------------------|-------------|
| `2026-07-24` | Fri 24 Jul 2026 |
| `2026-07-25` | Sat 25 Jul 2026 |
| `2026-07-26` | Sun 26 Jul 2026 |

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
- [ReportIncidentPage.md](./ReportIncidentPage.md)
- [IncidentLogPage.md](./IncidentLogPage.md)
- [MapPage.md](./MapPage.md)
