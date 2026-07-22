# E2E Tests — RH Unlimitech Cloud

Suite de tests end-to-end para la plataforma de gestión de Recursos Humanos. Valida Login, CSW (Solicitudes con flujo de aprobación multi-nivel), Categorías CRUD, Perfil de usuario, Empleados, Divisiones, Hats, Proyectos, Calendario, Dashboard y **Biblioteca (Training Phase 1)**.

## Requisitos

- Node.js 20+
- Backend corriendo en puerto 9050 (`npx tsx src/server.ts` en `/backend`)
- Frontend corriendo en puerto 5173 (`npm run dev` en `/frontend`)
- Chrome con `--remote-debugging-port=9223` (modo CDP)
- MongoDB corriendo en puerto 27017
- Usuario e2e creado (`npm run e2e:seed`)

## Setup Inicial

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Instalar Chromium (solo primera vez)
npm run e2e:setup

# 3. Crear usuario de prueba e2e
npm run e2e:seed
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run e2e` | Headless — lanza Chromium propio |
| `npm run e2e:assisted` | CDP — conecta a Chrome en `localhost:9223` |
| `npm run e2e:seed` | Crea el usuario e2e developer |
| `npm run test:unit` | Unit tests del selector engine (27 tests) |

### Ejecutar specs específicos

```bash
# Solo login
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts e2e/specs/happy-path/login.spec.ts --reporter=list

# Solo CSW approval flow (30 tests, ~50s)
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts e2e/specs/happy-path/csw-approval-flow.spec.ts --reporter=list

# Solo profile
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts e2e/specs/happy-path/profile.spec.ts --reporter=list

# Solo validaciones
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts --project=validation --reporter=list

# Todos los happy-path
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts --project=happy-path --reporter=list

