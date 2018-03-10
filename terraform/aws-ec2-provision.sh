#!/bin/bash

# https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/#install-using-the-convenience-script
curl -fsSL get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# https://docs.docker.com/compose/install/
sudo curl -L https://github.com/docker/compose/releases/download/1.19.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Check out codebase
git clone https://github.com/marjakapyaho/nightbear.git

# Display update note
echo -e "\n\n\nIMPORTANT: After provisioning, you still need to run the update script to get the node to a working condition."
echo -e "           The first run of the update script will complete quickly but certificate requests may take a while,"
echo -e "           during which the services won't respond normally. Just give it about 5 minutes.\n\n\n"
