TRUNCATE TABLE meter_entries;

INSERT INTO meter_entries
SELECT
  (json->'doc'->>'modelUuid')::uuid AS id,
  to_timestamp((json->'doc'->>'timestamp')::numeric / 1000.0)::timestamptz AS timestamp,
  (json->'doc'->>'bloodGlucose')::numeric AS blood_glucose
FROM legacy_data
WHERE json->'doc'->>'modelType' = 'MeterEntry'
ORDER BY 2 ASC;

DELETE FROM legacy_data
WHERE json->'doc'->>'modelType' = 'MeterEntry';
