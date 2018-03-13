#!/bin/bash

DB_URL="http://admin:$NIGHTBEAR_COUCHDB_PASSWORD@localhost:5984" # note: this URL only needs to work WITHIN the DB container itself
DEFAULT_DB="nightbear_stage"

# https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/#install-using-the-convenience-script
curl -fsSL get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# https://docs.docker.com/compose/install/
sudo curl -L https://github.com/docker/compose/releases/download/1.19.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Check out codebase
git clone https://github.com/marjakapyaho/nightbear.git
cd nightbear/server

# Grab secrets from HOME so docker-compose can use them
cp ~/.env .

# Bring up DB container and wait until its API is up
sudo docker-compose up -d db-stage
until sudo docker-compose exec db-stage curl "$DB_URL"; do
  echo "Waiting for CouchDB..."
  sleep 1
done

# Configure CouchDB to run in single-node mode
sudo docker-compose exec db-stage curl \
  -X POST \
  -H "Content-Type: application/json" \
  "$DB_URL/_cluster_setup" \
  -d '{"action": "enable_single_node"}'

# Create the default DB
sudo docker-compose exec db-stage curl \
  -X PUT \
  "$DB_URL/$DEFAULT_DB"
