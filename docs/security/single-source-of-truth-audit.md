# 🛡️ Auditoría: Fuente Única de Verdad + Validación de Inputs

**Fecha:** 25 Junio 2026  
**Principio:** Todo dato que entra al sistema debe pasar por un "keypoint" de validación (Zod schema) antes de llegar al controller. El schema ES la fuente única de verdad de qué acepta cada endpoint.

---

## 📊 Estado Actual

| Módulo | Controller | Zod Schema | Route validate() | Estado |
|--------|-----------|------------|-------------------|--------|
| Auth (login) | ✅ | ✅ loginSchema | ✅ Aplicado | ✅ SEGURO |
| CSW (create) | ✅ | ✅ createCSWSchema | ✅ Aplicado | ✅ SEGURO |
| CSW (update) | ✅ | ✅ updateCSWSchema | ✅ Aplicado | ✅ SEGURO |
| CSW (reject) | ✅ | ✅ rejectSchema | ✅ Aplicado | ✅ SEGURO |
| **Employees** | ❌ sin schema | ❌ No existe | ❌ No aplicado | 🔴 VULNERABLE |
| **Divisions** | ❌ validación manual | ❌ No existe | ❌ No aplicado | 🔴 VULNERABLE |
| **Permissions** | ❌ sin schema | ❌ No existe | ❌ No aplicado | 🔴 VULNERABLE |
| **Calendar Events** | ❌ sin schema | ❌ No existe | ❌ No aplicado | 🔴 VULNERABLE |
| **Projects** | ❌ sin schema | ❌ No existe | ❌ No aplicado | 🔴 VULNERABLE |
| **Approval Flows** | ❌ sin schema | ❌ No existe | ❌ No aplicado | 🔴 VULNERABLE |
| **CSW Categories** | ❌ sin schema | ❌ No existe | ❌ No aplicado | 🔴 VULNERABLE |
| **Hats/Roles** | ❌ sin schema | ❌ No existe | ❌ No aplicado | 🔴 VULNERABLE |

**Resultado:** 4/12 endpoints protegidos. **8 endpoints críticos expuestos.**

---

## 🔴 Riesgos Identificados

### 1. Mass Assignment (Asignación masiva)

```typescript
// VULNERABLE — el controller acepta CUALQUIER campo del body
const { name, email, password, role, ...rest } = req.body;
// Un atacante envía: { role: "admin_role_id", approve_csw: true }
```

**Impacto:** Un usuario puede escalar privilegios enviando campos que no debería poder modificar.

### 2. Type Coercion

```typescript
// VULNERABLE — sin Zod, MongoDB acepta tipos inesperados
POST /employees { "role": ["id1", "id2"] }  // Array en vez de string
POST /employees { "approve_csw": "yes" }     // String en vez de boolean
```

**Impacto:** Datos corruptos en BD, comportamiento impredecible.

### 3. Campos Fantasma (Frontend envía, Backend ignora)

| Campo | Frontend envía | Backend lo usa |
|-------|---------------|----------------|
| `techLeadId` | ✅ | ❌ Ignorado silenciosamente |
| `forcePasswordChange` | ✅ en update | ❌ No se guarda |
| `status` en employee | ✅ | ⚠️ Sin enum validation |

**Impacto:** El usuario cree que guardó algo que nunca se persistió.

### 4. Sin Límites de Longitud

```typescript
// VULNERABLE — sin maxlength en la mayoría de campos
POST /divisions { "description": "A".repeat(1000000) }  // 1MB de texto
POST /projects { "name": "<script>alert('xss')</script>" }
```

### 5. ObjectId Sin Formato

```typescript
// VULNERABLE — se pasa directo a MongoDB
POST /employees { "role": "not-an-objectid", "division": "injection" }
// Mongoose hace cast y si falla → error 500 genérico
```

---

## 🏗️ Arquitectura Propuesta: Fuente Única de Verdad

