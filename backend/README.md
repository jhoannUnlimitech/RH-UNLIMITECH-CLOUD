# Backend — RH Unlimitech Cloud

API REST con Express + TypeScript + MongoDB para el sistema de gestión de RRHH.

## Setup

```bash
cd backend
cp .env.example .env  # Configurar variables de entorno
npm install
npx ts-node --transpile-only src/server.ts
```

**Puerto:** 9050

## Endpoints principales

| Módulo | Base | Autenticación |
|--------|------|---------------|
| Auth | `/api/v1/auth` | Público (login/register) |
| Employees | `/api/v1/employees` | JWT Cookie |
| Divisions | `/api/v1/divisions` | JWT Cookie |
| Roles | `/api/v1/roles` | JWT Cookie |
| CSW | `/api/v1/csw` | JWT Cookie + Permisos |
| CSW Categories | `/api/v1/csw-categories` | JWT Cookie |
| Projects | `/api/v1/projects` | JWT Cookie |
| Calendar Events | `/api/v1/calendar-events` | JWT Cookie |
| Weekly Reports | `/api/v1/weekly-reports` | JWT Cookie |
| Approval Flows | `/api/v1/approval-flows` | JWT Cookie |

## Seguridad (Implementado)

- ✅ **Helmet** — Security headers (11 headers automáticos)
- ✅ **express-rate-limit** — Rate limiting (login: 10/15min, global: 500/15min)
- ✅ **Zod validation** — 12/12 endpoints con schemas strict
- ✅ **JWT fail-fast** — Error en producción si JWT_SECRET no configurado
- ✅ **HS256 enforcement** — jwt.verify con algorithms explícito
- ✅ **Cookie-only auth** — No Bearer header, solo httpOnly cookie
- ✅ **CORS dinámico** — Solo localhost en dev, frontend URL en prod
- ✅ **Swagger solo en dev** — Desactivado en producción
- ✅ **Compression** — gzip responses
- ✅ **npm audit** — 0 vulnerabilidades
- ✅ **Sin console.log** — Cero logs de debug en código

## Validators (Fuente Única de Verdad)

Cada endpoint tiene un schema Zod en `src/validators/`:

| Archivo | Schemas |
|---------|---------|
| `csw.validator.ts` | createCSW, updateCSW, reject, login, changePassword |
| `employee.validator.ts` | createEmployee, updateEmployee |
| `division.validator.ts` | createDivision, updateDivision |
| `project.validator.ts` | createProject, updateProject |
| `calendarEvent.validator.ts` | createEvent, updateEvent |
| `permission.validator.ts` | createPermission, updatePermission |
| `cswCategory.validator.ts` | createCategory, updateCategory |
| `hat.validator.ts` | createHat, updateHat |
| `approvalFlow.validator.ts` | createFlow, updateFlow |
| `common.ts` | objectId regex (reutilizable) |

## Estructura

```
src/
├── config/          # env.ts, database.ts, swagger.ts
├── controllers/     # Lógica de negocio por módulo
├── middleware/      # auth, cors, error, permission, validate, swaggerAuth
├── models/          # Mongoose schemas + soft delete base
├── routes/          # Express routes + Swagger JSDoc
├── validators/      # Zod schemas (csw.validator.ts)
├── database/
│   ├── migrations/  # Scripts incrementales (006, 007)
│   └── seeds/       # seed-real.ts, seed-projects.ts, etc.
└── server.ts        # Entry point
```

## Migrations

```bash
npx ts-node --transpile-only src/database/migrations/006-add-orden-estudio-category.ts
npx ts-node --transpile-only src/database/migrations/007-fix-approval-flow-div4.ts
```

## Modelos

| Modelo | Colección | Campos clave |
|--------|-----------|--------------|
| Employee | employees | name, email, role, division, approve_csw |
| Role | roles | name, permissions[] |
| Permission | permissions | resource, action |
| Division | divisions | name, code, managerId |
| CSW | csws | status, approvalChain[], history[] |
| CSWCategory | cswcategories | name, useDefaultFlow, directApproverId |
| ApprovalFlow | approvalflows | divisionId, levels[] |
| Project | projects | name, code, division, members[], lead |
| CalendarEvent | calendarevents | title, type, start, end, link |
| WeeklyReport | weeklyreports | employee, week, qaMetrics, devMetrics |
