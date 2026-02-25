# Image Node stable hébergée par Microsoft
FROM mcr.microsoft.com/devcontainers/javascript-node:1-20-bullseye

# Répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier le reste du code
COPY . .

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["node", "src/server.js"]