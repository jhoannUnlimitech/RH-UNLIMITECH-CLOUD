# 📋 Arquitectura del Sistema CSW - Flujos de Aprobación Configurables

## 🎯 Objetivo

Implementar un sistema flexible de solicitudes CSW (Canal de Solicitudes de Trabajo) donde **cada división tiene su propio flujo de aprobación personalizado** con niveles y aprobadores específicos.

---

## 🏗️ Arquitectura de Modelos

### 1. ApprovalFlow (Flujo de Aprobación)

Define el flujo completo de aprobación para una división específica.

```typescript
{
  _id: ObjectId,
  divisionId: ObjectId,              // División a la que pertenece este flujo
  name: string,                      // Nombre descriptivo (ej: "Flujo Tecnología")
  description: string,               // Descripción del flujo
  levels: [                          // Array de niveles ordenados
    {
      order: number,                 // Orden del nivel (1, 2, 3, ...)
      name: string,                  // Nombre del nivel (ej: "Tech Lead")
      approverType: 'role' | 'user', // Tipo de aprobador
      approverRoleId?: ObjectId,     // Si es 'role', el ID del rol
      approverUserId?: ObjectId,     // Si es 'user', el ID del usuario específico
      required: boolean,             // Si es obligatorio o puede saltarse
      autoApprove: boolean           // Si se auto-aprueba bajo ciertas condiciones
    }
  ],
  active: boolean,                   // Si está activo
  isDefault: boolean,                // Si es el flujo por defecto para nuevas divisiones
  createdAt: Date,
  updatedAt: Date
}
```

### 2. CSW (Solicitud)

La solicitud que usa el flujo de su división.

```typescript
{
  _id: ObjectId,
  
  // Campos de la solicitud (máx 200 palabras cada uno)
  situation: string,          // "¿Qué sucede?"
  information: string,        // "¿Qué datos tienes?"
  solution: string,           // "¿Cómo se resuelve?"
  
  // Solicitante
  requester: ObjectId,        // Employee ID
  requesterName: string,      // Desnormalizado
  requesterPosition: string,  // Cargo
  requesterDivision: ObjectId,// División (determina el flujo)
  
  // Categoría
  category: ObjectId,         // CSWCategory (Permiso, Aumento, etc.)
  
  // Flujo de aprobación (copia del flujo al crear)
  approvalFlowId: ObjectId,   // Referencia al flujo usado
  approvalChain: [            // Copia del flujo para este CSW específico
    {
      level: number,
      name: string,
      approverId: ObjectId,   // Usuario que debe aprobar
      approverName: string,
      approverPosition: string,
      status: 'pending' | 'approved' | 'rejected',
      approvedAt?: Date,
      comments?: string       // Máx 200 palabras
    }
  ],
  
  // Estado
  status: 'pending' | 'approved' | 'rejected' | 'cancelled',
  currentLevel: number,       // Nivel actual esperando aprobación
  
  // Historial completo
  history: [
    {
      action: string,         // 'created', 'edited', 'approved', 'rejected', 'cancelled'
      performedBy: ObjectId,
      performedByName: string,
      performedAt: Date,
      level?: number,
      previousStatus?: string,
      newStatus?: string,
      comments?: string
    }
  ],
  
  createdAt: Date,
  updatedAt: Date,
  deleted: boolean
}
```

### 3. CSWCategory (Categorías)

Categorías configurables de solicitudes.

```typescript
{
  _id: ObjectId,
  name: string,               // "Permiso", "Aumento", "Incapacidad", etc.
  description: string,
  active: boolean,
  order: number,              // Para ordenar en el combobox
  requiresAttachment: boolean,// Si requiere adjuntar documento
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Flujo de Funcionamiento

### Fase 1: Configuración de Flujos

**Administrador configura flujos por división:**

```
División 1 (Administrativo):
  Nivel 1: Talento Humano (rol)
  Nivel 2: CEO (usuario específico)

División 4 (Tecnología):
  Nivel 1: Tech Lead (rol)
  Nivel 2: Arquitecto Técnico (rol)
  Nivel 3: Arquitecto de Soluciones (rol)

División 10 (Datos):
  Nivel 1: Arquitecto Técnico (rol)
  Nivel 2: Arquitecto de Soluciones (rol)
