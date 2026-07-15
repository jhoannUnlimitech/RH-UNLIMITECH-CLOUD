# Checklist — Phase 4: Certificados + Dashboard

**Branch:** `solution/training-phase-4`
**Estado:** 📋 Pendiente

---

## Slice 27 — Certificate Model
**Rama:** `slice/27-certificate-model`

- [ ] Modelo `Certificate` (schema + interface + `CertificateType`)
- [ ] Campos: `type` ('level' | 'badge') — D17
- [ ] Campos: `logoUrl`, `signatureName`, `signatureRole` — D18
- [ ] Campos: `variables` (object con todos los valores resueltos)
- [ ] Service: `certificates.service.ts` — generate, getByEmployee, download, regenerate
- [ ] Service: `generateLevelCertificate(employeeId, levelId)` — al completar nivel
- [ ] Service: `generateBadgeCertificate(employeeId, badgeId)` — al completar insignia
- [ ] Resolver variables: nombre, nivel/badge, horas, fecha, división, hat
- [ ] Aplicar template configurable (de `TrainingConfig.certificateTemplate`)
- [ ] Endpoint: `GET /api/v1/training/certificates/me`
- [ ] Endpoint: `GET /api/v1/training/certificates/:employeeId`
- [ ] Endpoint: `POST /api/v1/training/certificates/:id/regenerate`

---

## Slice 28 — PDF Generation
**Rama:** `slice/28-pdf-generation`

- [ ] Instalar: `jspdf`
- [ ] Service: `generatePDF(certificate)` → Buffer PDF
- [ ] Layout PDF:
  - [ ] Logo empresa centrado arriba (de `TrainingConfig.certificateLogoUrl`)
  - [ ] Título del certificado (nombre)
  - [ ] Mensaje con variables resueltas (centrado)
  - [ ] Nombre del empleado destacado
  - [ ] Fecha de completado
  - [ ] Línea separadora
  - [ ] Firma: nombre + cargo (de config)
- [ ] Diseño profesional (márgenes, fuentes, espaciado)
- [ ] Almacenar PDF generado (base64 o URL si se sube a storage)
- [ ] Endpoint: `GET /api/v1/training/certificates/:id/download` → response PDF
- [ ] Frontend: botón "Descargar certificado" en la vista de certificados
- [ ] Frontend: preview del certificado antes de descarga (opcional)

---

## Slice 29 — Study Plan Model
**Rama:** `slice/29-study-plan-model`

- [ ] Modelo `StudyPlan` (schema + interface + `IStudyPlanItem`)
- [ ] Validator Zod: `studyPlan.validator.ts`
- [ ] Service: `studyPlans.service.ts` — create, update, completeItem, getByEmployee
- [ ] Validar: empleado cumple `prerequisiteLevels` antes de poder tener planes
- [ ] Items: tipo course (ref existente), document (contenido MD), link (URL)
- [ ] Service: `completeItem(planId, itemIndex)` → marcar completado
- [ ] Calcular progreso del plan (% items completados)
- [ ] Endpoint: `GET /api/v1/training/plans/me`
- [ ] Endpoint: `GET /api/v1/training/plans/:employeeId`
- [ ] Endpoint: `POST /api/v1/training/plans/:employeeId`
- [ ] Endpoint: `PUT /api/v1/training/plans/:id`
- [ ] Endpoint: `POST /api/v1/training/plans/:planId/complete-item/:itemIndex`
- [ ] Frontend: vista de plan personal con checklist de items
- [ ] Frontend: form admin para crear plan (agregar items de cada tipo)

---

## Slice 30 — Training Config Complete
**Rama:** `slice/30-training-config-singleton`

- [ ] Completar UI de configuración (si no se hizo en slice 24):
  - [ ] Editor de template de certificado (con preview de variables)
  - [ ] Upload de logo para certificados
  - [ ] Campos firma: nombre y cargo del firmante
  - [ ] Selector de días obligatorios (checkboxes L-V)
  - [ ] Input: horas mínimas por día
  - [ ] Toggle: usar festivos del calendario
  - [ ] Toggle: usar exenciones CSW
  - [ ] Multi-select: categorías CSW que eximen
- [ ] Preview en tiempo real del certificado con datos de ejemplo
- [ ] Validar que al menos 1 día obligatorio esté seleccionado
- [ ] Guardar y invalidar cache del singleton

---

## Slice 31 — Dashboard Encargado (Backend)
**Rama:** `slice/31-dashboard-encargado`

