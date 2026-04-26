ALTER TABLE incidents DROP COLUMN IF EXISTS event_id;
DROP INDEX IF EXISTS incidents_event_id_idx;
