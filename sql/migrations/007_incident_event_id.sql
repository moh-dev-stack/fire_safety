-- Event scoping for incident reports (run after prior migrations; also merged into sql/schema.sql).
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS event_id TEXT;
UPDATE incidents SET event_id = 'jalsa-2025-islamabad'
  WHERE (event_id IS NULL OR btrim(event_id) = '')
  AND incident_date >= DATE '2025-07-25' AND incident_date <= DATE '2025-07-27';
UPDATE incidents SET event_id = 'jalsa-2026-islamabad'
  WHERE event_id IS NULL OR btrim(event_id) = '';
ALTER TABLE incidents ALTER COLUMN event_id SET DEFAULT 'jalsa-2026-islamabad';
ALTER TABLE incidents ALTER COLUMN event_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS incidents_event_id_idx ON incidents (event_id);
