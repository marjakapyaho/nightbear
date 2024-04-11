/* @name create */
INSERT INTO blood_glucose_entries (type, blood_glucose)
VALUES (:type!, :bloodGlucose!)
RETURNING *;
