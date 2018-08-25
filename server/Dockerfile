# https://registry.hub.docker.com/_/node/
FROM node:8.10

# Create workspace
RUN mkdir -p /app
WORKDIR /app

# Install npm deps (takes long)
COPY nightbear/package.json /app/
COPY nightbear/package-lock.json /app/
RUN npm install

# Install our own sources (doesn't take long)
COPY nightbear/server /app/server

# Configure container
EXPOSE 3000
ENTRYPOINT ["npm", "run"]
CMD ["server-start"]
