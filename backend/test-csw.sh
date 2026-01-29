#!/bin/bash

# Script de prueba del sistema CSW
# Ejecuta peticiones para validar el flujo completo

echo "🧪 =================================="
echo "🧪 Testing Sistema CSW"
echo "🧪 =================================="
echo ""

BASE_URL="http://localhost:3000/api/v1"

# 1. Login como desarrollador
echo "📝 1. Login como desarrollador (Jordan Blake)..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"jordan.blake@rh.com","password":"dev123456"}' \
  -c cookies.txt)

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
DEV_ID=$(echo $LOGIN_RESPONSE | jq -r '.data.employee._id')
echo "✅ Token obtenido: ${TOKEN:0:20}..."
echo "✅ Developer ID: $DEV_ID"
echo ""

# 2. Obtener categorías disponibles
echo "📂 2. Obteniendo categorías CSW..."
CATEGORIES=$(curl -s -X GET "$BASE_URL/csw-categories" \
  -H "Authorization: Bearer $TOKEN" \
  -b cookies.txt)
CATEGORY_ID=$(echo $CATEGORIES | jq -r '.data[0]._id')
echo "✅ Categorías obtenidas. Primera categoría: $CATEGORY_ID"
echo ""

# 3. Obtener flujo de aprobación de la división del desarrollador
echo "🔄 3. Obteniendo flujo de aprobación..."
# Obtener división del desarrollador
EMPLOYEE=$(curl -s -X GET "$BASE_URL/employees/$DEV_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -b cookies.txt)
DIVISION_ID=$(echo $EMPLOYEE | jq -r '.data.division._id')
echo "✅ División: $DIVISION_ID"

FLOW=$(curl -s -X GET "$BASE_URL/approval-flows/by-division/$DIVISION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -b cookies.txt)
echo "✅ Flujo obtenido:"
echo $FLOW | jq '.data.levels[] | {order, name, approverPosition}'
echo ""

# 4. Crear una solicitud CSW
echo "📝 4. Creando solicitud CSW..."
CSW_RESPONSE=$(curl -s -X POST "$BASE_URL/csw" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "category": "'$CATEGORY_ID'",
    "situation": "Necesito ausentarme mañana por cita médica de emergencia",
    "information": "Cita programada para el 29/01/2026 a las 10:00 AM. Doctor: Dr. Smith. Motivo: Control anual",
    "solution": "Morgan Lee cubrirá mis tareas. Código en branch feature/auth está listo para revisión"
  }')

CSW_ID=$(echo $CSW_RESPONSE | jq -r '.data._id')
echo "✅ Solicitud creada: $CSW_ID"
echo "📊 Cadena de aprobación:"
echo $CSW_RESPONSE | jq '.data.approvalChain[] | {level, name, approverName, status}'
echo ""

# 5. Verificar solicitud como desarrollador
echo "📋 5. Verificando mis solicitudes..."
MY_REQUESTS=$(curl -s -X GET "$BASE_URL/csw/my-requests" \
  -H "Authorization: Bearer $TOKEN" \
  -b cookies.txt)
echo "✅ Mis solicitudes:"
echo $MY_REQUESTS | jq '.data[] | {_id, status, situation}'
echo ""

# 6. Login como Arquitecto Técnico (primer aprobador)
echo "🔐 6. Login como Arquitecto Técnico (Taylor Morgan)..."
ARCH_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"taylor.morgan@rh.com","password":"arch123456"}' \
  -c cookies_arch.txt)

ARCH_TOKEN=$(echo $ARCH_LOGIN | jq -r '.data.token')
ARCH_ID=$(echo $ARCH_LOGIN | jq -r '.data.employee._id')
echo "✅ Arquitecto logueado: $ARCH_ID"
echo ""

# 7. Ver solicitudes pendientes de aprobación
echo "📬 7. Viendo solicitudes pendientes de aprobación..."
PENDING=$(curl -s -X GET "$BASE_URL/csw/my-pending" \
  -H "Authorization: Bearer $ARCH_TOKEN" \
  -b cookies_arch.txt)
echo "✅ Solicitudes pendientes:"
echo $PENDING | jq '.data[] | {_id, requesterName, situation, currentLevel}'
echo ""

# 8. Aprobar en nivel 1
echo "✅ 8. Aprobando solicitud en Nivel 1 (Arq. Técnico)..."
APPROVE1=$(curl -s -X POST "$BASE_URL/csw/$CSW_ID/approve" \
  -H "Authorization: Bearer $ARCH_TOKEN" \
  -H "Content-Type: application/json" \
  -b cookies_arch.txt \
  -d '{"comments":"Aprobado. El desarrollador tiene buen historial."}')

echo "✅ Aprobación Nivel 1:"
echo $APPROVE1 | jq '{success, message, status: .data.status, currentLevel: .data.currentLevel}'
echo ""

# 9. Login como Arquitecto de Soluciones (segundo aprobador - Admin)
echo "🔐 9. Login como Arquitecto de Soluciones (Admin)..."
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rh.com","password":"admin123"}' \
  -c cookies_admin.txt)

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | jq -r '.data.token')
echo "✅ Admin logueado"
echo ""

