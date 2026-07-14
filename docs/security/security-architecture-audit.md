# 🔒 Auditoría de Seguridad y Arquitectura — RH Unlimitech Cloud

**Fecha:** 25 de Junio de 2026  
**Auditores:** Security Auditor + Senior Architect Skills  
**Alcance:** Backend (Node.js/Express/MongoDB), Frontend (React/MobX/Vite), Infraestructura  
**Rama:** `develop`

---

## 📋 Resumen Ejecutivo

| Categoría | Score | Estado |
|-----------|-------|--------|
| Seguridad | 5.5/10 | ⚠️ Requiere atención inmediata |
| Arquitectura | 7/10 | ✅ Sólida con mejoras pendientes |
| Performance | 5/10 | ⚠️ Escalabilidad limitada |
| Testing | 2/10 | 🔴 Crítico — sin cobertura |
| DevOps | 4/10 | ⚠️ Sin CI/CD ni automatización |

**Hallazgos críticos:** 6  
**Hallazgos altos:** 9  
**Hallazgos medios:** 12  
**Hallazgos bajos:** 8

---

## 🔴 HALLAZGOS CRÍTICOS (Resolver inmediatamente)

### SEC-001: JWT Secret con Fallback Hardcodeado

**Severidad:** CRITICAL  
**OWASP:** A02 — Cryptographic Failures  
**Ubicación:** `backend/src/config/env.ts`

```typescript
// VULNERABLE
jwt: {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '48h',
}
```

**Riesgo:** Si `JWT_SECRET` no se configura en el ambiente, CUALQUIER persona puede forjar tokens válidos con el secret por defecto.

**Remediación:**
```typescript
jwt: {
  secret: (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 32) {
      throw new Error('FATAL: JWT_SECRET must be set and at least 32 characters');
    }
    return secret;
  })(),
  expiresIn: process.env.JWT_EXPIRES_IN || '48h',
}
```

---

### SEC-002: Sin Rate Limiting — Fuerza Bruta Viable

**Severidad:** CRITICAL  
**OWASP:** A07 — Identification and Authentication Failures  
**Ubicación:** `backend/src/routes/auth.routes.ts`

**Riesgo:** El endpoint `/api/v1/auth/login` no tiene límite de intentos. Un atacante puede hacer brute force de contraseñas sin restricción.

**Remediación:**
```bash
npm install express-rate-limit
```
```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: { success: false, message: 'Demasiados intentos. Intente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
```

---

### SEC-003: Sin Security Headers (Helmet)

**Severidad:** CRITICAL  
**OWASP:** A05 — Security Misconfiguration  
**Ubicación:** `backend/src/app.ts`

**Riesgo:** Sin headers de seguridad, la app es vulnerable a:
- Clickjacking (sin X-Frame-Options)
- MIME-type sniffing (sin X-Content-Type-Options)
- XSS (sin X-XSS-Protection en navegadores legacy)

**Remediación:**
```bash
npm install helmet
```
```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

### SEC-004: Doble Estado de Autenticación (Cookie + localStorage)

**Severidad:** CRITICAL  
**OWASP:** A07 — Identification and Authentication Failures  
**Ubicación:** `frontend/src/stores/views/AuthStore.live.ts` + `backend/src/middleware/auth.ts`

**Problema:** 
- Backend envía cookie `rh_auth_token` (httpOnly)
- Frontend TAMBIÉN guarda token en `localStorage` y lo envía como Bearer header
- Cuando la cookie expira/falla pero localStorage persiste → loop infinito
- localStorage es accesible via XSS (DevTools, extensiones maliciosas)

**Impacto demostrado:** Bug del loop infinito en `/csw/my-requests` que sacaba al usuario del sistema.

**Remediación:**
1. Eliminar `localStorage.setItem('auth_token', ...)` del frontend
2. Backend solo lee de cookie (ya lo hace como primario)
3. Frontend no envía Bearer header — solo `withCredentials: true`
4. `checkAuth()` solo verifica contra el endpoint, no contra localStorage

---

### SEC-005: Sin Validación de Input en Controllers

**Severidad:** CRITICAL  
**OWASP:** A03 — Injection  
**Ubicación:** Todos los controllers (`csw.controller.ts`, `employees.controller.ts`, etc.)

**Problema:** Los controllers reciben `req.body` y lo usan directamente sin sanitizar ni validar esquema.

```typescript
// VULNERABLE — sin validación
const { category, situation, information, solution } = req.body;
```

**Riesgo:** NoSQL injection, datos malformados, campos extras que se guardan en BD.

**Remediación:**
```bash
npm install zod
```
```typescript
import { z } from 'zod';

