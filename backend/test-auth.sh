#!/bin/bash

# Script para probar la autenticación en Swagger

echo "🧪 Probando autenticación de la API"
echo ""

# 1. Login
echo "1️⃣ Haciendo LOGIN..."
LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rh.com","password":"admin123"}')

echo "$LOGIN_RESPONSE" | jq '.'
echo ""

# Verificar si hay cookie
if [ -f cookies.txt ]; then
  echo "✅ Archivo de cookies creado"
  echo "📋 Contenido de cookies:"
  cat cookies.txt
  echo ""
else
  echo "❌ No se creó el archivo de cookies"
  exit 1
fi

# 2. Probar endpoint protegido
echo ""
echo "2️⃣ Probando endpoint protegido (debug/token)..."
DEBUG_RESPONSE=$(curl -s -b cookies.txt http://localhost:3000/api/v1/auth/debug/token)

echo "$DEBUG_RESPONSE" | jq '.'
echo ""

# 3. Probar otro endpoint protegido
echo ""
echo "3️⃣ Probando GET /employees..."
EMPLOYEES_RESPONSE=$(curl -s -b cookies.txt http://localhost:3000/api/v1/employees)

echo "$EMPLOYEES_RESPONSE" | jq '.data.employees | length'
echo ""

# Limpiar
rm -f cookies.txt

echo "✅ Pruebas completadas"