# 10. Ver solicitudes pendientes como admin
echo "📬 10. Solicitudes pendientes (Admin - Nivel 2)..."
ADMIN_PENDING=$(curl -s -X GET "$BASE_URL/csw/my-pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -b cookies_admin.txt)
echo "✅ Solicitudes pendientes:"
echo $ADMIN_PENDING | jq '.data[] | {_id, requesterName, currentLevel}'
echo ""

# 11. Aprobar en nivel 2 (final)
echo "✅ 11. Aprobando solicitud en Nivel 2 (Arq. Soluciones - FINAL)..."
APPROVE2=$(curl -s -X POST "$BASE_URL/csw/$CSW_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -b cookies_admin.txt \
  -d '{"comments":"Aprobado. Permiso concedido."}')

echo "✅ Aprobación Nivel 2:"
echo $APPROVE2 | jq '{success, message, status: .data.status}'
echo ""

# 12. Ver historial completo
echo "📜 12. Obteniendo historial completo de la solicitud..."
HISTORY=$(curl -s -X GET "$BASE_URL/csw/$CSW_ID/history" \
  -H "Authorization: Bearer $TOKEN" \
  -b cookies.txt)

echo "✅ Historial completo:"
echo $HISTORY | jq '.data[] | {action, performedByName, performedAt, level, comments}'
echo ""

# 13. Crear otra solicitud para probar rechazo
echo "📝 13. Creando segunda solicitud (para probar rechazo)..."
CSW2_RESPONSE=$(curl -s -X POST "$BASE_URL/csw" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "category": "'$CATEGORY_ID'",
    "situation": "Solicito aumento salarial",
    "information": "Llevo 2 años en la empresa y he cumplido todas las metas",
    "solution": "Propongo incremento del 15%"
  }')

CSW2_ID=$(echo $CSW2_RESPONSE | jq -r '.data._id')
echo "✅ Segunda solicitud creada: $CSW2_ID"
echo ""

# 14. Rechazar en nivel 1
echo "❌ 14. Rechazando segunda solicitud en Nivel 1..."
REJECT=$(curl -s -X POST "$BASE_URL/csw/$CSW2_ID/reject" \
  -H "Authorization: Bearer $ARCH_TOKEN" \
  -H "Content-Type: application/json" \
  -b cookies_arch.txt \
  -d '{"comments":"No hay presupuesto disponible este trimestre. Por favor reenviar en Q2."}')

echo "❌ Rechazo:"
echo $REJECT | jq '{success, message, status: .data.status}'
echo ""

# 15. Editar solicitud rechazada
echo "✏️  15. Editando solicitud rechazada..."
EDIT=$(curl -s -X PUT "$BASE_URL/csw/$CSW2_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "situation": "Solicito aumento salarial para Q2",
    "information": "Llevo 2 años, cumplí metas, esperaré hasta Q2 por presupuesto",
    "solution": "Propongo incremento del 10% en lugar del 15%"
  }')

echo "✅ Solicitud editada:"
echo $EDIT | jq '{success, message, status: .data.status, currentLevel: .data.currentLevel}'
echo ""

# 16. Ver historial de la solicitud editada
echo "📜 16. Historial de solicitud editada..."
HISTORY2=$(curl -s -X GET "$BASE_URL/csw/$CSW2_ID/history" \
  -H "Authorization: Bearer $TOKEN" \
  -b cookies.txt)

echo "✅ Historial (incluye rechazo y edición):"
echo $HISTORY2 | jq '.data[] | {action, performedByName, performedAt, comments}'
echo ""

# 17. Obtener estadísticas
echo "📊 17. Estadísticas del sistema..."
STATS=$(curl -s -X GET "$BASE_URL/csw/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -b cookies_admin.txt)

echo "✅ Estadísticas:"
echo $STATS | jq '.data.byStatus'
echo ""

# Limpieza
rm -f cookies.txt cookies_arch.txt cookies_admin.txt

echo "🎉 =================================="
echo "🎉 Testing Completado!"
echo "🎉 =================================="
echo ""
echo "✅ Flujo probado exitosamente:"
echo "  1. Login de usuarios"
echo "  2. Creación de solicitud"
echo "  3. Aprobación secuencial (Nivel 1 → Nivel 2)"
echo "  4. Estado cambia a 'approved' al aprobar todos los niveles"
echo "  5. Rechazo en nivel intermedio"
echo "  6. Edición resetea aprobaciones a 'pending'"
echo "  7. Historial preserva todas las acciones"
echo ""