# TODO junto
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts --reporter=list
```

## Arquitectura

```
e2e/
├── pom/                              ← Page Object Models (selectores data-test-*)
│   ├── selector-engine.ts            ← Motor genérico proxy-based
│   ├── selector-engine.test.ts       ← 27 unit tests
│   ├── states.ts                     ← Vocabulario de estados conocidos
│   ├── signin.pom.ts                 ← POM: Login page
│   ├── csw.pom.ts                    ← POM: CSW (list, form, view)
│   ├── csw-categories.pom.ts         ← POM: CSW Categories (list, modal)
│   ├── profile.pom.ts                ← POM: Profile (header, info, security, modals)
│   └── library.pom.ts                ← POM: Library (manage, categories, docs, editor, view)
│
├── fixtures/                         ← Datos y sesión
│   ├── base.ts                       ← createSerialFlow() — sesión aislada CDP/headless
│   ├── test-data.ts                  ← Datasets tipados + credenciales
│   ├── seed-test-user.ts             ← Script para crear usuario e2e
│   └── reset-test-user.sh            ← Script para resetear usuario
│
├── factories/                        ← Lógica de interacción reutilizable
│   ├── login.factory.ts              ← Login: navigate, fill, submit, verify
│   ├── csw.factory.ts                ← CSW: create, approve, reject, verify
│   └── library.factory.ts            ← Library: categories CRUD, docs CRUD, editor, search
│
├── specs/
│   ├── happy-path/                   ← Flujos completos exitosos
│   │   ├── login.spec.ts             ← Login developer → dashboard (5 tests)
│   │   ├── csw-create.spec.ts        ← Crear solicitud "Permiso" (5 tests)
│   │   ├── csw-approval-flow.spec.ts ← Flujo 3 niveles + rechazo (30 tests)
│   │   ├── csw-orden-estudio.spec.ts ← Aprobación directa Oscar (11 tests)
│   │   ├── csw-create-category.spec.ts ← CRUD categorías CSW (26 tests)
│   │   ├── profile.spec.ts           ← Validación datos perfil (16 tests)
│   │   ├── employees-all.spec.ts     ← MASTER: lifecycle completo (21 tests)
│   │   ├── employees-create.spec.ts  ← Crear + buscar + ver (11 tests)
│   │   ├── employees-edit.spec.ts    ← Editar campos (8 tests)
│   │   ├── employees-edit-suspend-delete.spec.ts ← Suspend/activate/delete (12 tests)
│   │   ├── employees-login-created.spec.ts ← Login + forcePassword + profile (7 tests)
│   │   ├── divisions-all.spec.ts     ← CRUD + manager + filter by division (15 tests)
│   │   ├── hats-all.spec.ts          ← CRUD + view + edit permissions (17 tests)
│   │   ├── projects-all.spec.ts      ← CRUD + detail + status filter (15 tests)
│   │   ├── calendar-all.spec.ts      ← Calendar view + events CRUD (10 tests)
│   │   ├── dashboard.spec.ts         ← Welcome + stats + links (8 tests)
│   │   ├── library-categories.spec.ts ← Categorías CRUD lifecycle (30 tests)
│   │   ├── library-documents.spec.ts  ← Documentos CRUD lifecycle (21 tests)
│   │   ├── library-editor.spec.ts     ← Editor dual visual/markdown (11 tests)
│   │   ├── library-all.spec.ts        ← Vista empleado + doc view + manage + permisos (31 tests)
│   │   └── library-api-crud.spec.ts   ← API Training courses/levels/badges (14 tests)
│   └── validation/                   ← Casos de error y edge cases
│       ├── login-validation.spec.ts  ← Wrong password, nonexistent, toggle (10 tests)
│       ├── csw-form-validation.spec.ts ← Campos vacíos, word count, cancel (10 tests)
│       ├── employees-form-validation.spec.ts ← Empty, short pwd, invalid email (20 tests)
│       └── library-permissions.spec.ts ← Permisos admin vs read-only (14 tests)
│
├── playbooks/                        ← Secuencias curadas paso a paso
│   ├── login-flow.md
│   └── csw-approval-flow.md
│
├── results/                          ← Criterios de aceptación y reportes
│   ├── acceptance-criteria-checklist.md   ← Login ACs (6 ACs ✅)
│   ├── csw-acceptance-criteria.md         ← CSW ACs (42 ACs ✅)
│   ├── profile-acceptance-criteria.md     ← Profile ACs (38 ACs ✅)
│   └── library-acceptance-criteria.md     ← Library ACs (102 ACs ✅)
│
├── playwright.config.ts              ← Configuración Playwright
└── README.md                         ← Este archivo
```

## Usuarios del Flujo

| Usuario | Email | Hat | Función |
|---------|-------|-----|---------|
| E2E Test Developer | greatly-hide@emxeecta.mailosaur.net | DEVELOPER | Crea solicitudes, perfil |
| Moises Gonzalez | moises@unlimitech.cloud | TECHNICAL ARCHITECT MANAGER | Nivel 1 aprobación + categorías |
| Manuel Lara | admin@unlimitech.cloud | FOUNDER & SOLUTIONS ARCHITECT | Nivel 2 aprobación |
| Laura Hernandez | talent@unlimitech.cloud | HUMAN TALENT MANAGER | Nivel 3 aprobación |
| Oscar Hernandez | training@unlimitech.cloud | QUALITY & TRAINING OFFICER | Aprobador directo "Orden de Estudio" |

**Todos usan contraseña: `Pass2014!`**

## Criterios de Aceptación — Resumen General

| Módulo | ACs | Tests | Status |
|--------|-----|-------|--------|
| Login — Happy Path | 6 | 5 | ✅ |
| Login — Validations | 5 | 10 | ✅ |
| CSW — Crear Solicitud | 5 | 5 | ✅ |
| CSW — Validaciones Form | 6 | 10 | ✅ |
| CSW — Aprobación 3 niveles | 11 | 30 | ✅ |
| CSW — Orden de Estudio | 3 | 11 | ✅ |
| CSW — Crear Categoría (Default) | 6 | 7 | ✅ |
| CSW — Crear Categoría (Direct) | 4 | 8 | ✅ |
| CSW — Editar Categoría | 4 | 7 | ✅ |
| CSW — Eliminar Categoría | 3 | 4 | ✅ |
| Profile — Datos del usuario | 13 | 11 | ✅ |
| Profile — Editar info | 7 | 3 | ✅ |
| Profile — Cambio contraseña | 9 | 2 | ✅ |
| Profile — Anotaciones | 5 | — | ✅ |
| Employees — Crear | 11 | 11 | ✅ |
| Employees — Ver | 6 | 3 | ✅ |
| Employees — Editar | 8 | 8 | ✅ |
| Employees — Suspender/Activar | 7 | 12 | ✅ |
| Employees — Eliminar | 5 | 3 | ✅ |
| Employees — Login creado | 4 | 7 | ✅ |
| Employees — Validaciones form | 15 | 20 | ✅ |
| Employees — Anotaciones | 9 | — | ✅ |
| Employees — Master Lifecycle | — | 21 | ✅ |
| Divisions — CRUD + Manager + Filter | 19 | 15 | ✅ |
| Hats — CRUD + Permisos | 17 | 17 | ✅ |
| Projects — CRUD + Detail + Filter | 22 | 15 | ✅ |
| Calendar — Vista + Eventos CRUD | 14 | 10 | ✅ |
| Dashboard — Contenido + Links | 10 | 8 | ✅ |
| **Library — Categorías CRUD + Lifecycle** | **32** | **30** | **✅** |
| **Library — Documentos CRUD** | **18** | **21** | **✅** |
| **Library — Editor Dual** | **6** | **11** | **✅** |
| **Library — Vista Empleado + Doc View + Manage** | **22** | **31** | **✅** |
| **Library — Permisos y Navegación** | **5** | **14** | **✅** |
| **Library — API CRUD (Courses/Levels/Badges)** | **12** | **14** | **✅** |
| POM Selector Engine (unit) | — | 27 | ✅ |
| **Total** | **~346** | **~399** | **✅ ALL PASS** |

### Ejecutar todos los tests

```bash
# Todos los módulos (headless)
npx playwright test --config=e2e/playwright.config.ts --reporter=list

