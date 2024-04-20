/* @name create */
INSERT INTO sensor_entries (blood_glucose, type)
VALUES (:bloodGlucose!, :type!)
RETURNING *;

/* @name byTimestamp */
SELECT *
FROM sensor_entries
WHERE timestamp >= :from! AND timestamp <= :to!;

/* @name latest */
SELECT *
FROM sensor_entries
ORDER BY timestamp DESC
LIMIT 1;
