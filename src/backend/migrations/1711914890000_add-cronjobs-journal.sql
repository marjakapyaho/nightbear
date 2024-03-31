-- Up Migration

CREATE TABLE cronjobs_journal (
  previous_execution_at TIMESTAMPTZ,
  dexcom_share_session_id TEXT,
  dexcom_share_login_attempt_at TIMESTAMPTZ
);

INSERT INTO cronjobs_journal DEFAULT VALUES;
