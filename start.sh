#!/bin/bash
# ============================================
# RH Unlimitech Cloud — Startup Script
# ============================================
# Levanta MongoDB, Backend (9050) y Frontend (5173)
# Uso: sudo ./start.sh
# ============================================

echo "🚀 Iniciando RH Unlimitech Cloud..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio base
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. Iniciar MongoDB
echo -e "${BLUE}📦 Iniciando MongoDB...${NC}"
if mongosh --quiet --eval "db.runCommand({ping:1})" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ MongoDB ya estaba corriendo${NC}"
else
  sudo systemctl start mongod 2>/dev/null || sudo mongod --fork --logpath /var/log/mongod.log --dbpath /var/lib/mongodb 2>/dev/null
  sleep 2
  if mongosh --quiet --eval "db.runCommand({ping:1})" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB iniciado${NC}"
  else
    echo -e "${YELLOW}⚠️  No se pudo iniciar MongoDB. Inícialo manualmente.${NC}"
  fi
fi

echo ""

# 2. Iniciar Backend
echo -e "${BLUE}🔧 Iniciando Backend (puerto 9050)...${NC}"
cd "$BASE_DIR/backend"
npx ts-node --transpile-only src/server.ts &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend PID: $BACKEND_PID${NC}"

# Esperar a que el backend conecte a MongoDB
sleep 3

# 3. Iniciar Frontend
echo -e "${BLUE}🎨 Iniciando Frontend (puerto 5173)...${NC}"
cd "$BASE_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend PID: $FRONTEND_PID${NC}"

echo ""
echo "============================================"
echo -e "${GREEN}🚀 Servicios iniciados:${NC}"
echo "   MongoDB:       localhost:27017"
echo "   Backend:       http://localhost:9050"
echo "   Frontend:      http://localhost:5173"
echo "   Mongo Express: http://localhost:8081"
echo "   Swagger:       http://localhost:9050/api-docs"
echo ""
echo "   Credenciales:"
echo "   admin@unlimitech.cloud / Pass2014! (Founder)"
echo "   jhoann@unlimitech.cloud / Pass2014! (QA)"
echo "   talent@unlimitech.cloud / Pass2014! (HR)"
echo "   moises@unlimitech.cloud / Pass2014! (TAM)"
echo "============================================"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"

# Trap para matar procesos al salir
trap "echo ''; echo '🛑 Deteniendo servicios...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Esperar
wait
