/* @name update */
UPDATE cronjobs_journal
SET
  previous_execution_at = :previousExecutionAt,
  dexcom_share_session_id = :dexcomShareSessionId,
  dexcom_share_login_attempt_at = :dexcomShareLoginAttemptAt
RETURNING *;

/* @name load */
SELECT * FROM cronjobs_journal LIMIT 1;
