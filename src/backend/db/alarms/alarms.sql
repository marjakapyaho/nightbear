/* @name createAlarm */
INSERT INTO alarms (
  situation,
  deactivated_at
)
VALUES (
  :situation!,
  :deactivatedAt
)
RETURNING *;

/*
  @name deactivateAlarm
*/
UPDATE alarms SET
  deactivated_at = CURRENT_TIMESTAMP
WHERE id = :id!
RETURNING *;

/* @name createAlarmState */
INSERT INTO alarm_states (
  alarm_id,
  alarm_level,
  valid_after,
  acked_by,
  notification_target,
  notification_receipt,
  notification_processed_at
)
VALUES (
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
  notification_processed_at = CURRENT_TIMESTAMP
WHERE id = :id!
RETURNING *;

/*
  @name getActiveAlarm
*/
SELECT
  id,
  timestamp,
  situation,
  deactivated_at
FROM alarms
WHERE deactivated_at IS NULL;
