#!/bin/bash

# Exit on errors
set -e

# Prepare env
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )" # https://stackoverflow.com/a/246128
DEPLOY_ENV="$1"
if [ -z "$DEPLOY_ENV" ]; then
  echo "Error: Please provide either 'prod' or 'stage' as first argument to script"
  exit 1
fi

# Make sure we know what we're doing
echo "Warning: This will destroy and re-create hosting for env '$DEPLOY_ENV'"
echo "Are you sure? (Only 'yes' will be accepted)"
read sure
if [ "$sure" != "yes" ]; then
  echo "OK, not doing anything"
  exit 0
fi

# Regardless of the PWD, move into the terraform root
cd "$DIR/.."

# Shut down the remote machine
SSH_COMMAND="$(terraform output -json | jq -r ".hosting_${DEPLOY_ENV}_ssh_command.value")"
if [[ ! "$SSH_COMMAND" =~ ^ssh ]]; then
  echo "Error: The SSH command '$SSH_COMMAND' doesn't look right"
  exit
fi
echo "The following may take a long time if the host is already down."
echo "Wait patiently, the command will time out, and then we'll continue."
$SSH_COMMAND "sudo shutdown -h now" || true # don't exit on non-0 exit code (the host might be down already)

# Re-provision the relevant resources
terraform taint -module="hosting_$DEPLOY_ENV.host" aws_instance.this
terraform apply -target="module.hosting_$DEPLOY_ENV"