```

### Fase 2: Creación de Solicitud

1. **Usuario selecciona categoría** (combobox con categorías activas)
2. **Sistema captura división del usuario** automáticamente
3. **Sistema busca el flujo de aprobación** de esa división
4. **Usuario completa los 3 campos** (situación, información, solución)
5. **Sistema crea el CSW** y genera la cadena de aprobación:

```javascript
// Ejemplo: Desarrollador de División 4 solicita permiso

// 1. Obtener flujo de la división
const flow = await ApprovalFlow.findOne({ 
  divisionId: empleado.division,
  active: true 
});

// 2. Generar cadena de aprobación
const chain = [];
for (const level of flow.levels) {
  if (level.approverType === 'role') {
    // Buscar usuario con ese rol en la división (o superior jerárquico)
    const approver = await findApproverByRole(level.approverRoleId, empleado);
    chain.push({
      level: level.order,
      name: level.name,
      approverId: approver._id,
      approverName: approver.name,
      status: 'pending'
    });
  } else if (level.approverType === 'user') {
    // Usuario específico
    const approver = await Employee.findById(level.approverUserId);
    chain.push({
      level: level.order,
      name: level.name,
      approverId: approver._id,
      approverName: approver.name,
      status: 'pending'
    });
  }
}

csw.approvalChain = chain;
csw.currentLevel = 1;
```

### Fase 3: Proceso de Aprobación

**Aprobación secuencial por niveles:**

```
[Desarrollador] → Crea solicitud
    ↓
[Nivel 1: Tech Lead] → Aprueba/Rechaza
    ↓ (si aprueba)
[Nivel 2: Arq. Técnico] → Aprueba/Rechaza
    ↓ (si aprueba)
[Nivel 3: Arq. Soluciones] → Aprueba/Rechaza
    ↓ (si aprueba)
[APROBADO ✅]
```

**Si algún nivel rechaza:**
- Estado general → `rejected`
- Se mantiene historial completo
- Usuario puede editar y volver a enviar
- Al editar: todos los niveles vuelven a `pending`

### Fase 4: Edición y Re-envío

```javascript
// Usuario edita CSW rechazado
csw.situation = "Nueva situación actualizada";
csw.information = "Información corregida";
csw.solution = "Solución mejorada";

// Resetear aprobaciones
csw.approvalChain.forEach(approval => {
  approval.status = 'pending';
  approval.approvedAt = undefined;
  approval.comments = undefined;
});

csw.status = 'pending';
csw.currentLevel = 1;

// Mantener historial
csw.history.push({
  action: 'edited',
  performedBy: userId,
  performedByName: userName,
  performedAt: new Date(),
  comments: 'CSW editado y reenviado para aprobación'
});
```

---

## 🎨 Componentes de UI (Frontend)

### 1. Gestión de Flujos (Admin)

**Pantalla:** `/admin/approval-flows`

**Funcionalidades:**
- Listar flujos por división
- Crear nuevo flujo
- Editar flujo existente
- Activar/desactivar flujos
- Previsualizar flujo

**Interfaz:**
```
┌─────────────────────────────────────────────────────┐
│ Flujos de Aprobación                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [+ Nuevo Flujo]                    [Filtrar: ▼]   │
│                                                     │
│  División 1 - Administrativo              [Editar] │
│  └─ Nivel 1: Talento Humano (rol)                  │
│  └─ Nivel 2: CEO (John Doe)                        │
│                                                     │
│  División 4 - Tecnología                  [Editar] │
│  └─ Nivel 1: Tech Lead (rol)                       │
│  └─ Nivel 2: Arquitecto Técnico (rol)              │
│  └─ Nivel 3: Arquitecto Soluciones (rol)           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2. Crear Solicitud CSW

**Pantalla:** `/csw/nueva`

