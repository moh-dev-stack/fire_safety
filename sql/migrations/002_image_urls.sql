-- Run once if you already have `incidents` without image_urls (Neon SQL Editor).
ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS image_urls JSONB NOT NULL DEFAULT '[]'::jsonb;
