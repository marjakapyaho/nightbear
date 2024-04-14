/* @name createAlarm */
INSERT INTO alarms (
  timestamp,
  situation,
  isActive,
  deactivatedAt
)
VALUES (
  :timestamp!,
  :situation!,
  :isActive!,
  :deactivatedAt
)
RETURNING *;

/* @name createAlarmState */
INSERT INTO alarm_states (
  alarmId,
  alarmLevel,
  validAfterTimestamp,
  ackedBy
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
  alarmStateId,
  receipt
)
VALUES (
 :alarmStateId!,
 :receipt!
)
RETURNING *;
