-- One-off cleanup: remove test incidents #1, #2, #3, #4, #6, #7 from the incidents table.
-- Run in a transaction so you can BEGIN / verify / COMMIT (or ROLLBACK) yourself.
--
-- Usage (psql):
--   \i sql/one-off/delete-test-incidents.sql
-- Or run each statement in the Neon SQL editor.

BEGIN;

-- Preview what will be deleted:
SELECT id, created_at, incident_date, incident_time, incident_type, severity, location, reporter_name
FROM incidents
WHERE id IN (1, 2, 3, 4, 6, 7)
ORDER BY id;

-- Actual delete:
DELETE FROM incidents
WHERE id IN (1, 2, 3, 4, 6, 7);

-- Confirm none of them remain:
SELECT id FROM incidents WHERE id IN (1, 2, 3, 4, 6, 7);

-- COMMIT;    -- uncomment when you are happy with the preview above
-- ROLLBACK;  -- run this instead to abort
