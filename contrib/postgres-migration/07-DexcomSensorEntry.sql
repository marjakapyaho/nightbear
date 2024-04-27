INSERT INTO sensor_entries
SELECT
  (json->'doc'->>'modelUuid')::uuid AS id,
  to_timestamp((json->'doc'->>'timestamp')::numeric / 1000.0)::timestamptz AS timestamp,
  'DEXCOM_G4_UPLOADER' AS type,
  (json->'doc'->>'bloodGlucose')::numeric AS blood_glucose
FROM legacy_data
WHERE json->'doc'->>'modelType' = 'DexcomSensorEntry'
  AND json->'doc'->>'bloodGlucose' IS NOT NULL -- for whatever reason, during 2015-11-29 → 2015-12-06, we hadn't stored the BG
ORDER BY 2 ASC;

DELETE FROM legacy_data
WHERE json->'doc'->>'modelType' = 'DexcomSensorEntry';
