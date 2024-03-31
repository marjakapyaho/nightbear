-- Up Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- for the uuid_generate_v4() function

ALTER TABLE blood_glucose_entries
ALTER COLUMN id SET DEFAULT uuid_generate_v4();
