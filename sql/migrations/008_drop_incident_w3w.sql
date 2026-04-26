-- Optional what3words column removed from the app; drop if present.
ALTER TABLE incidents DROP COLUMN IF EXISTS incident_w3w;
