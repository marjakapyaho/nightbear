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

/*
  @name createCarbEntries
  @param carbEntries -> ((
    amount!,
    speedFactor!,
    timestamp!
  )...)
*/
INSERT INTO carb_entries (
  amount,
  speed_factor,
  timestamp
)
VALUES :carbEntries
RETURNING timestamp;


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
