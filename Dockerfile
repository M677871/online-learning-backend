FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY src ./src
COPY scripts ./scripts

EXPOSE 3000

CMD ["sh", "-c", "node scripts/wait-for-db.js && node src/server.js"]