**Flujo:**
```
┌─────────────────────────────────────────────────────┐
│ Nueva Solicitud CSW                                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Categoría: [Permiso ▼]                            │
│             Permiso                                 │
│             Aumento                                 │
│             Incapacidad                             │
│             Otros                                   │
│                                                     │
│  División: Tecnología (automático)                 │
│  Flujo de aprobación:                              │
│    → Tech Lead                                      │
│    → Arquitecto Técnico                             │
│    → Arquitecto de Soluciones                       │
│                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                     │
│  Situación: (¿Qué sucede?)                         │
│  ┌─────────────────────────────────────────────┐   │
│  │ Me siento enfermo y necesito ausentarme    │   │
│  │ el día de mañana para ir al médico        │   │
│  └─────────────────────────────────────────────┘   │
│  35/200 palabras                                   │
│                                                     │
│  Información: (¿Qué datos tienes?)                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ Cita médica: 28/01/2026 - 10:00 AM        │   │
│  │ Duración estimada: medio día               │   │
│  └─────────────────────────────────────────────┘   │
│  28/200 palabras                                   │
│                                                     │
│  Solución: (¿Cómo se resuelve?)                    │
│  ┌─────────────────────────────────────────────┐   │
│  │ Mi compañero Juan cubrirá mis tareas.     │   │
│  │ Código en branch feature/auth listo.      │   │
│  └─────────────────────────────────────────────┘   │
│  18/200 palabras                                   │
│                                                     │
│              [Cancelar]  [Enviar Solicitud]        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3. Vista de Aprobación

**Pantalla:** `/csw/aprobar/:id`

```
┌─────────────────────────────────────────────────────┐
│ Solicitud CSW #12345                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Estado: Pendiente (Nivel 2 de 3)                  │
│  Categoría: Permiso                                 │
│  Solicitante: Juan Pérez (Desarrollador)           │
│  Fecha: 28/01/2026 14:30                           │
│                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                     │
│  Situación:                                         │
│  Me siento enfermo y necesito ausentarme el día    │
│  de mañana para ir al médico                       │
│                                                     │
│  Información:                                       │
│  Cita médica: 28/01/2026 - 10:00 AM                │
│  Duración estimada: medio día                      │
│                                                     │
│  Solución:                                          │
│  Mi compañero Juan cubrirá mis tareas.             │
│  Código en branch feature/auth listo.              │
│                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                     │
│  Flujo de Aprobación:                              │
│  ✅ Nivel 1: Tech Lead (María G.) - 28/01 15:00    │
│     "Aprobado, el trabajo está al día"             │
│                                                     │
│  ⏳ Nivel 2: Arq. Técnico (TÚ) - Pendiente          │
│                                                     │
│  ⏸️  Nivel 3: Arq. Soluciones - Pendiente           │
│                                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                     │
│  Comentarios: (opcional, máx 200 palabras)         │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│              [Rechazar]          [Aprobar]         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4. Historial de Solicitud

```
┌─────────────────────────────────────────────────────┐
│ Historial - CSW #12345                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📝 28/01/2026 14:30 - Juan Pérez                   │
│     Solicitud creada                                │
│                                                     │
│  ✅ 28/01/2026 15:00 - María García                 │
│     Aprobado en Nivel 1 (Tech Lead)                 │
│     "Aprobado, el trabajo está al día"              │
│                                                     │
│  ✅ 28/01/2026 15:30 - Pedro López                  │
│     Aprobado en Nivel 2 (Arq. Técnico)              │
│     "Sin observaciones"                             │
│                                                     │
│  ✅ 28/01/2026 16:00 - Carlos Ruiz                  │
│     Aprobado en Nivel 3 (Arq. Soluciones)           │
│                                                     │
│  ✅ 28/01/2026 16:00 - Sistema                      │
│     Solicitud APROBADA (todos los niveles)          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Endpoints API

### Flujos de Aprobación

```typescript
// Obtener flujos
GET    /api/v1/approval-flows
GET    /api/v1/approval-flows/:id
GET    /api/v1/approval-flows/by-division/:divisionId

// Gestión (Admin)
POST   /api/v1/approval-flows
PUT    /api/v1/approval-flows/:id
DELETE /api/v1/approval-flows/:id

// Activar/Desactivar
PATCH  /api/v1/approval-flows/:id/toggle
```

### Categorías CSW

```typescript
// Obtener categorías activas
GET    /api/v1/csw-categories
GET    /api/v1/csw-categories/:id

// Gestión (Admin)
POST   /api/v1/csw-categories
PUT    /api/v1/csw-categories/:id
DELETE /api/v1/csw-categories/:id
```

### Solicitudes CSW

```typescript
// Listar (con filtros)
GET    /api/v1/csw
  ?status=pending|approved|rejected
  &requester=userId
  &approver=userId      // CSW donde soy aprobador
  &category=categoryId
  &division=divisionId
  &page=1&limit=10

