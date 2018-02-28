#!/bin/bash

# https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/#install-using-the-convenience-script
curl -fsSL get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# https://docs.docker.com/compose/install/
sudo curl -L https://github.com/docker/compose/releases/download/1.19.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Allow our main user to run Docker commands
sudo usermod -aG docker ubuntu

# Check out codebase
git clone https://github.com/marjakapyaho/nightbear.git
cd nightbear/server
git checkout add-server-setup

# Launch services
docker-compose up -d
