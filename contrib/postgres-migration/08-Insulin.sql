TRUNCATE TABLE insulin_entries;

INSERT INTO insulin_entries
SELECT
  (json->'doc'->>'modelUuid')::uuid AS id,
  to_timestamp((json->'doc'->>'timestamp')::numeric / 1000.0)::timestamptz AS timestamp,
  (json->'doc'->>'amount')::numeric AS amount,
  'FAST' AS type
FROM legacy_data
WHERE json->'doc'->>'modelType' = 'Insulin'
ORDER BY 2 ASC;

DELETE FROM legacy_data
WHERE json->'doc'->>'modelType' = 'Insulin';
