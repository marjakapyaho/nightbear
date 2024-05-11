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

/*
  @name deleteInsulinEntry
*/
DELETE FROM insulin_entries
WHERE timestamp = :timestamp!
RETURNING timestamp;

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
RETURNING *;

/* @name getInsulinEntriesByTimestamp */
SELECT
  timestamp,
  amount,
  type
FROM insulin_entries
WHERE timestamp >= :from! AND timestamp <= COALESCE(:to, CURRENT_TIMESTAMP);
