-- Simple internal task list (admin only). Notes stored as an append-only JSONB log:
--   [{ "at": "2026-07-17T10:15:00Z", "author": "MR", "body": "spoke to Nasir sb..." }, ...]
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  task TEXT NOT NULL,
  deadline DATE,
  allocation TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  notes JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks (status);
CREATE INDEX IF NOT EXISTS tasks_deadline_idx ON tasks (deadline);
