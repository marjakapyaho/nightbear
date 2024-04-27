INSERT INTO sensor_entries
SELECT
  (json->'doc'->>'modelUuid')::uuid AS id,
  to_timestamp((json->'doc'->>'timestamp')::numeric / 1000.0)::timestamptz AS timestamp,
  'DEXCOM_G4_UPLOADER_RAW' AS type,
  (json->'doc'->>'bloodGlucose')::numeric AS blood_glucose
FROM legacy_data
WHERE json->'doc'->>'modelType' = 'DexcomRawSensorEntry'
  AND json->'doc'->>'bloodGlucose' IS NOT NULL -- during 2015-11 → 2017-01 we got these entries, but didn't store their computed BG → won't recreate them now, it was complicated
ORDER BY 2 ASC;

DELETE FROM legacy_data
WHERE json->'doc'->>'modelType' = 'DexcomRawSensorEntry';
