# Image légère pour la sécurité et les performances
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/ .
EXPOSE 5000
CMD ["npm", "start"]