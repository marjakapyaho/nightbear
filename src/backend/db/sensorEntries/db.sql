/* @name create */
INSERT INTO blood_glucose_entries (blood_glucose, type)
VALUES (:bloodGlucose!, :type!)
RETURNING *;
