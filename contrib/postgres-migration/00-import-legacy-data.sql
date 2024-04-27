CREATE TABLE legacy_data (json jsonb);

\copy legacy_data (json) FROM '/app/couchdb-prod-dump-rows.json' WITH (FORMAT text);
