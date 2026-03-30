-- Reporter identity optional (Neon SQL Editor or psql).
ALTER TABLE incidents ALTER COLUMN reporter_name DROP NOT NULL;
ALTER TABLE incidents ALTER COLUMN reporter_contact DROP NOT NULL;
