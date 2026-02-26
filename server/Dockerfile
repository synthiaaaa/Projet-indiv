# Image officielle légère
FROM node:20-alpine

# Répertoire de travail
WORKDIR /app

# Copier dépendances
COPY package*.json ./

# Installation propre et déterministe
RUN npm ci --only=production

# Copier le code
COPY . .

# Exposer le bon port
EXPOSE 5000

# Sécurité : utilisateur non-root
USER node

# Lancer l'application
CMD ["node", "src/server.js"]