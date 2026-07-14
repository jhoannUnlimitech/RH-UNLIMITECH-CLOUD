# ✅ Sprint CSW (Change Management) - COMPLETADO

## 📋 Resumen del Sprint

Se implementó el módulo completo de **Change Management (CSW)** con sistema de aprobación de cambios organizacionales.

---

## 🎯 Features Implementados

### 1. Modelo CSW (Change Management)
**Archivo**: `backend/src/models/CSW.ts`

**Campos principales**:
- `title`: Título del cambio (5-200 caracteres)
- `description`: Descripción detallada (mínimo 20 caracteres)
- `reason`: Razón del cambio (mínimo 10 caracteres)
- `requester`: Empleado solicitante (referencia)
- `approver`: Empleado que aprueba/rechaza (referencia)
- `implementer`: Empleado que implementa (referencia)

**Estados del workflow**:
- `pending`: Pendiente de aprobación
- `approved`: Aprobado
- `rejected`: Rechazado
- `implemented`: Implementado
- `cancelled`: Cancelado

**Clasificación**:
- **Priority**: `low` | `medium` | `high` | `critical`
- **Impact**: `low` | `medium` | `high` | `critical`
- **Category**: `Infrastructure`, `Software`, `Hardware`, `Security`, `Network`, `Database`, `Application`, `Other`

**Campos adicionales**:
- `estimatedDate`: Fecha estimada de implementación
- `implementedDate`: Fecha real de implementación
- `approvalDate` / `rejectionDate`: Fechas de decisión
- `affectedSystems[]`: Lista de sistemas afectados
- `rollbackPlan`: Plan de rollback
- `approvalNotes` / `implementationNotes`: Notas del proceso

**Métodos del modelo**:
- `approve(approverId, notes)`: Aprobar CSW
- `reject(approverId, notes)`: Rechazar CSW (notas obligatorias)
- `implement(implementerId, notes)`: Marcar como implementado
- `cancel(notes)`: Cancelar CSW

---

### 2. Controlador CSW
**Archivo**: `backend/src/controllers/csw.controller.ts`

**Endpoints implementados**:

1. **GET /api/v1/csw/stats**
   - Estadísticas de CSW
   - Total, por estado, prioridad, impacto
   - Aprobados/implementados últimos 30 días

2. **GET /api/v1/csw**
   - Listar CSW con paginación
   - Filtros: status, priority, impact, requester, category
   - Búsqueda: título y descripción
   - Ordenados por fecha de creación (desc)

3. **GET /api/v1/csw/:id**
   - Obtener CSW por ID
   - Incluye información completa de requester, approver, implementer

4. **POST /api/v1/csw**
   - Crear nuevo CSW
   - El requester es automáticamente el usuario autenticado
   - Estado inicial: `pending`

5. **PUT /api/v1/csw/:id**
   - Actualizar CSW
   - Solo el creador puede editar
   - Solo si está en estado `pending`

6. **POST /api/v1/csw/:id/approve**
   - Aprobar CSW pendiente
   - Requiere permiso `csw:approve`
   - Actualiza approver y fecha de aprobación

7. **POST /api/v1/csw/:id/reject**
   - Rechazar CSW pendiente
   - Notas obligatorias
   - Requiere permiso `csw:approve`

8. **POST /api/v1/csw/:id/implement**
   - Marcar CSW como implementado
   - Solo CSW aprobados
   - Registra implementer y fecha

9. **POST /api/v1/csw/:id/cancel**
   - Cancelar CSW
   - Solo el creador puede cancelar
   - No se puede cancelar si ya está implementado

10. **DELETE /api/v1/csw/:id**
    - Soft delete de CSW
    - Requiere permiso `csw:delete`

---

### 3. Rutas con Swagger
**Archivo**: `backend/src/routes/csw.routes.ts`

**Características**:
- ✅ Documentación completa OpenAPI 3.0
- ✅ Todos los endpoints con ejemplos
- ✅ Esquemas de request/response detallados
- ✅ Descripción del flujo de aprobación
- ✅ Seguridad: `bearerAuth` + `cookieAuth`
- ✅ Validaciones de permisos

**Permisos requeridos**:
- `csw:read` - Ver CSW
- `csw:create` - Crear CSW
- `csw:update` - Actualizar/implementar CSW
- `csw:approve` - Aprobar/rechazar CSW
- `csw:delete` - Eliminar CSW

---

## 📊 Base de Datos Actualizada

**Seed actualizado** (`backend/src/scripts/seed.ts`):
- ✅ 21 permisos (incluye 5 de CSW)
- ✅ Permisos asignados a roles apropiados
- ✅ Admin tiene acceso completo a CSW

**Permisos CSW creados**:
1. `csw:read` - Asignado a todos los roles
2. `csw:create` - Asignado a todos los roles
3. `csw:update` - Asignado a roles técnicos y admin
4. `csw:approve` - Asignado solo a admin y arquitectos
5. `csw:delete` - Asignado solo a admin

---

## 🧪 Testing en Swagger

**URL**: http://localhost:3000/api-docs

### Flujo de testing completo:

**1. Autenticación**:
```bash
POST /api/v1/auth/login
{
  "email": "admin@rh.com",
  "password": "admin123"
}
```
- Copiar token de `data.debug.token`
- Click "Authorize" → Pegar token en bearerAuth

