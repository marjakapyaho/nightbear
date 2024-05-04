TRUNCATE TABLE carb_entries;

INSERT INTO carb_entries
SELECT
  (json->'doc'->>'modelUuid')::uuid AS id,
  to_timestamp((json->'doc'->>'timestamp')::numeric / 1000.0)::timestamptz AS timestamp,
  (json->'doc'->>'amount')::numeric AS amount,
  1.0 AS duration_factor
FROM legacy_data
WHERE json->'doc'->>'modelType' = 'Carbs'
ORDER BY 2 ASC;

DELETE FROM legacy_data
WHERE json->'doc'->>'modelType' = 'Carbs';
