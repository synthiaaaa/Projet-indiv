# Image Node stable hébergée par Microsoft
FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

WORKDIR /app

# Comme le contexte est déjà ./server, on copie les fichiers locaux directement
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 5000
CMD ["npm", "start"]