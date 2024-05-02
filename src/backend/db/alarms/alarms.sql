/* @name createAlarm */
INSERT INTO alarms (
  timestamp,
  situation,
  deactivated_at
)
VALUES (
  coalesce(:timestamp, CURRENT_TIMESTAMP),
  :situation!,
  :deactivatedAt
)
RETURNING *;

/*
  @name deactivateAlarm
*/
UPDATE alarms SET
  deactivated_at = coalesce(:currentTimestamp, CURRENT_TIMESTAMP)
WHERE id = :id!
RETURNING *;

/* @name createAlarmState */
INSERT INTO alarm_states (
  timestamp,
  alarm_id,
  alarm_level,
  valid_after,
  acked_by,
  notification_target,
  notification_receipt,
  notification_processed_at
)
VALUES (
   coalesce(:timestamp, CURRENT_TIMESTAMP),
   :alarmId!,
   :alarmLevel!,
   :validAfter!,
   :ackedBy,
   :notificationTarget,
   :notificationReceipt,
   :notificationProcessedAt
 )
RETURNING *;

/*
  @name markAlarmAsProcessed
*/
UPDATE alarm_states SET
  notification_receipt = :notificationReceipt,
  notification_processed_at = coalesce(:currentTimestamp, CURRENT_TIMESTAMP)
WHERE id = :id!
RETURNING *;

/*
  @name markAllAlarmStatesAsProcessed
*/
UPDATE alarm_states SET
  notification_processed_at = coalesce(:currentTimestamp, CURRENT_TIMESTAMP)
WHERE alarm_id = :alarmId! AND notification_processed_at IS NULL
RETURNING *;

/*
  @name getAlarms
*/
WITH
  alarm_states_query AS (
    SELECT
      alarm_states.alarm_id,
      json_agg(json_build_object(
        'id', alarm_states.id::VARCHAR,
        'timestamp', alarm_states.timestamp,
        'alarmLevel', alarm_states.alarm_level,
        'validAfter', alarm_states.valid_after,
        'ackedBy', alarm_states.acked_by,
        'notificationTarget', alarm_states.notification_target,
        'notificationReceipt', alarm_states.notification_receipt,
        'notificationProcessedAt', alarm_states.notification_processed_at
        ) ORDER BY alarm_states.timestamp) AS alarm_states
    FROM alarm_states
    GROUP BY alarm_states.alarm_id
  )
SELECT
  alarms.id AS id,
  timestamp,
  situation,
  (CASE WHEN deactivated_at IS NULL THEN true ELSE false END) AS "is_active!",
  deactivated_at,
  alarm_states_query.alarm_states AS alarm_states
FROM alarms
  LEFT JOIN alarm_states_query ON alarm_states_query.alarm_id = alarms.id
WHERE
  (:onlyActive = TRUE AND deactivated_at IS NULL) OR
  timestamp >= :from AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP);
