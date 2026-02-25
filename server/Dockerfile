# Image légère et stable pour la production
FROM node:20-slim

# On se place à la racine du projet dans le conteneur
WORKDIR /app

# 1. Copier les fichiers de dépendances du serveur
COPY server/package*.json ./server/
RUN cd server && npm install --production

# 2. Copier le reste du code (Server ET Client)
# Cela permet à server.js de trouver ../client
COPY . .

# 3. Exposer le port de l'API
EXPOSE 5000

# 4. Lancer le serveur depuis le bon dossier
CMD ["node", "server/server.js"]