**2. Crear CSW**:
```bash
POST /api/v1/csw
{
  "title": "Actualización de servidor de base de datos",
  "description": "Se requiere actualizar PostgreSQL 13 a 15 para mejorar rendimiento",
  "reason": "Versión actual tiene vulnerabilidades",
  "priority": "high",
  "impact": "high",
  "category": "Database",
  "estimatedDate": "2026-02-15T10:00:00.000Z",
  "affectedSystems": ["PostgreSQL Primary", "API Backend"],
  "rollbackPlan": "Restaurar snapshot previo"
}
```

**3. Ver CSW creado**:
```bash
GET /api/v1/csw
```

**4. Aprobar CSW**:
```bash
POST /api/v1/csw/{id}/approve
{
  "notes": "Aprobado para ventana de mantenimiento"
}
```

**5. Implementar CSW**:
```bash
POST /api/v1/csw/{id}/implement
{
  "notes": "Implementación exitosa sin incidencias"
}
```

**6. Ver estadísticas**:
```bash
GET /api/v1/csw/stats
```

---

## 🔧 Archivos Creados/Modificados

### Nuevos archivos:
1. `backend/src/models/CSW.ts` (254 líneas)
2. `backend/src/controllers/csw.controller.ts` (459 líneas)
3. `backend/src/routes/csw.routes.ts` (451 líneas)

### Archivos modificados:
1. `backend/src/routes/index.ts` - Registrar rutas CSW
2. `backend/src/server.ts` - Import modelo CSW
3. `backend/src/scripts/seed.ts` - Agregar permiso csw:delete
4. `backend/src/config/swagger.ts` - Tag CSW actualizado

---

## ✅ Validaciones del Sistema

**Reglas de negocio implementadas**:

1. ✅ Solo el creador puede editar un CSW
2. ✅ Solo se pueden editar CSW en estado `pending`
3. ✅ Solo se pueden aprobar/rechazar CSW en estado `pending`
4. ✅ Solo se pueden implementar CSW `approved`
5. ✅ No se puede cancelar un CSW `implemented`
6. ✅ Las notas de rechazo son obligatorias
7. ✅ Soft delete automático (no se eliminan físicamente)
8. ✅ Requester se asigna automáticamente al crear
9. ✅ Approver e implementer se registran en cada acción
10. ✅ Fechas se registran automáticamente

**Validaciones de campos**:
- ✅ Título: 5-200 caracteres
- ✅ Descripción: mínimo 20 caracteres
- ✅ Razón: mínimo 10 caracteres
- ✅ Priority y Impact: enums validados
- ✅ Category: lista predefinida
- ✅ Referencias a Employee validadas

---

## 📈 Estadísticas Disponibles

El endpoint `/api/v1/csw/stats` retorna:

```json
{
  "status": "success",
  "data": {
    "total": 45,
    "byStatus": {
      "pending": 10,
      "approved": 15,
      "implemented": 18,
      "rejected": 2
    },
    "byPriority": {
      "low": 5,
      "medium": 25,
      "high": 12,
      "critical": 3
    },
    "byImpact": {
      "low": 8,
      "medium": 27,
      "high": 8,
      "critical": 2
    },
    "last30Days": {
      "approved": 8,
      "implemented": 12
    }
  }
}
```

---

## 🎓 Workflow CSW

```
┌─────────────┐
│   PENDING   │ ◄── Crear CSW (cualquier usuario con permiso)
└──────┬──────┘
       │
       ├──► APPROVED (con csw:approve)
       │      │
       │      └──► IMPLEMENTED (con csw:update)
       │
       ├──► REJECTED (con csw:approve, notas obligatorias)
       │
       └──► CANCELLED (solo creador, si no está implementado)
```

---

## 🚀 Próximos Pasos

El módulo CSW está **100% funcional** y listo para uso.

**Siguiente sprint**: Módulo de Training (Capacitaciones)
- Modelo Training con cursos y asistencia
- Inscripción y tracking de empleados
- Certificados y completitud
- Reportes de capacitación

---

## 💡 Notas Técnicas

- **Soft Delete**: Todos los CSW tienen soft delete para auditoría
- **Índices**: Optimizado para consultas por status, priority, requester, fecha
- **Populación**: Referencias a empleados se populan automáticamente
- **Permisos**: Sistema granular de autorización
- **Timestamps**: createdAt y updatedAt automáticos
- **Validación**: Mongoose validations + business rules

---

## 📝 Credenciales de Prueba

```
Admin (acceso completo):
📧 admin@rh.com | admin123

Arquitectos (pueden aprobar):
📧 taylor.morgan@rh.com | arch123456
📧 skyler.chen@rh.com | arch123456

Otros usuarios (pueden crear y actualizar):
📧 jordan.blake@rh.com | dev123456
📧 casey.johnson@rh.com | dev123456
📧 alex.rivera@rh.com | qa123456
```

---

## ✅ Sprint Completado

- ✅ Modelo CSW implementado
- ✅ Controlador con 10 endpoints
- ✅ Rutas documentadas en Swagger
- ✅ Permisos configurados
- ✅ Seed actualizado
- ✅ Servidor corriendo sin errores
- ✅ Testing funcional completado

**Estado**: ✅ **LISTO PARA PRODUCCIÓN**
