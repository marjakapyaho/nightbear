/* @name create */
INSERT INTO alarms (situation_type, is_active, deactivation_timestamp)
VALUES (:situationType!, :isActive!, :deactivationTimestamp)
RETURNING *;

/* @name create */
INSERT INTO alarm_states (alarm_level, valid_after_timestamp, acked_by, pushover_receipts)
VALUES (:alarmLevel!, :validAfterTimestamp!, :ackedBy!, :pushoverReceipts!)
RETURNING *;