- [ ] Service: `dashboard.service.ts`
- [ ] Métricas: total empleados en capacitación
- [ ] Métricas: distribución por nivel actual (pie chart data)
- [ ] Métricas: tasa de aprobación de exámenes (% aprobados vs total)
- [ ] Métricas: horas totales de estudio del equipo (trimestre actual)
- [ ] Métricas: empleados que no han reportado esta semana
- [ ] Alertas: empleados que fallaron examen (necesitan reactivación)
- [ ] Alertas: exámenes pendientes de evaluación (open_text sin calificar)
- [ ] Alertas: empleados estancados (sin progreso en X semanas)
- [ ] Alertas: bonos trimestrales pendientes de pago
- [ ] Vista por empleado: progreso completo + historial
- [ ] Endpoint: `GET /api/v1/training/dashboard/overview`
- [ ] Endpoint: `GET /api/v1/training/dashboard/by-level`
- [ ] Endpoint: `GET /api/v1/training/dashboard/study-hours`
- [ ] Endpoint: `GET /api/v1/training/dashboard/alerts`
- [ ] Endpoint: `GET /api/v1/training/dashboard/employee/:id`
- [ ] Solo accesible con `training:manage` (D19: Oscar) o hat HUMAN TALENT (D20: Laura)

---

## Slice 32 — Navbar Badge Integration
**Rama:** `slice/32-navbar-badge-integration`

- [ ] Agregar campo `studyProgress` al schema de Employee
- [ ] Campos: `latestBadgeIcon`, `latestBadgeShape`, `latestBadgeColor`, `totalBadgesEarned`
- [ ] Service: actualizar `studyProgress` al obtener una insignia
- [ ] Frontend (navbar/header):
  - [ ] En el avatar del usuario: mostrar ícono de última insignia obtenida
  - [ ] Borde del avatar con el color de la insignia
  - [ ] Tooltip: nombre de la insignia al hover
- [ ] Frontend (perfil del usuario `/profile`):
  - [ ] Sección "Mis Insignias" — grid de BadgeIcon (color/gris)
  - [ ] Click en insignia → ver detalle (niveles, progreso)
- [ ] Frontend (detalle empleado — vista admin):
  - [ ] Sección Training: insignias + nivel actual + horas totales
- [ ] Endpoint: `GET /api/v1/auth/me` ya incluye `studyProgress` en Employee
- [ ] `data-test-*` annotations en componentes de insignia del navbar/perfil

---

## Slice 33 — Permissions Seed
**Rama:** `slice/33-permissions-seed`

- [ ] Script seed: crear permisos del módulo Training
  - [ ] `training:read` — Ver cursos, niveles, insignias, tabla de honor
  - [ ] `training:create` — Crear cursos, niveles, exámenes, insignias, documentos
  - [ ] `training:update` — Editar contenido de training y biblioteca
  - [ ] `training:delete` — Eliminar cursos/niveles/documentos
  - [ ] `training:manage` — Dashboard, evaluar exámenes, reactivar, bonos
  - [ ] `training:report` — Reportar horas de estudio
- [ ] Asignar `training:read` + `training:report` a TODOS los hats (todos estudian)
- [ ] Asignar `training:manage` + `training:create` + `training:update` + `training:delete` a:
  - [ ] Hat: QUALITY & TRAINING OFFICER (Oscar) — D19
  - [ ] Hat: HUMAN TALENT MANAGEMENT (Laura) — D20
- [ ] Verificar que las rutas usan los permisos correctos
- [ ] Script idempotente (no duplica si ya existen)

---

## Slice 34 — Frontend Dashboard UI
**Rama:** `slice/34-frontend-dashboard-ui`

- [ ] Store MobX: `TrainingDashboardStore.contract.ts` + `.live.ts`
- [ ] API Service: `trainingDashboard.ts`
- [ ] Página: `/training/admin/dashboard` — Dashboard del encargado
- [ ] Componente: `TrainingMetrics` — cards KPI (CrmMetrics del template)
  - [ ] Total empleados en training
  - [ ] Horas estudiadas este trimestre
  - [ ] Tasa de aprobación de exámenes
  - [ ] Empleados sin reporte esta semana
- [ ] Componente: `LevelDistributionChart` — pie chart distribución por nivel
- [ ] Componente: `StudyHoursChart` — bar chart horas por semana/mes
- [ ] Componente: `AlertsList` — lista de alertas con acciones
  - [ ] Exámenes pendientes de evaluación → link a evaluación
  - [ ] Empleados fallaron examen → botón reactivar
  - [ ] Sin reporte → link al empleado
  - [ ] Bonos pendientes → link a gestión bonos
- [ ] Componente: `EmployeeProgressTable` — tabla con búsqueda
  - [ ] Columnas: nombre, nivel actual, insignias, horas, último reporte
  - [ ] Click → vista detalle del empleado
- [ ] Sidebar: items del módulo Training
  - [ ] 📚 Biblioteca
  - [ ] 📖 Mi Progreso
  - [ ] 📝 Reportar Estudio
  - [ ] 🏆 Tabla de Honor
  - [ ] 🎓 Mis Certificados
  - [ ] ⚙️ Gestión (admin: cursos, niveles, insignias)
  - [ ] 📊 Dashboard (admin)
  - [ ] 📋 Evaluaciones Pendientes (admin)
  - [ ] 💰 Bonificaciones (admin)
  - [ ] 🔧 Configuración (admin)
- [ ] Mostrar/ocultar items admin según permisos
- [ ] `data-test-*` annotations en todo el dashboard
