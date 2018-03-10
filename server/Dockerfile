# https://registry.hub.docker.com/_/node/
FROM node:8.7

# Create workspace
RUN mkdir -p /app
WORKDIR /app

# Install npm deps (takes long)
COPY package.json /app/
RUN npm install

# Install our own sources (doesn't take long)
COPY . /app/

# Configure container
EXPOSE 3000
ENTRYPOINT ["npm", "run"]
CMD ["start"]
