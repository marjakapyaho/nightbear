#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )" # https://stackoverflow.com/a/246128
SSH_TARGET="ubuntu@server-stage.nightbear.fi"
SCRIPT_NAME="deploy-latest-server.sh"
TRACK_BRANCH="server-next"
COMPOSE_SERVICE="server"
SSH_KEY_FILE="$DIR/../terraform.id_rsa"
REMOTE_DIR="nightbear/server"

# This means we're running locally, on the dev's machine
if [ "$1" != "--remote" ]; then

  # https://unix.stackexchange.com/a/269085
  BOLD="$(tput bold)"
  RED="$(tput setaf 1)"
  GREEN="$(tput setaf 2)"
  RESET="$(tput sgr 0)"

  echo
  echo -e "Target:  ${BOLD}${SSH_TARGET}${RESET}"
  echo -e "Branch:  ${BOLD}${TRACK_BRANCH}${RESET}"
  echo -e "Service: ${BOLD}${COMPOSE_SERVICE}${RESET}"
  echo

  scp \
    -i "$SSH_KEY_FILE" \
    -o StrictHostKeyChecking=no \
    "$DIR/$SCRIPT_NAME" \
    "$SSH_TARGET:$SCRIPT_NAME"

  if [ ! $? -eq 0 ]; then
    echo -e "\nUpdate: ${BOLD}${RED}ERROR${RESET}: scp command failed\n"
    exit 1
  fi

  echo

  ssh \
    -i "$SSH_KEY_FILE" \
    -o StrictHostKeyChecking=no \
    "$SSH_TARGET" \
    "TRACK_BRANCH=$TRACK_BRANCH COMPOSE_SERVICE=$COMPOSE_SERVICE ./$SCRIPT_NAME --remote"

  if [ ! $? -eq 0 ]; then
    echo -e "\nUpdate: ${BOLD}${RED}ERROR${RESET}: ssh command failed\n"
    exit 1
  fi

  echo -e "\nUpdate: ${BOLD}${GREEN}SUCCESS${RESET}\n"

# This means we're running remotely, on the server
else

  set -e # exit immediately if a command exits non-zero

  cd "$REMOTE_DIR"

  git fetch
  git reset --hard "origin/$TRACK_BRANCH"

  cd

  sudo docker-compose build "$COMPOSE_SERVICE"
  sudo docker-compose stop "$COMPOSE_SERVICE"
  sudo docker-compose rm -f "$COMPOSE_SERVICE"
  sudo docker-compose up -d "$COMPOSE_SERVICE"
  sudo docker-compose up -d # if any support services aren't up yet (e.g. first run), bring them up

fi
