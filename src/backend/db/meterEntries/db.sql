/* @name createMeterEntry */
INSERT INTO meter_entries (blood_glucose)
VALUES (:bloodGlucose!)
RETURNING *;
