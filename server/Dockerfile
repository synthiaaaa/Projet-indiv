# Image Node stable hébergée par Microsoft
FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/ .
EXPOSE 5000
CMD ["npm", "start"]