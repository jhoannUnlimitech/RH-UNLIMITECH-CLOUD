# Checklist — Phase 3: Reportes + Tabla de Honor

**Branch:** `solution/training-phase-3`
**Estado:** 📋 Pendiente

---

## Slice 19 — Study Report Model
**Rama:** `slice/19-study-report-model`

- [ ] Modelo `StudyReport` (schema + interface + `IStudyReportEntry` + índices)
- [ ] Campos: `weekStart` (jueves), `weekEnd` (miércoles) — D9
- [ ] Campo: `quarter` (1-4) calculado automáticamente
- [ ] Campo: `totalSeconds` para ordenamiento preciso
- [ ] Índice unique: `{ employee: 1, date: 1 }`
- [ ] Índice: `{ quarter: 1, year: 1, totalSeconds: -1 }` (tabla de honor)
- [ ] Validator Zod: `report.validator.ts`
- [ ] Validar: `totalHours >= 1` por día obligatorio (D8)
- [ ] Validar: `totalHours <= 12` máximo por día
- [ ] Validar: solo cursos del sistema (D11)
- [ ] Validar: fecha dentro de ventana activa jue-mié (D9)

---

## Slice 20 — Report Form UI
**Rama:** `slice/20-report-form-ui`

- [ ] Formulario reporte de estudio
- [ ] Campo: Fecha (readonly, default hoy, solo dentro de ventana)
- [ ] Campo: Seleccionar curso (del nivel actual del empleado)
- [ ] Campo: Horas dedicadas (number, step 0.25, min 0.25, max 12)
- [ ] Campo: ¿Terminaste el curso? (toggle switch)
- [ ] Campo: ¿En qué parte quedaste? (textarea, requerido si no terminó)
- [ ] Botón: [+ Agregar otro curso] (múltiples entries por día)
- [ ] Campo: Observaciones generales (textarea, opcional, max 500)
- [ ] Mostrar: Total del día (suma de horas)
- [ ] Al marcar "terminé curso" → disparar completeCourse en el service
- [ ] Validar mínimo 1h en días obligatorios (D8)
- [ ] Store MobX: `ReportsStore.contract.ts` + `ReportsStore.live.ts`
- [ ] Página: `/training/report` — Formulario de reporte diario
- [ ] Página: `/training/my-reports` — Historial de mis reportes por semana
- [ ] `data-test-*` annotations

---

## Slice 21 — Calendar + CSW Integration
**Rama:** `slice/21-calendar-csw-integration`

- [ ] Service: `getExemptDays(employeeId, weekStart, weekEnd)`
- [ ] Consultar CalendarEvent type='holiday' en el rango de la semana
- [ ] Consultar CSW aprobados categoría "Vacaciones" o "Permiso" que cubran el día
- [ ] Marcar días como `isExempt: true` + `exemptReason`
- [ ] Respetar `TrainingConfig.useCalendarHolidays` y `useCSWExemptions`
- [ ] Respetar `TrainingConfig.cswExemptCategories`
- [ ] Calcular días obligatorios reales de la semana (L/M/V minus exentos)
- [ ] Endpoint: `GET /api/v1/training/reports/obligatory-days?week=&year=`

---

## Slice 22 — Weekly Window Logic
**Rama:** `slice/22-weekly-window-logic`

- [ ] Service: `getCurrentWeekWindow()` → { weekStart (jue), weekEnd (mié) }
- [ ] Service: `getWeekStatus(employeeId)` → días reportados, faltantes, exentos
- [ ] Service: `getMissingReports()` → empleados sin reporte en días obligatorios
- [ ] Notificación: al empleado si no ha reportado un día obligatorio (D10)
- [ ] Dashboard empleado: indicador visual de días sin reportar
- [ ] Frontend: vista semanal con columnas L/M/V: ✅/❌/⬜
- [ ] Endpoint: `GET /api/v1/training/reports/me/week/:year/:week`
- [ ] Endpoint: `GET /api/v1/training/reports/weekly-summary` (encargado)
- [ ] Endpoint: `GET /api/v1/training/reports/missing` (encargado)
- [ ] Endpoint: `POST /api/v1/training/reports/exempt-day` (encargado: eximir día para todos)

---

## Slice 23 — Honor Table Quarterly
**Rama:** `slice/23-honor-table-quarterly`

