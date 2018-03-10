#!/bin/bash

SSH_TARGET="ubuntu@server-stage.nightbear.fi"
REMOTE_SCRIPT="aws-ec2-update-remote.sh"
TRACK_BRANCH="add-server-setup" # TODO: This will probably become "master" at some point
COMPOSE_SERVICE="server-stage"
SSH_KEY_FILE="terraform.id_rsa"

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
  "$REMOTE_SCRIPT" \
  "$SSH_TARGET:$REMOTE_SCRIPT"

if [ ! $? -eq 0 ]; then
  echo -e "\nUpdate: ${BOLD}${RED}ERROR${RESET}: scp command failed\n"
  exit 1
fi

echo

ssh \
  -i "$SSH_KEY_FILE" \
  -o StrictHostKeyChecking=no \
  "$SSH_TARGET" \
  "TRACK_BRANCH=$TRACK_BRANCH COMPOSE_SERVICE=$COMPOSE_SERVICE ./$REMOTE_SCRIPT"

if [ ! $? -eq 0 ]; then
  echo -e "\nUpdate: ${BOLD}${RED}ERROR${RESET}: ssh command failed\n"
  exit 1
fi

echo -e "\nFor manual tweaks: $ ssh -i $SSH_KEY_FILE $SSH_TARGET"
echo -e "\nUpdate: ${BOLD}${GREEN}SUCCESS${RESET}\n"
