FROM node:20-slim

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN chown -R appuser:appgroup /app

EXPOSE 5000
USER appuser

CMD ["node", "src/server.js"]
