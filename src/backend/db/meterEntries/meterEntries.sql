/* @name create */
INSERT INTO meter_entries (blood_glucose)
VALUES (:bloodGlucose!)
RETURNING *;

/*
  @name createMeterEntries
  @param meterEntries -> ((
    bloodGlucose!,
    timestamp!
  )...)
*/
INSERT INTO meter_entries (
  blood_glucose,
  timestamp
)
VALUES :meterEntries
RETURNING timestamp;


/* @name byTimestamp */
SELECT
  timestamp,
  blood_glucose
FROM meter_entries
WHERE timestamp >= :from! AND timestamp <= :to!;

/*
  @name upsertMeterEntry
*/
INSERT INTO meter_entries (
  timestamp,
  blood_glucose
)
VALUES (
  :timestamp!,
  :bloodGlucose!
)
ON CONFLICT (timestamp) DO UPDATE SET
  blood_glucose = EXCLUDED.blood_glucose
RETURNING *;
