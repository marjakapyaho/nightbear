-- Up Migration

CREATE TYPE blood_glucose_entry_type AS ENUM ('MANUAL', 'DEXCOM_G6_SHARE');
ALTER TABLE blood_glucose_entries DROP COLUMN type;
ALTER TABLE blood_glucose_entries ADD COLUMN type blood_glucose_entry_type NOT NULL;
