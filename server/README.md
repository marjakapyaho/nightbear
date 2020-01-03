# Nightbear Server

## Dev env setup

Create a local dev DB:

1. Run `docker run -d -p 5984:5984 --name nightbear-dev-couchdb couchdb:2.3.1`
1. Visit http://localhost:5984/_utils/#/setup
1. Create a single node, with credentials `admin:admin`
1. Config -> CORS -> Enable CORS for all domains
1. Config -> Main config -> `couch_httpd_auth` -> `timeout` -> set value to 31556926 (a year in seconds)
1. Create a new DB called `dev` (Databases > Create Database)
1. Run `export NIGHTBEAR_DB_URL=http://admin:admin@localhost:5984/dev`
1. Run `export NIGHTBEAR_TEST_DB_URL=http://admin:admin@localhost:5984/`
1. Run `npm test` to see that everything works

## Starting docker process if it has stopped

`docker start nightbear-dev-couchdb`

## Backups

Useful utils for backing up/moving the DB's around:

1. https://www.npmjs.com/package/@cloudant/couchbackup
1. https://www.npmjs.com/package/couchreplicate

## Removing old logs

...from an Ubuntu Docker host:

`sudo journalctl --vacuum-size=50M` (leave only the last 50 MB's worth of logs)

## Migrating from legacy DB

1. Pick a destination DB name that doesn't yet exist
1. Run `NODE_PATH=. ./node_modules/.bin/ts-node contrib/legacy-db-migration/migrate.ts > migrate.log` to that DB, with `INCREMENTAL = false`
1. Let the process finish; it'll take a while
1. Try connecting the UI to the newly migrated DB; the first requests might fail, as indices are being built (this may take about 5 minutes)
1. Eventually, the UI should show data, though the most recent data will be missing
1. Run `migrate.ts` again, but with `INCREMENTAL = true`
1. The process should complete very quickly this time, and refreshing the UI should show fully up-to-date data
