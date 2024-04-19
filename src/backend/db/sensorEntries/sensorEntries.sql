/* @name create */
INSERT INTO sensor_entries (blood_glucose, type)
VALUES (:bloodGlucose!, :type!)
RETURNING *;

/* @name byTimestamp */
SELECT
  timestamp,
  blood_glucose,
  type
FROM sensor_entries
WHERE timestamp >= :from! AND timestamp <= :to!;
