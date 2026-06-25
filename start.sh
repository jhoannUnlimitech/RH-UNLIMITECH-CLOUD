#!/bin/bash
# ============================================
# RH Unlimitech Cloud — Startup Script
# ============================================
# Levanta backend (puerto 9050) y frontend (puerto 5173)
# Uso: ./start.sh
# ============================================

echo "🚀 Iniciando RH Unlimitech Cloud..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio base
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

# Verificar que MongoDB esté corriendo
echo -e "${BLUE}📦 Verificando MongoDB...${NC}"
if mongosh --quiet --eval "db.runCommand({ping:1})" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ MongoDB corriendo${NC}"
else
  echo "⚠️  MongoDB no detectado. Asegúrate de que esté corriendo en localhost:27017"
fi

echo ""

# Iniciar Backend
echo -e "${BLUE}🔧 Iniciando Backend (puerto 9050)...${NC}"
cd "$BASE_DIR/backend"
npx ts-node --transpile-only src/server.ts &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend PID: $BACKEND_PID${NC}"

# Esperar un momento para que el backend inicie
sleep 3

# Iniciar Frontend
echo -e "${BLUE}🎨 Iniciando Frontend (puerto 5173)...${NC}"
cd "$BASE_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend PID: $FRONTEND_PID${NC}"

echo ""
echo "============================================"
echo -e "${GREEN}🚀 Servicios iniciados:${NC}"
echo "   Backend:       http://localhost:9050"
echo "   Frontend:      http://localhost:5173"
echo "   Mongo Express: http://localhost:8081"
echo "   Swagger:       http://localhost:9050/api-docs"
echo ""
echo "   Credenciales:"
echo "   admin@unlimitech.cloud / Pass2014!"
echo "   jhoann@unlimitech.cloud / Pass2014!"
echo "   talent@unlimitech.cloud / Pass2014!"
echo "============================================"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"

# Trap para matar ambos procesos al salir
trap "echo ''; echo '🛑 Deteniendo servicios...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Esperar
wait