# Todos via CDP
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts --reporter=list

# Solo un módulo específico
npx playwright test --config=e2e/playwright.config.ts employees-all --reporter=list
npx playwright test --config=e2e/playwright.config.ts divisions-all --reporter=list
npx playwright test --config=e2e/playwright.config.ts hats-all --reporter=list
npx playwright test --config=e2e/playwright.config.ts projects-all --reporter=list
npx playwright test --config=e2e/playwright.config.ts calendar-all --reporter=list
npx playwright test --config=e2e/playwright.config.ts dashboard --reporter=list

# Library module (por spec individual)
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts library-categories --reporter=list
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts library-documents --reporter=list
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts library-editor --reporter=list
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts library-all --reporter=list
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts library-api-crud --reporter=list
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts library-permissions --reporter=list

# Library module completo (todos los specs)
CDP_ENDPOINT=http://localhost:9223 npx playwright test --config=e2e/playwright.config.ts library- --reporter=list
```

## Cadenas de Aprobación

| Categoría | Niveles | Aprobadores |
|-----------|---------|-------------|
| Permiso (y normales) | 3 | Moises → Manuel → Laura |
| Orden de Estudio | 1 | Oscar (directApproverId) |

## Bugs Encontrados y Corregidos

| # | Bug | Fix |
|---|-----|-----|
| 1 | `initializeApprovalChain` ignoraba `useDefaultFlow: false` | Category check en `CSW.ts` |
| 2 | Oscar sin permiso `csw:approve` | Permiso agregado al rol |
| 3 | Zod validator rechazaba `directApproverId: ""` con 500 | `z.preprocess` empty → undefined |
| 4 | Sin toasts en categorías CRUD | `notify.success/error` en store |
| 5 | Rate limiting restrictivo para dev | 1000/5min global, 50/5min auth |
| 6 | `externalLink: ""` rechazado por Zod url validator | `z.preprocess` empty → undefined en create schema |
| 7 | `slug` required fallaba — Mongoose validate antes de pre-save | Mover generación a `pre('validate')` |
| 8 | Slug unique index bloqueaba con soft-deleted | Partial unique index `{deleted: {$ne: true}}` |
| 9 | PermissionRoute no verificaba `action` específica | Extendido con prop `action` opcional |
| 10 | `/library/manage` accesible sin `training:create` | Ruta protegida con `action="create"` |
| 11 | Delete categoría con hijas bloqueaba en vez de cascada | Cascade: soft-delete hijas + unpublish docs |
| 12 | Delete documento usaba `confirm()` nativo | Migrado a `DeleteConfirmModal` React |
| 13 | Sin endpoint hard-delete para documentos | Agregado `DELETE /documents/:id/permanent` |
| 14 | Sin endpoint restore para documentos | Agregado `POST /documents/:id/restore` |
| 15 | Sin filtro de estado en gestión de documentos | Agregado select Todos/Publicados/Borradores/Eliminados |

## Rate Limiting (Development)

| Tipo | Límite | Ventana |
|------|--------|---------|
| Global | 1000 requests | 5 minutos |
| Auth (login) | 50 intentos | 5 minutos |

Si los tests fallan por rate limit, reiniciar el backend resetea los contadores.

## Convenciones (Steering Rules)

Este proyecto sigue los steering de:
- **test-annotations.md**: Esquema jerárquico `data-test-context` / `data-test-key` / `data-test-state`
- **test-materialization.md**: Factories + fixtures + createSerialFlow + specs en `happy-path/` y `validation/`
- **test-recording.md**: Playbooks curados como fuente de verdad

### Reglas clave:
- Todo elemento interactivo DEBE tener `data-test-key`
- Toda sección funcional DEBE tener `data-test-context`
- Los nombres describen FUNCIÓN, no apariencia
- Selectores siempre via POM (`pom.module._.section._.element.$()`)
- Factories devuelven `async () => {}` para uso directo en `e2e('desc', factory(getPage))`
- Specs usan `createSerialFlow()` con `describe.serial`
- Un POM por página, un factory por módulo
