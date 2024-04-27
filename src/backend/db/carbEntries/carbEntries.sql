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
