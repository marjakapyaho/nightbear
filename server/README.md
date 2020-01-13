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

1. Log onto the hosting server (i.e. your Docker host)
1. Pick a destination DB name that doesn't yet exist, and based on that, add correct values for `NIGHTBEAR_MIGRATE_REMOTE_DB_URL` and `NIGHTBEAR_MIGRATE_TARGET_DB_URL` to your `.env` file
1. Prepare a git working copy, with `git clone https://github.com/marjakapyaho/nightbear.git legacy-migration`
1. Run the initial migration, with `docker run --rm -it -v $(pwd)/legacy-migration:/app -w /app --env-file .env node:8.10 bash -c 'npm install && NODE_PATH=. ./node_modules/.bin/ts-node contrib/legacy-db-migration/migrate.ts > migrate.log'`
1. Set up a container for the continuous migration, with `docker run -d --name legacy-migration -v $(pwd)/legacy-migration:/app -w /app --env-file .env --env NIGHTBEAR_MIGRATE_INCREMENTAL_MODE=1 node:8.10 bash -c 'NODE_PATH=. ./node_modules/.bin/ts-node contrib/legacy-db-migration/migrate.ts >> migrate.log'`
1. Set up a scheduled run for the container, with `crontab -e` and put in `*/5 * * * * docker start legacy-migration`