const createCSWSchema = z.object({
  category: z.string().length(24), // ObjectId format
  situation: z.string().max(10000).optional(),
  information: z.string().max(10000).optional(),
  solution: z.string().max(10000).optional(),
});

// En el controller:
const parsed = createCSWSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ success: false, errors: parsed.error.flatten() });
}
```

---

### SEC-006: Sin CSRF Protection

**Severidad:** CRITICAL  
**OWASP:** A01 — Broken Access Control  
**Ubicación:** `backend/src/app.ts`

**Problema:** Con cookies httpOnly + `sameSite: 'lax'`, un sitio malicioso puede hacer requests GET que ejecuten acciones (ej: `/csw/:id/approve` si fuera GET). Los POST están protegidos por `sameSite: lax`, pero es mejor tener CSRF token explícito.

**Remediación:**
```bash
npm install csrf-csrf
```
O cambiar a `sameSite: 'strict'` (rompe Swagger UI en otro origin).

---

## 🟠 HALLAZGOS ALTOS

### SEC-007: Fotos Base64 en MongoDB

**Severidad:** HIGH  
**Tipo:** Performance + Storage  
**Ubicación:** `backend/src/models/Employee.ts`

```typescript
photo: {
  type: String, // Base64 encoded — puede ser 500KB-2MB por empleado
}
```

**Impacto:** Con 100 empleados, la colección pesa 100-200MB solo en fotos. MongoDB tiene límite de 16MB por documento.

**Remediación:**
- Usar file upload a `/uploads/` local o S3
- Guardar solo la URL en el campo `photo`
- Implementar resize/compress antes de guardar

---

### SEC-008: History Array Sin Límite en CSW

**Severidad:** HIGH  
**Tipo:** Database Design  
**Ubicación:** `backend/src/models/CSW.ts`

**Problema:** El array `history[]` crece indefinidamente dentro del documento CSW. MongoDB tiene un límite de 16MB por documento. Un CSW muy editado podría alcanzarlo.

**Remediación:**
- Limitar a últimas 100 entradas inline
- O mover historial a colección separada `CSWHistory` con referencia

---

### SEC-009: Sin Paginación Real en Frontend

**Severidad:** HIGH  
**Tipo:** Performance  
**Ubicación:** `frontend/src/stores/views/CSWStore.live.ts`

```typescript
// Carga TODOS los CSWs del usuario en memoria
async fetchCSWs(): Promise<void> {
  const csws = await cswService.getAll(); // Sin ?page=&limit=
  this.csws = csws;
}
```

**Impacto:** Con 500+ solicitudes, la UI se vuelve lenta y consume RAM.

**Remediación:** Usar query params de paginación que el backend ya soporta.

---

### SEC-010: Sin Tests Automatizados

**Severidad:** HIGH  
**Tipo:** Quality Assurance  
**Ubicación:** Todo el proyecto

**Impacto:** Sin tests, cualquier cambio puede romper funcionalidad existente sin que nadie lo detecte hasta producción.

**Remediación:**
- Backend: Jest + Supertest para integration tests
- Frontend: Vitest + React Testing Library para components
- E2E: Playwright (ya instalado) para flows críticos

---

### SEC-011: Sin Error Boundary en Frontend

**Severidad:** HIGH  
**Tipo:** Resilencia  
**Ubicación:** `frontend/src/App.tsx`

**Problema:** Si un componente hijo hace throw, toda la aplicación se cae (pantalla blanca).

**Remediación:**
```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<ErrorPage />}>
  <AppRoutes />
