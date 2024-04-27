DELETE FROM legacy_data
WHERE json->'doc'->>'modelType' = 'DexcomCalibration'; -- these were used to calculate BG from raw entries → not useful on their own anymore
