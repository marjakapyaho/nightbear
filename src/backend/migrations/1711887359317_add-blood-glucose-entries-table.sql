-- Up Migration

CREATE TABLE blood_glucose_entries (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  blood_glucose NUMERIC(3, 1) NOT NULL
);
