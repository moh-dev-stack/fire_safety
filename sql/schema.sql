-- Run this once against your Neon / Postgres database (see DEVELOPER.md).
CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  incident_date DATE NOT NULL,
  incident_time TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  actions_taken TEXT NOT NULL,
  reporter_name TEXT,
  reporter_contact TEXT,
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS incidents_created_at_idx ON incidents (created_at DESC);

-- DBs created before photo support: add column without recreating the table.
ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS image_urls JSONB NOT NULL DEFAULT '[]'::jsonb;

-- In-progress incident form (per signed-in session). Submitted rows still live in `incidents`.
CREATE TABLE IF NOT EXISTS incident_report_drafts (
  session_key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT '';

-- Which Jalsa (or other catalog event) the report belongs to (admin log filters on this).
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS event_id TEXT;
UPDATE incidents SET event_id = 'jalsa-2025-islamabad'
  WHERE (event_id IS NULL OR btrim(event_id) = '')
  AND incident_date >= DATE '2025-07-25' AND incident_date <= DATE '2025-07-27';
UPDATE incidents SET event_id = 'jalsa-2026-islamabad'
  WHERE event_id IS NULL OR btrim(event_id) = '';
ALTER TABLE incidents ALTER COLUMN event_id SET DEFAULT 'jalsa-2026-islamabad';
ALTER TABLE incidents ALTER COLUMN event_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS incidents_event_id_idx ON incidents (event_id);

-- Legacy optional geotag field (removed from the app).
ALTER TABLE incidents DROP COLUMN IF EXISTS incident_w3w;