```
[Frontend Form] 
    → validateOnSubmit (UX feedback rápido)
    → POST /api/v1/endpoint
        → [Route: validate(schema)]  ← KEYPOINT: fuente única de verdad
            → [Controller] (solo campos que pasaron validación)
                → [Model] (ya limpio, solo persiste)
```

### Principios:

1. **El schema Zod define qué acepta el endpoint** — ni más, ni menos
2. **El controller nunca toca req.body crudo** — solo el body parseado por Zod
3. **Campos no declarados en el schema se descartan** automáticamente (`.strict()` o `.strip()`)
4. **Frontend valida para UX** pero el backend es la autoridad
5. **Un schema por operación** (create ≠ update)

---

## 📋 Schemas Necesarios (Plan de Implementación)

### `validators/employee.validator.ts`

```typescript
import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'ID inválido');

export const createEmployeeSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: objectId,
  division: objectId,
  birthDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  nationalId: z.string().min(3).max(30),
  phone: z.string().min(7).max(20),
  nationality: z.string().min(2).max(50),
  address: z.string().max(300).optional(),
  emergencyContact: z.string().max(200).optional(),
  emergencyPhone: z.string().max(20).optional(),
  photo: z.string().max(2_000_000).optional(), // Base64 max ~1.5MB
  managerId: objectId.optional(),
  approve_csw: z.boolean().optional().default(false),
}).strict(); // Rechaza campos no declarados

export const updateEmployeeSchema = createEmployeeSchema
  .partial() // Todos opcionales
  .omit({ password: true }) // No se cambia password aquí
  .strict();
```

### `validators/division.validator.ts`

```typescript
export const createDivisionSchema = z.object({
  name: z.string().min(2).max(150).trim(),
  code: z.string().min(1).max(20).transform(v => v.toUpperCase().trim()),
  description: z.string().max(500).optional().default(''),
  managerId: objectId,
  status: z.enum(['active', 'inactive']).optional().default('active'),
  approvalFlow: z.array(z.object({
    order: z.number().int().min(1),
    employeeId: objectId,
  })).optional().default([]),
}).strict();
```

### `validators/project.validator.ts`

```typescript
export const createProjectSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(1).max(20),
  description: z.string().max(1000).optional().default(''),
  divisionId: objectId,
  status: z.enum(['active', 'on_hold', 'completed', 'cancelled']).optional().default('active'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  members: z.array(objectId).optional().default([]),
  leadId: objectId.optional(),
}).strict();
```

### `validators/calendarEvent.validator.ts`

```typescript
export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(''),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  startTime: z.string().max(10).optional().default(''),
  endTime: z.string().max(10).optional().default(''),
  type: z.enum(['meeting', 'holiday', 'birthday', 'training', 'other']).optional().default('other'),
  color: z.string().max(20).optional().default('primary'),
  allDay: z.boolean().optional().default(true),
  link: z.string().url().or(z.literal('')).optional().default(''),
}).strict();
```

### `validators/permission.validator.ts`

```typescript
export const createPermissionSchema = z.object({
  resource: z.string().min(1).max(50),
  action: z.enum(['read', 'create', 'update', 'delete', 'approve', 'cancel']),
}).strict();
```

### `validators/cswCategory.validator.ts`

```typescript
export const createCategorySchema = z.object({
  name: z.string().min(2).max(100).trim(),
  description: z.string().max(250).optional().default(''),
  active: z.boolean().optional().default(true),
  useDefaultFlow: z.boolean().optional().default(true),
  directApproverId: objectId.optional(),
}).strict();
```

### `validators/hat.validator.ts`

```typescript
export const createHatSchema = z.object({
  name: z.string().min(2).max(100),
  permissions: z.array(objectId).optional().default([]),
}).strict();
```

### `validators/approvalFlow.validator.ts`

