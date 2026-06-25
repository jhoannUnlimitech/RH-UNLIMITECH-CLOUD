#!/bin/bash

# =============================================================
# RH Unlimitech Cloud — Script de inicio completo
# Levanta Docker (MongoDB), Backend y Frontend
# =============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "🚀 Iniciando RH Unlimitech Cloud..."
echo "📁 Directorio: $PROJECT_DIR"
echo ""

# 1. Docker (MongoDB + Mongo Express)
echo "🐳 Levantando Docker..."
cd "$PROJECT_DIR"
docker compose up -d
echo "✅ MongoDB: localhost:27017"
echo "✅ Mongo Express: http://localhost:8081"
echo ""

# 2. Backend
echo "🔧 Iniciando Backend..."
cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ]; then
  echo "   📦 Instalando dependencias backend..."
  npm install
fi
npm run dev &
BACKEND_PID=$!
echo "✅ Backend: http://localhost:9050 (PID: $BACKEND_PID)"
echo ""

# 3. Frontend
echo "🎨 Iniciando Frontend..."
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo "   📦 Instalando dependencias frontend..."
  npm install
fi
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
echo ""

# Resumen
echo "==========================================================="
echo "🎉 Todos los servicios corriendo:"
echo "   🐳 MongoDB:       localhost:27017"
echo "   📊 Mongo Express: http://localhost:8081"
echo "   🔧 Backend API:   http://localhost:9050"
echo "   📚 Swagger:       http://localhost:9050/api-docs"
echo "   🎨 Frontend:      http://localhost:5173"
echo ""
echo "   Para detener: Ctrl+C"
echo "==========================================================="

# Esperar a que se cierre con Ctrl+C
trap "echo ''; echo '🛑 Deteniendo servicios...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker compose down; echo '✅ Servicios detenidos.'" EXIT
wait
