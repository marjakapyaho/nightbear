-- Up Migration

-- Rename blood glucose table
ALTER TABLE blood_glucose_entries RENAME TO sensor_entries;

CREATE TABLE analyser_settings (
    id UUID PRIMARY KEY,
    highLevelRel NUMERIC(3, 1) NOT NULL,
    highLevelAbs NUMERIC(3, 1) NOT NULL,
    highLevelBad NUMERIC(3, 1) NOT NULL,
    lowLevelRel NUMERIC(3, 1) NOT NULL,
    lowLevelAbs NUMERIC(3, 1) NOT NULL,
    lowLevelBad NUMERIC(3, 1) NOT NULL,
    timeSinceBgMinutes INTEGER NOT NULL,
    highCorrectionSuppressionMinutes INTEGER NOT NULL
);

CREATE TABLE situation_settings (
   id UUID PRIMARY KEY,
   escalationAfterMinutes INTEGER NOT NULL,
   snoozeMinutes INTEGER NOT NULL
);

CREATE TABLE alarm_settings (
    id UUID PRIMARY KEY,
    outdated UUID NOT NULL REFERENCES situation_settings(id) ON DELETE CASCADE,
    falling UUID NOT NULL REFERENCES situation_settings(id) ON DELETE CASCADE,
    rising UUID NOT NULL REFERENCES situation_settings(id) ON DELETE CASCADE,
    low UUID NOT NULL REFERENCES situation_settings(id) ON DELETE CASCADE,
    badLow UUID NOT NULL REFERENCES situation_settings(id) ON DELETE CASCADE,
    compressionLow UUID NOT NULL REFERENCES situation_settings(id) ON DELETE CASCADE,
    high UUID NOT NULL REFERENCES situation_settings(id) ON DELETE CASCADE,
    badHigh UUID NOT NULL REFERENCES situation_settings(id) ON DELETE CASCADE,
    persistentHigh UUID NOT NULL REFERENCES situation_settings(id) ON DELETE CASCADE
);

CREATE TABLE profile_templates (
    id UUID PRIMARY KEY,
    profileName TEXT,
    alarmsEnabled BOOLEAN NOT NULL DEFAULT true,
    analyserSettingsId UUID NOT NULL REFERENCES analyser_settings(id) ON DELETE CASCADE,
    alarmSettingsId UUID NOT NULL REFERENCES alarm_settings(id) ON DELETE CASCADE
);

CREATE TABLE pushover_levels (
    id UUID PRIMARY KEY,
    profileTemplateId: UUID NOT NULL REFERENCES profile_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE profiles_activations (
   id UUID PRIMARY KEY,
   profileTemplateId UUID NOT NULL REFERENCES profile_templates(id) ON DELETE CASCADE,
   activatedAt TIMESTAMPTZ NOT NULL,
   repeatTimeInLocalTimezone TEXT,
   deactivatedAt TIMESTAMPTZ
);

CREATE TYPE situation AS ENUM ('OUTDATED', 'FALLING', 'RISING', 'LOW', 'BAD_LOW', 'COMPRESSION_LOW', 'HIGH', 'BAD_HIGH', 'PERSISTENT_HIGH');

CREATE TABLE alarms (
   id UUID PRIMARY KEY,
   timestamp TIMESTAMPTZ NOT NULL,
   situation situation NOT NULL,
   isActive BOOLEAN NOT NULL DEFAULT true,
   deactivatedAt TIMESTAMPTZ
);

CREATE TABLE alarm_states (
    id UUID PRIMARY KEY,
    alarmId UUID NOT NULL REFERENCES alarms(id) ON DELETE CASCADE,
    alarmLevel INTEGER NOT NULL,
    validAfterTimestamp TIMESTAMPTZ NOT NULL,
    ackedBy TEXT
);

CREATE TABLE pushover_receipts (
    id UUID PRIMARY KEY,
    alarmStateId UUID NOT NULL REFERENCES alarm_states(id) ON DELETE CASCADE,
    receipt TEXT NOT NULL
);

CREATE TYPE insulinType AS ENUM ('FAST', 'LONG');

CREATE TABLE insulin_entries (
    timestamp TIMESTAMPTZ NOT NULL,
    amount INTEGER NOT NULL,
    type insulinType NOT NULL
);

CREATE TABLE carb_entries (
    timestamp TIMESTAMPTZ NOT NULL,
    amount INTEGER NOT NULL,
    speedFactor INTEGER NOT NULL
);

CREATE TABLE meter_entries (
    timestamp TIMESTAMPTZ NOT NULL,
    bloodGlucose INTEGER NOT NULL
);

-- Change enum name and remove type MANUAL
ALTER TABLE sensor_entries DROP COLUMN type;
DROP TYPE blood_glucose_entry_type;
CREATE TYPE sensor_entry_type AS ENUM ('DEXCOM_G6_SHARE');
ALTER TABLE sensor_entries ADD COLUMN type sensor_entry_type DEFAULT 'DEXCOM_G6_SHARE' NOT NULL;
