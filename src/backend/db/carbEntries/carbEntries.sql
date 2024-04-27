/* @name create */
INSERT INTO carb_entries (
  amount,
  speed_factor
)
VALUES (
  :amount!,
  :speedFactor!
)
RETURNING *;

/* @name byTimestamp */
SELECT
  timestamp,
  amount,
  speed_factor
FROM carb_entries
WHERE timestamp >= :from! AND timestamp <= :to!;

/*
  @name upsertCarbEntry
*/
INSERT INTO carb_entries (
  timestamp,
  amount,
  speed_factor
)
VALUES (
  :timestamp!,
  :amount!,
  :speedFactor!
)
ON CONFLICT (timestamp) DO UPDATE SET
  amount = EXCLUDED.amount
RETURNING *;
