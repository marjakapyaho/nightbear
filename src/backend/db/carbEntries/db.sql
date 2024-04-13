/* @name createCarbEntry */
INSERT INTO carb_entries (amount, speedFactor)
VALUES (:amount!, :speedFactor!)
RETURNING *;
