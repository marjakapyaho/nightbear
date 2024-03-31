-- Up Migration

ALTER TABLE blood_glucose_entries
ALTER COLUMN timestamp SET DEFAULT CURRENT_TIMESTAMP;
