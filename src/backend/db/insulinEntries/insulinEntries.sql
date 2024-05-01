/* @name create */
INSERT INTO insulin_entries (
  amount,
  type
)
VALUES (
  :amount!,
  :type!
)
RETURNING *;

/*
  @name createInsulinEntries
  @param insulinEntries -> ((
    amount!,
    type!,
    timestamp!
  )...)
*/
INSERT INTO insulin_entries (
  amount,
  type,
  timestamp
)
VALUES :insulinEntries
RETURNING timestamp;

/* @name byTimestamp */
SELECT
  timestamp,
  amount,
  type
FROM insulin_entries
WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP);

/*
  @name upsertInsulinEntry
*/
INSERT INTO insulin_entries (
  timestamp,
  amount,
  type
)
VALUES (
  :timestamp!,
  :amount!,
  :type!
)
ON CONFLICT (timestamp) DO UPDATE SET
  amount = EXCLUDED.amount
RETURNING *;
