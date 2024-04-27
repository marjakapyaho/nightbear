INSERT INTO sensor_entries
SELECT
  (json->'doc'->>'modelUuid')::uuid AS id,
  to_timestamp((json->'doc'->>'timestamp')::numeric / 1000.0)::timestamptz AS timestamp,
  'PARAKEET' AS type,
  (json->'doc'->>'bloodGlucose')::numeric AS blood_glucose
FROM legacy_data
WHERE json->'doc'->>'modelType' = 'ParakeetSensorEntry'
ORDER BY 2 ASC;

DELETE FROM legacy_data
WHERE json->'doc'->>'modelType' = 'ParakeetSensorEntry';
