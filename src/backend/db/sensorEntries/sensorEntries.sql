/* @name create */
INSERT INTO sensor_entries (blood_glucose, type)
VALUES (:bloodGlucose!, :type!)
RETURNING *;

/*
  @name createSensorEntries
  @param sensorEntries -> ((
    bloodGlucose!,
    type!,
    timestamp!
  )...)
*/
INSERT INTO sensor_entries (
  blood_glucose,
  type,
  timestamp
)
VALUES :sensorEntries
RETURNING timestamp;

/* @name byTimestamp */
SELECT *
FROM sensor_entries
WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP);

/* @name latest */
SELECT *
FROM sensor_entries
ORDER BY timestamp DESC
LIMIT 1;
