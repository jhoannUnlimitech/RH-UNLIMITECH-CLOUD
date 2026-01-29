#!/bin/bash

# Script para iniciar MongoDB en WSL
# Ejecutar con: bash scripts/start-mongo.sh

echo "🔍 Verificando si MongoDB está instalado..."

if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB no está instalado en WSL"
    echo ""
    echo "📥 Instalando MongoDB..."
    
    # Importar clave pública de MongoDB
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
    
    # Agregar repositorio de MongoDB
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Actualizar e instalar
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    
    echo "✅ MongoDB instalado"
fi

echo ""
echo "🚀 Iniciando MongoDB..."

# Crear directorio de datos si no existe
sudo mkdir -p /data/db
sudo chown -R $(whoami) /data/db

# Iniciar MongoDB
sudo service mongod start

# Verificar estado
sleep 2
if sudo service mongod status | grep -q "running"; then
    echo "✅ MongoDB iniciado exitosamente"
    echo ""
    echo "📊 Conexión: mongodb://localhost:27017"
    echo "🔧 Para detener: sudo service mongod stop"
else
    echo "❌ Error al iniciar MongoDB"
    echo ""
    echo "💡 Intenta manualmente:"
    echo "   sudo service mongod start"
fi
