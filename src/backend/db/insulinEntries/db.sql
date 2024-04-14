/* @name createInsulinEntry */
INSERT INTO insulin_entries (
  amount,
  type
)
VALUES (
  :amount!,
  :type!
)
RETURNING *;
