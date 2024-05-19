-- Up Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE cronjobs_journal (
  previous_execution_at TIMESTAMPTZ,
  dexcom_share_session_id TEXT,
  dexcom_share_login_attempt_at TIMESTAMPTZ
);

-- PROFILES

CREATE TYPE situation AS ENUM (
  'OUTDATED',
  'CRITICAL_OUTDATED',
  'FALLING',
  'RISING',
  'LOW',
  'BAD_LOW',
  'COMPRESSION_LOW',
  'HIGH',
  'BAD_HIGH',
  'PERSISTENT_HIGH',
  'MISSING_DAY_INSULIN'
);

CREATE TABLE profile_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_name TEXT,
  repeat_time_in_local_timezone TEXT,
  alarms_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_targets TEXT[] NOT NULL,
  analyser_high_level_rel NUMERIC(3, 1) NOT NULL,
  analyser_high_level_abs NUMERIC(3, 1) NOT NULL,
  analyser_high_level_bad NUMERIC(3, 1) NOT NULL,
  analyser_low_level_rel NUMERIC(3, 1) NOT NULL,
  analyser_low_level_abs NUMERIC(3, 1) NOT NULL,
  analyser_time_since_bg_minutes INTEGER NOT NULL,
  situation_outdated JSONB NOT NULL,
  situation_critical_outdated JSONB NOT NULL,
  situation_falling JSONB NOT NULL,
  situation_rising JSONB NOT NULL,
  situation_low JSONB NOT NULL,
  situation_bad_low JSONB NOT NULL,
  situation_compression_low JSONB NOT NULL,
  situation_high JSONB NOT NULL,
  situation_bad_high JSONB NOT NULL,
  situation_persistent_high JSONB NOT NULL,
  situation_missing_day_insulin JSONB NOT NULL
);

CREATE TABLE profile_activations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_template_id UUID NOT NULL REFERENCES profile_templates(id) ON DELETE CASCADE,
  activated_at TIMESTAMPTZ NOT NULL,
  deactivated_at TIMESTAMPTZ
);

-- ALARMS

CREATE TABLE alarms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  situation situation NOT NULL,
  deactivated_at TIMESTAMPTZ
);

CREATE TABLE alarm_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  alarm_id UUID NOT NULL REFERENCES alarms(id) ON DELETE CASCADE,
  alarm_level INTEGER NOT NULL,
  valid_after TIMESTAMPTZ NOT NULL,
  acked_by TEXT,
  notification_target TEXT,
  notification_receipt TEXT,
  notification_processed_at TIMESTAMPTZ
);

-- Timeline entries:

CREATE TYPE sensor_entry_type AS ENUM (
  'DEXCOM_G4_UPLOADER',
  'DEXCOM_G4_UPLOADER_RAW',
  'DEXCOM_G6_UPLOADER',
  'DEXCOM_G6_SHARE',
  'LIBRE_3_LINK'
);

CREATE TABLE sensor_entries (
  timestamp TIMESTAMPTZ NOT NULL PRIMARY KEY DEFAULT CURRENT_TIMESTAMP,
  type sensor_entry_type NOT NULL,
  blood_glucose NUMERIC(3, 1) NOT NULL
);

CREATE TYPE insulin_type AS ENUM (
  'FAST',
  'LONG'
);

CREATE TABLE insulin_entries (
  timestamp TIMESTAMPTZ NOT NULL PRIMARY KEY DEFAULT CURRENT_TIMESTAMP,
  amount INTEGER NOT NULL,
  type insulin_type NOT NULL
);

CREATE TABLE carb_entries (
  timestamp TIMESTAMPTZ NOT NULL PRIMARY KEY DEFAULT CURRENT_TIMESTAMP,
  amount INTEGER NOT NULL,
  duration_factor NUMERIC(2, 1) NOT NULL
);

CREATE TABLE meter_entries (
  timestamp TIMESTAMPTZ NOT NULL PRIMARY KEY DEFAULT CURRENT_TIMESTAMP,
  blood_glucose NUMERIC(3, 1) NOT NULL
);
