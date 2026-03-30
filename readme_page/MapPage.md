# Map page

**Route:** `/map` (protected)  
**Source:** `src/pages/MapPage.tsx`  
**Libraries:** `react-leaflet`, `leaflet`; tiles: OpenStreetMap standard raster URL

## Purpose

Single **map view** centred on the Jalsa venue with **one marker** and popup text. Intended for orientation, not operational GIS.

## Map configuration (as coded)

| Constant | Value | Meaning |
|----------|-------|---------|
| **`VENUE`** | `[51.1817, -0.7535]` | `[lat, lng]` — comment in code: approximate Jalsa site, Islamabad UK (Surrey). |
| **`DEFAULT_ZOOM`** | `15` | Initial zoom level. |

## Tile layer

- **URL template:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Attribution:** OSM copyright link (inline HTML in `TileLayer` `attribution` prop).

## React-Leaflet internals

| Helper component | Role |
|------------------|------|
| **FixLeafletIcons** | Fixes default marker icon URLs for bundler (`import.meta.url`); runs once in `useEffect`. |
| **MapResize** | `invalidateSize()` after **200 ms** so the map measures correctly inside flex/layout. |

## MapContainer props

- `center={VENUE}`, `zoom={DEFAULT_ZOOM}`
- `className="h-full w-full"` inside a bounded box: `h-[min(50vh,420px)]`, `min-h-[280px]`, rounded border
- **`scrollWheelZoom`** enabled (desktop wheel zoom)

## Markers / popups

- **One** `<Marker position={VENUE}>`
- **Popup text:** `Islamabad, UK — Jalsa Salana venue (approx.)`

## User-facing copy (header)

- Title: **Site map**
- Subtitle: OpenStreetMap, centred on Islamabad UK (Jalsa site); mentions pan/zoom on touch.

## Interactions

- No dropdowns, search, or layer switcher — pan/zoom and marker popup only.

## POC limitations & likely adjustments

- Confirm coordinates with official mapping; add more markers or GeoJSON layers as needed.
- OSM tile usage policy / traffic — consider dedicated provider for heavy load.
- Offline pack or static image fallback for poor signal.
- **When `VENUE`, zoom, tile URL, or popup copy changes**, update this file (and screenshot references if you add any later).
