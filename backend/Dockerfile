# ─── Backend Dockerfile ───────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Puerto
EXPOSE 9050

# Comando de inicio (desarrollo con hot-reload)
CMD ["npx", "ts-node", "--transpile-only", "src/server.ts"]