</ErrorBoundary>
```

---

### SEC-012: Password Policy Débil

**Severidad:** HIGH  
**OWASP:** A07 — Authentication Failures  
**Ubicación:** `backend/src/controllers/auth.controller.ts`

**Problema:** No hay validación de complejidad de contraseña. Se acepta cualquier string.

**Remediación:**
```typescript
const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Al menos una mayúscula')
  .regex(/[0-9]/, 'Al menos un número')
  .regex(/[!@#$%]/, 'Al menos un carácter especial');
```

---

### SEC-013: Sin Logging Estructurado

**Severidad:** HIGH  
**Tipo:** Observability  
**Ubicación:** Backend completo

**Problema:** Solo `console.log` para debugging. Sin logs estructurados, sin audit trail, sin request tracing.

**Remediación:**
```bash
npm install pino pino-http
```
```typescript
import pino from 'pino';
import pinoHttp from 'pino-http';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
app.use(pinoHttp({ logger }));
```

---

### SEC-014: Mongoose Sin Transacciones

**Severidad:** HIGH  
**Tipo:** Data Integrity  
**Ubicación:** `backend/src/models/CSW.ts` (resetApprovals, approveAtLevel)

**Problema:** Operaciones que modifican múltiples campos del documento (status + approvalChain + history) sin usar `session.startTransaction()`. Si el proceso muere a mitad, el documento queda inconsistente.

**Remediación:** Para operaciones críticas, usar replica set + transactions.

---

### SEC-015: Sin Request Cancellation (AbortController)

**Severidad:** HIGH  
**Tipo:** Memory Management  
**Ubicación:** `frontend/src/api/services/*.ts`

**Problema:** Si un componente se desmonta mientras una request está en vuelo, la respuesta actualiza un store de un componente que ya no existe → memory leak.

**Remediación:**
```typescript
const controller = new AbortController();
const response = await apiClient.get('/csw', { signal: controller.signal });
// En cleanup: controller.abort();
```

---

## 🟡 HALLAZGOS MEDIOS

| ID | Hallazgo | Ubicación | Remediación |
|----|----------|-----------|-------------|
| MED-001 | CORS permite localhost en producción | `middleware/cors.ts` | Filtrar origins por NODE_ENV |
| MED-002 | Sin lazy loading de rutas | `App.tsx` | `React.lazy()` + `Suspense` |
| MED-003 | Stores duplicados (.ts + .live.ts) | `stores/views/` | Consolidar, eliminar duplicados |
| MED-004 | Sin graceful shutdown (SIGTERM) | `server.ts` | Agregar listener para SIGTERM |
| MED-005 | Magic strings en roles | Controllers | Crear enum/constantes centralizadas |
| MED-006 | Sin retry en conexión MongoDB | `config/database.ts` | `mongoose.connect` con retry options |
| MED-007 | Swagger expone en producción | `config/swagger.ts` | Deshabilitar si NODE_ENV=production |
| MED-008 | Sin Content-Security-Policy | Backend | Configurar CSP con helmet |
| MED-009 | Cookie sameSite 'lax' vs 'strict' | `config/env.ts` | Evaluar migrar a strict |
| MED-010 | Sin healthcheck de dependencias | `app.ts` | Health endpoint que verifique MongoDB |
| MED-011 | Sin compression middleware | `app.ts` | `npm install compression` |
| MED-012 | Populate chains en queries | Controllers | Usar lean() + aggregation |

---

## 🟢 HALLAZGOS BAJOS

| ID | Hallazgo | Remediación |
|----|----------|-------------|
| LOW-001 | Sin `.nvmrc` para versión de Node | Crear `.nvmrc` con `22` |
| LOW-002 | Scripts de migración sin runner unificado | Crear `migrate.ts` que ejecute en orden |
| LOW-003 | `console.log` en controllers (debug) | Reemplazar con logger |
| LOW-004 | Sin pre-commit hooks (lint) | `husky` + `lint-staged` |
| LOW-005 | Mock stores desactualizados | Auto-generar o eliminar |
| LOW-006 | Sin CHANGELOG.md | Generar con conventional-changelog |
| LOW-007 | Sin Docker/docker-compose | Crear para dev consistente |
| LOW-008 | Imports no ordenados (sin eslint rule) | `eslint-plugin-import` |

---

## 🏗️ ARQUITECTURA — Diagrama Actual

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Pages   │ │  Stores  │ │   API    │ │   Auth   │  │
│  │ (CSW,    │ │ (MobX    │ │ (Axios   │ │ (Cookie  │  │
│  │  Emp,    │ │  Live/   │ │  Client  │ │  + LS)   │  │
│  │  Cal)    │ │  Mock)   │ │  w/creds)│ │          │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │             │             │             │        │
└───────┼─────────────┼─────────────┼─────────────┼────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Express)                       │
│  ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐          │
│  │ CORS │→│Parse │→│   Auth   │→│  Routes  │          │
│  │      │ │JSON  │ │Middleware│ │(CSW,Emp, │          │
│  │      │ │Cookie│ │(JWT+    │ │ Div,Cal) │          │
│  │      │ │      │ │ Cookie) │ │          │          │
│  └──────┘ └──────┘ └──────────┘ └────┬─────┘          │
│                                       │                  │
│  ┌────────────────────────────────────▼─────────────┐   │
│  │              Controllers                          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │   │
│  │  │  Auth   │ │   CSW   │ │Employee │           │   │
│  │  │         │ │(CRUD+   │ │(CRUD)   │           │   │
│  │  │         │ │Approval)│ │         │           │   │
│  │  └─────────┘ └─────────┘ └─────────┘           │   │
│  └──────────────────────┬────────────────────────────┘   │
│                          │                                │
│  ┌───────────────────────▼────────────────────────────┐  │
│  │              Models (Mongoose)                      │  │
│  │  Employee, Role, Permission, Division,             │  │
│  │  CSW, CSWCategory, ApprovalFlow, Project,          │  │
│  │  CalendarEvent, WeeklyReport                       │  │
│  └───────────────────────┬────────────────────────────┘  │
└──────────────────────────┼────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  MongoDB (localhost:27017)                 │
│  Database: rh_management                                 │
│  Collections: employees, roles, permissions, divisions,  │
│  csws, cswcategories, approvalflows, projects,           │
│  calendarevents, weeklyreports                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📅 Plan de Acción

### Sprint 1 — Seguridad (1 semana)

| # | Tarea | Prioridad | Esfuerzo |
|---|-------|-----------|----------|
| 1 | Instalar helmet + configurar | CRITICAL | 15min |
| 2 | Instalar express-rate-limit (login: 5/15min, API: 100/min) | CRITICAL | 30min |
| 3 | Eliminar JWT_SECRET fallback, fail fast | CRITICAL | 10min |
| 4 | Eliminar localStorage token, solo cookie | CRITICAL | 2h |
| 5 | Instalar zod + validar 3 controllers principales | CRITICAL | 3h |
| 6 | Evaluar CSRF token o sameSite strict | CRITICAL | 1h |
| 7 | Password policy validation | HIGH | 30min |
| 8 | Desactivar Swagger en producción | MEDIUM | 15min |

### Sprint 2 — Performance y Resilencia (1 semana)

| # | Tarea | Prioridad | Esfuerzo |
|---|-------|-----------|----------|
| 9 | Paginación real en fetchCSWs/fetchEmployees | HIGH | 3h |
| 10 | Migrar fotos a file upload + URL | HIGH | 4h |
| 11 | ErrorBoundary en frontend | HIGH | 1h |
| 12 | AbortController en API services | HIGH | 2h |
| 13 | Compression middleware | MEDIUM | 15min |
| 14 | Lazy loading de rutas | MEDIUM | 1h |
| 15 | Consolidar stores duplicados | MEDIUM | 2h |

### Sprint 3 — Observabilidad y Testing (1 semana)

| # | Tarea | Prioridad | Esfuerzo |
|---|-------|-----------|----------|
| 16 | Pino logger + pino-http | HIGH | 2h |
| 17 | Request ID tracking (x-request-id) | MEDIUM | 1h |
| 18 | Health check completo (MongoDB status) | MEDIUM | 30min |
| 19 | Jest + primer test de auth flow | HIGH | 3h |
| 20 | Playwright test de login + crear CSW | HIGH | 3h |
| 21 | Husky + lint-staged (pre-commit) | LOW | 30min |
| 22 | Docker + docker-compose para dev | LOW | 3h |

### Sprint 4 — Refactoring (1 semana)

| # | Tarea | Prioridad | Esfuerzo |
|---|-------|-----------|----------|
| 23 | Enum centralizado de roles/recursos | MEDIUM | 2h |
| 24 | Graceful shutdown (SIGTERM + SIGINT) | MEDIUM | 30min |
| 25 | Retry logic en MongoDB connect | MEDIUM | 30min |
| 26 | lean() en queries de solo lectura | MEDIUM | 2h |
| 27 | History en colección separada (si crece mucho) | MEDIUM | 3h |
| 28 | CORS filtrado por NODE_ENV | MEDIUM | 30min |
| 29 | Documentar ADRs (Architecture Decision Records) | LOW | 2h |

---

## ✅ Lo que YA está bien hecho

- httpOnly cookies para JWT (anti-XSS)
- bcrypt 10 rounds para hashing
- Soft delete en todos los modelos
- Permission-based access control granular
- Índices compuestos en MongoDB
- CORS con credenciales configurado
- Middleware chain en orden correcto
- Error handler global centralizado
- Store contracts (interface-driven)
- Protected + Permission routes en frontend
- Desnormalización estratégica (performance reads)
- Swagger/OpenAPI documentación completa

---

**Próxima auditoría recomendada:** Después de completar Sprint 1 y 2.

---

*Generado por Security Auditor + Senior Architect Skills*  
*Última actualización: 25 de Junio de 2026*
