-- Optional: align legacy “Other” labels with the fire & safety form (run in Neon SQL Editor if needed).
UPDATE incidents
SET incident_type = 'Other (fire & safety)'
WHERE incident_type = 'Other';
