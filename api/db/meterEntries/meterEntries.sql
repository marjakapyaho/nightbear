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

/*
  @name deleteMeterEntry
*/
DELETE FROM meter_entries
WHERE timestamp = :timestamp!
RETURNING timestamp;

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
RETURNING *;


/* @name getMeterEntriesByTimestamp */
SELECT
  timestamp,
  blood_glucose
FROM meter_entries
WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP);
