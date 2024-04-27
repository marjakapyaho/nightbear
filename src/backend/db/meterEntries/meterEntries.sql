/* @name create */
INSERT INTO meter_entries (blood_glucose)
VALUES (:bloodGlucose!)
RETURNING *;

/* @name byTimestamp */
SELECT
  timestamp,
  blood_glucose
FROM meter_entries
WHERE timestamp >= :from! AND timestamp <= :to!;
