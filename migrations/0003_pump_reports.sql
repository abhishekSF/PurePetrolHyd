CREATE TABLE IF NOT EXISTS pump_reports (
  id SERIAL PRIMARY KEY,
  station_name TEXT NOT NULL,
  area TEXT NOT NULL,
  fuel TEXT NOT NULL,
  phone TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pump_reports_created_idx
  ON pump_reports (created_at DESC);
