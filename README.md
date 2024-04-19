# nightbear

[![Build Status](https://travis-ci.org/marjakapyaho/nightbear.svg?branch=master)](https://travis-ci.org/marjakapyaho/nightbear)

Nightbear repository includes code for:
* nightbear node server
* Fitbit clockface and alarm app
* React UI
* Pebble watchface and alarm app (deprecated)

Add to your environment:

```
export DATABASE_URL=postgres://nightbear:nightbear@localhost:25432/nightbear_test
```

Start test DB:

```
docker-compose up -d
./contrib/migrate/test
```

To look around in the DB:

```
$ docker exec -it -e PGPASSWORD=nightbear nightbear-test-db psql -U nightbear -d nightbear_test
psql (16.2 (Debian 16.2-1.pgdg120+2))
Type "help" for help.

nightbear_test=# \d
```