- [ ] Service: `getHonorTable(quarter, year)`
- [ ] Aggregation: sumar `totalSeconds` por empleado en el trimestre
- [ ] Excluir empleados con `EmployeeTrainingProgress.active: false` (D22)
- [ ] Filtrar: solo empleados con >= 1 minuto adicional sobre mínimo trimestral
- [ ] Ordenar: por `totalSeconds` descendente
- [ ] Asignar posiciones: 1°, 2°, 3°...
- [ ] Formatear horas: segundos → HH:MM para display
- [ ] Endpoint: `GET /api/v1/training/honor-table/current`
- [ ] Endpoint: `GET /api/v1/training/honor-table/quarter/:year/:quarter`
- [ ] Respuesta incluye: posición, empleado, horas, rango, bono (D14: visible para todos)

---

## Slice 24 — Bonus Ranges Config
**Rama:** `slice/24-bonus-ranges-config`

- [ ] Modelo `TrainingConfig` (schema + interface + singleton)
- [ ] Campos: `requiredDays`, `minDailyHours`, `minWeeklyHours`
- [ ] Campos: `reportWindowStart` (4=jue), `reportWindowEnd` (3=mié)
- [ ] Campos: `useCalendarHolidays`, `useCSWExemptions`, `cswExemptCategories`
- [ ] Campos: `bonusRanges[]` con `prizeType`, `prizeAmount`, `prizeCurrency`
- [ ] Campos: `certificateTemplate`, `certificateLogoUrl`, `certificateSignatureName`, `certificateSignatureRole`
- [ ] Service singleton con cache TTL 1 minuto
- [ ] Endpoint: `GET /api/v1/training/config`
- [ ] Endpoint: `PUT /api/v1/training/config`
- [ ] Endpoint: `PUT /api/v1/training/config/bonus-ranges`
- [ ] Frontend: página `/training/admin/config` — formulario de configuración
- [ ] UI: tabla editable de rangos de bonificación (minHours, maxHours, nombre, premio, monto)
- [ ] Seed: crear config inicial con valores por defecto

---

## Slice 25 — Bonus Record Model
**Rama:** `slice/25-bonus-record-model`

- [ ] Modelo `BonusRecord` (schema + interface + índices)
- [ ] Índice unique: `{ employee: 1, quarter: 1, year: 1 }`
- [ ] Service: `calculateQuarterlyBonuses(quarter, year)`
- [ ] Tomar total de horas de cada empleado activo en el trimestre
- [ ] Asignar rango según `TrainingConfig.bonusRanges`
- [ ] Crear `BonusRecord` con status `'pending'` (monetario) o `'acknowledged'` (simbólico)
- [ ] Snapshot del rango (desnormalizado) al momento del cálculo
- [ ] Service: `markAsPaid(bonusId, paidBy)` → cambiar status a `'paid'`
- [ ] Endpoint: `GET /api/v1/training/bonuses/quarter/:year/:quarter`
- [ ] Endpoint: `GET /api/v1/training/bonuses/pending` (bonos sin pagar)
- [ ] Endpoint: `PUT /api/v1/training/bonuses/:id/pay`
- [ ] Calcular automáticamente al inicio de nuevo trimestre (o manualmente por encargado)

---

## Slice 26 — Frontend Honor Table UI
**Rama:** `slice/26-frontend-honor-table-ui`

- [ ] Store MobX: `HonorTableStore.contract.ts` + `HonorTableStore.live.ts`
- [ ] API Service: `honorTable.ts`, `bonuses.ts`
- [ ] Página: `/training/honor-table` — Tabla de honor trimestral
- [ ] Componente: `HonorTableRow` — posición, avatar, nombre, horas, rango, bono
- [ ] Top 3 con medallas/destacado visual (🥇🥈🥉)
- [ ] Selector de trimestre (Q1-Q4 del año actual y anteriores)
- [ ] Mostrar rango y monto de bono de cada persona (D14)
- [ ] Página: `/training/admin/bonuses` — Gestión de bonos pendientes de pago
- [ ] Tabla: empleado, trimestre, rango, monto, status, botón "Marcar pagado"
- [ ] Componente: `BonusRangeCard` — card visual por rango (PriceTable del template)
- [ ] `data-test-*` annotations