```typescript
export const createFlowSchema = z.object({
  divisionId: objectId,
  name: z.string().min(2).max(100),
  description: z.string().max(300).optional().default(''),
  levels: z.array(z.object({
    order: z.number().int().min(1),
    name: z.string().min(1).max(100),
    approverType: z.enum(['user', 'role']),
    approverUserId: objectId.optional(),
    approverRoleId: objectId.optional(),
    required: z.boolean().optional().default(true),
    autoApprove: z.boolean().optional().default(false),
  })).min(1),
  active: z.boolean().optional().default(true),
}).strict();
```

---

## 🔧 Aplicación en Routes (Pattern)

```typescript
// ANTES (vulnerable)
router.post('/', authMiddleware, requirePermission('employees', 'create'), createEmployee);

// DESPUÉS (seguro)
router.post('/', authMiddleware, requirePermission('employees', 'create'), validate(createEmployeeSchema), createEmployee);
router.put('/:id', authMiddleware, requirePermission('employees', 'update'), validate(updateEmployeeSchema), updateEmployee);
```

**Nota:** `validate()` parsea `req.body` con `.strict()` → campos no declarados en el schema se rechazan con 400. El controller recibe solo datos limpios.

---

## 📊 Impacto del Cambio

| Antes | Después |
|-------|---------|
| Controller decide qué aceptar | Schema decide (fuente única) |
| Frontend y backend validan diferente | Schema es la verdad para ambos |
| Campos extra se ignoran silenciosamente | Campos extra → 400 error |
| Types no verificados | Types forzados por Zod |
| ObjectIds sin formato | Regex `/^[a-f\d]{24}$/i` |
| Strings sin límite | Max lengths definidos |
| Enums aceptan cualquier valor | `.enum()` restringe |

---

## ✅ Checklist de Implementación

- [ ] Crear `validators/employee.validator.ts`
- [ ] Crear `validators/division.validator.ts`
- [ ] Crear `validators/project.validator.ts`
- [ ] Crear `validators/calendarEvent.validator.ts`
- [ ] Crear `validators/permission.validator.ts`
- [ ] Crear `validators/cswCategory.validator.ts`
- [ ] Crear `validators/hat.validator.ts`
- [ ] Crear `validators/approvalFlow.validator.ts`
- [ ] Aplicar `validate()` en `employees.routes.ts` (POST + PUT)
- [ ] Aplicar `validate()` en `divisions.routes.ts` (POST + PUT)
- [ ] Aplicar `validate()` en `projects.routes.ts` (POST + PUT)
- [ ] Aplicar `validate()` en `calendarEvent.routes.ts` (POST + PUT)
- [ ] Aplicar `validate()` en `permissions.routes.ts` (POST + PUT)
- [ ] Aplicar `validate()` en `cswCategory.routes.ts` (POST + PUT)
- [ ] Aplicar `validate()` en roles/hats routes (POST + PUT)
- [ ] Aplicar `validate()` en `approvalFlow.routes.ts` (POST + PUT)
- [ ] Verificar que frontend funciona sin enviar campos extra
- [ ] Eliminar validaciones manuales de controllers (reemplazadas por Zod)
- [ ] Test: enviar campos extra → debe retornar 400

---

## 🔐 Resumen de Principios

1. **Fuente Única de Verdad:** El schema Zod ES el contrato del endpoint
2. **Keypoint de validación:** Todo pasa por `validate(schema)` en la route
3. **Strict mode:** Campos no declarados se rechazan (no se ignoran)
4. **Types explícitos:** ObjectId, enum, boolean, dates — todo tipado
5. **Max lengths:** Previene DoS por payloads gigantes
6. **Frontend valida para UX, backend valida para seguridad**

---

**Esfuerzo estimado:** 4-6 horas  
**Prioridad:** HIGH — endpoints de Employees y Divisions son los más críticos por manejar datos personales.

---

*Generado con Security Auditor + Senior Architect Skills*
