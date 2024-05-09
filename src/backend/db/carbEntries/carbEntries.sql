/*
  @name upsertCarbEntry
*/
INSERT INTO carb_entries (
  timestamp,
  amount,
  duration_factor
)
VALUES (
  :timestamp!,
  :amount!,
  :durationFactor!
)
ON CONFLICT (timestamp) DO UPDATE SET
  amount = EXCLUDED.amount
RETURNING *;


/*
  @name createCarbEntries
  @param carbEntries -> ((
    amount!,
    durationFactor!,
    timestamp!
  )...)
*/
INSERT INTO carb_entries (
  amount,
  duration_factor,
  timestamp
)
VALUES :carbEntries
RETURNING *;


/* @name getCarbEntriesByTimestamp */
SELECT
  timestamp,
  amount,
  duration_factor
FROM carb_entries
WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP);
