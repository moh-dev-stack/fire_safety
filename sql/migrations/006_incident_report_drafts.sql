CREATE TABLE IF NOT EXISTS incident_report_drafts (
  session_key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
