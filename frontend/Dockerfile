# ─── Frontend Dockerfile ──────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Puerto de Vite dev server
EXPOSE 5173

# Comando de inicio (desarrollo con HMR)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
