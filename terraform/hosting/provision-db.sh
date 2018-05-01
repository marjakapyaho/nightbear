#!/bin/bash

# Make secrets available
source ~/.env

# Perform setup
URL="http://admin:$db_admin_password@localhost:5984" # note: this URL only needs to work WITHIN the DB container itself
CONFIG="$URL/_node/nonode@nohost/_config"
CURL="docker-compose exec db curl"
JSON="-H Content-Type:application/json"

# Wait for the CouchDB API to come up
docker-compose up -d db
until $CURL $URL; do
  echo "Waiting for CouchDB to start..."
  sleep 1
done
echo "CouchDB started"

# Configure CouchDB to run in single-node mode
$CURL -X POST $JSON "$URL/_cluster_setup" -d '{"action": "enable_single_node"}'

# Enable CORS
$CURL -X PUT $JSON "$CONFIG/httpd/enable_cors" -d '"true"'
$CURL -X PUT $JSON "$CONFIG/cors/origins" -d '"*"'
$CURL -X PUT $JSON "$CONFIG/cors/methods" -d '"GET, PUT, POST, HEAD, DELETE"'
$CURL -X PUT $JSON "$CONFIG/cors/credentials" -d '"true"'
$CURL -X PUT $JSON "$CONFIG/cors/headers" -d '"accept, authorization, content-type, origin, referer"'

# Make auth timeout more sensible
$CURL -X PUT $JSON "$CONFIG/couch_httpd_auth/timeout" -d '"31556952"' # i.e. one year

# Less verbose logging
$CURL -X PUT $JSON "$CONFIG/log/level" -d '"warning"' # http://docs.couchdb.org/en/2.1.0/config/logging.html#log/level
