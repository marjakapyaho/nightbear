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
