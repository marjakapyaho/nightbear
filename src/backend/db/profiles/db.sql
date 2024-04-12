/* @name create */
INSERT INTO profiles (activated_at, profile_name)
VALUES (:activatedAt!, :profileName!)
RETURNING *;

/* @name create */
INSERT INTO analyser_settings (activated_at, profile_name)
VALUES (:activatedAt!, :profileName!)
RETURNING *;

/* @name create */
INSERT INTO alarm_settings (activated_at, profile_name)
VALUES (:activatedAt!, :profileName!)
RETURNING *;

/* @name create */
INSERT INTO pushover_levels (activated_at, profile_name)
VALUES (:activatedAt!, :profileName!)
RETURNING *;