// Obtener detalles
GET    /api/v1/csw/:id
GET    /api/v1/csw/:id/history

// Crear
POST   /api/v1/csw
{
  "category": "categoryId",
  "situation": "...",
  "information": "...",
  "solution": "..."
}

// Editar (solo si está rechazado y es el solicitante)
PUT    /api/v1/csw/:id

// Aprobar/Rechazar
POST   /api/v1/csw/:id/approve
{
  "level": 2,
  "comments": "..." // opcional
}

POST   /api/v1/csw/:id/reject
{
  "level": 2,
  "comments": "..." // obligatorio
}

// Cancelar (solo solicitante)
POST   /api/v1/csw/:id/cancel
{
  "comments": "..." // opcional
}

// Estadísticas
GET    /api/v1/csw/stats
GET    /api/v1/csw/stats/by-division
GET    /api/v1/csw/stats/by-category
```

---

## 🔐 Permisos Requeridos

```typescript
// Permisos necesarios
csw:read            // Ver solicitudes
csw:create          // Crear solicitudes
csw:update          // Editar sus propias solicitudes
csw:approve         // Aprobar/rechazar (si es aprobador en el flujo)
csw:cancel          // Cancelar sus propias solicitudes
csw:view_all        // Ver todas las solicitudes (admin)

// Permisos de configuración
approval_flows:manage    // Gestionar flujos (admin)
csw_categories:manage    // Gestionar categorías (admin)
```

---

## 💾 Ejemplos de Configuración

### Ejemplo 1: División Administrativa

```json
{
  "divisionId": "div1_id",
  "name": "Flujo Administrativo",
  "levels": [
    {
      "order": 1,
      "name": "Talento Humano",
      "approverType": "role",
      "approverRoleId": "role_hr_id",
      "required": true
    },
    {
      "order": 2,
      "name": "CEO",
      "approverType": "user",
      "approverUserId": "ceo_user_id",
      "required": true
    }
  ]
}
```

### Ejemplo 2: División Tecnología

```json
{
  "divisionId": "div4_id",
  "name": "Flujo Tecnología",
  "levels": [
    {
      "order": 1,
      "name": "Tech Lead",
      "approverType": "role",
      "approverRoleId": "role_tech_lead_id",
      "required": true
    },
    {
      "order": 2,
      "name": "Arquitecto Técnico",
      "approverType": "role",
      "approverRoleId": "role_tech_architect_id",
      "required": true
    },
    {
      "order": 3,
      "name": "Arquitecto de Soluciones",
      "approverType": "role",
      "approverRoleId": "role_solution_architect_id",
      "required": true
    }
  ]
}
```

---

## 🎯 Ventajas del Diseño

1. **Flexibilidad Total**: Cada división tiene su flujo único
2. **Escalable**: Fácil agregar nuevos niveles o divisiones
3. **Auditable**: Historial completo de todas las acciones
4. **Mantenible**: Cambiar un flujo no afecta solicitudes anteriores
5. **Configurable**: Admin puede modificar flujos sin tocar código
6. **Independiente**: No depende de la estructura organizacional (managerId)
7. **Extensible**: Fácil agregar campos o lógica adicional

---

## 📝 Notas de Implementación

- **Validación**: El sistema valida que solo el aprobador correcto pueda aprobar en su nivel
- **Orden estricto**: No se puede saltar niveles, debe ser secuencial
- **Historial inmutable**: Una vez agregado al historial, no se puede modificar
- **Soft delete**: Los flujos y categorías se eliminan con soft delete
- **Cache**: Los flujos se pueden cachear para mejor rendimiento
- **Notificaciones**: Integración futura con sistema de notificaciones

---

## 🚀 Próximos Pasos

1. ✅ Crear modelos (ApprovalFlow, CSW, CSWCategory)
2. ✅ Implementar controladores CRUD
3. ✅ Crear rutas y documentación Swagger
4. ✅ Actualizar seed con flujos de ejemplo
5. ⏳ Testing completo de flujos
6. ⏳ Documentación para frontend
7. ⏳ Implementación UI en React

---

**Fecha**: 28 de Enero de 2026
**Versión**: 1.0
**Autor**: Sistema RH UNLIMITECH
