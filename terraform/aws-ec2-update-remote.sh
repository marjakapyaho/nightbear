#!/bin/bash

if [ -z "$TRACK_BRANCH" ]; then
  echo "Missing required var: TRACK_BRANCH"
  exit 1
fi
if [ -z "$COMPOSE_SERVICE" ]; then
  echo "Missing required var: COMPOSE_SERVICE"
  exit 1
fi

set -e # exit immediately if a command exits non-zero

cd nightbear/server

git fetch
git reset --hard "origin/$TRACK_BRANCH"

sudo docker-compose build "$COMPOSE_SERVICE"
sudo docker-compose stop "$COMPOSE_SERVICE"
sudo docker-compose rm -f "$COMPOSE_SERVICE"
sudo docker-compose up -d "$COMPOSE_SERVICE"
sudo docker-compose up -d # if any support services aren't up yet (e.g. first run), bring them up
