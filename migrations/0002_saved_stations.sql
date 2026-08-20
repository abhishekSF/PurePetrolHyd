CREATE TABLE IF NOT EXISTS saved_stations (
  user_id TEXT NOT NULL,
  station_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, station_id)
);

CREATE INDEX IF NOT EXISTS saved_stations_user_idx
  ON saved_stations (user_id, created_at DESC);
