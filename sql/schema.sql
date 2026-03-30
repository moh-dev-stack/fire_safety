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
