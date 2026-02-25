# Image Node stable hébergée par Microsoft
FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye
WORKDIR /app

# On copie les fichiers de dépendances (on est déjà dans le dossier server)
COPY package*.json ./
RUN npm install --production

# On copie tout le contenu du dossier server vers /app
COPY . .

# On expose le port
EXPOSE 5000

# On lance le serveur
CMD ["node", "server.js"]