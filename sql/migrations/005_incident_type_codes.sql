-- Normalise legacy long incident_type labels to canonical API codes (optional, run once in Neon).
UPDATE incidents SET incident_type = 'Fire' WHERE incident_type IN ('Fire alarm / panel', 'Smoke or suspected fire');
UPDATE incidents SET incident_type = 'Medical' WHERE incident_type = 'Medical / first aid';
UPDATE incidents SET incident_type = 'Crowd' WHERE incident_type IN ('Crowd density or flow', 'Evacuation / assembly point');
UPDATE incidents SET incident_type = 'Weather' WHERE incident_type = 'Severe weather impact';
UPDATE incidents SET incident_type = 'Equipment' WHERE incident_type = 'Equipment fault (safety-related)';
UPDATE incidents SET incident_type = 'Other' WHERE incident_type IN ('Hazard or near-miss', 'Other (fire & safety)', 'Other');
