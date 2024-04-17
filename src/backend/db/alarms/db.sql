/* @name createAlarm */
INSERT INTO alarms (
  situation,
  is_active,
  deactivated_at
)
VALUES (
  :situation!,
  :isActive!,
  :deactivatedAt
)
RETURNING *;

/* @name createAlarmState */
INSERT INTO alarm_states (
  alarm_id,
  alarm_level,
  valid_after_timestamp,
  acked_by
)
VALUES (
 :alarmId!,
 :alarmLevel!,
 :validAfterTimestamp!,
 :ackedBy
)
RETURNING *;

/* @name createPushoverReceipt */
INSERT INTO pushover_receipts (
  alarm_state_id,
  receipt
)
VALUES (
 :alarmStateId!,
 :receipt!
)
RETURNING *;
