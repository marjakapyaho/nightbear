# Nightbear Server

## Dev env setup

Create a local test DB:

1. Run `docker run -d -p 5984:5984 --name nightbear-test-couchdb apache/couchdb:2.1.1`
1. Visit http://localhost:5984/_utils/#/setup
1. Create a single node, with credentials `admin:admin`
1. Enable CORS for all domains
1. Create a new DB called `test`
1. Use `export TEST_DB_URL=http://admin:admin@localhost:5984/test`
1. Run `npm test`
