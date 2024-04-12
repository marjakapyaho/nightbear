/* @name create */
INSERT INTO carb_entries (amount, speedFactor)
VALUES (:amount!, :speedFactor!)
RETURNING *;
