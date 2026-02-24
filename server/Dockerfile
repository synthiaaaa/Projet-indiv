# Image légère pour la sécurité et les performances
# Remplace FROM node:20-alpine par :
FROM mcr.microsoft.com/mirror/docker/library/node:20-alpine
# Utilisation du miroir Microsoft pour éviter le blocage Docker Hub
FROM mcr.microsoft.com/mirror/docker/library/node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/ .
EXPOSE 5000
CMD ["npm", "start"]