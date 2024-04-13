/* @name createSensorEntry */
INSERT INTO sensor_entries (blood_glucose, type)
VALUES (:bloodGlucose!, :type!)
RETURNING *;

/*
  @name getSensorEntries
  @param range -> (
    from!,
    to!
  )
*/
SELECT
    timestamp,
    blood_glucose as "bloodGlucose",
    type
FROM sensor_entries
WHERE timestamp >= :from AND timestamp <= :to;
