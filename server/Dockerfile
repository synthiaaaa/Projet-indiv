FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN chown -R appuser:appgroup /app

EXPOSE 5000
USER appuser

CMD ["node", "src/server.js"]
