# Criterios de Aceptación — Training Phase 4 (Certificados + Dashboard)

**Rama:** `qa/training-phase-4`
**Última ejecución:** Pendiente

---

## Flujo 1: Dashboard Admin Backend

- [ ] AC-P4-01: GET /training/dashboard/overview devuelve KPIs
- [ ] AC-P4-02: Overview incluye: totalEmployeesInTraining, examPassRate, pendingEvaluations
- [ ] AC-P4-03: GET /training/dashboard/by-level devuelve distribución por nivel
- [ ] AC-P4-04: Distribución incluye: levelName, count, percentage
- [ ] AC-P4-05: GET /training/dashboard/study-hours devuelve horas por semana
- [ ] AC-P4-06: GET /training/dashboard/alerts devuelve alertas accionables
- [ ] AC-P4-07: Alertas ordenadas por severity (high → medium → low)
- [ ] AC-P4-08: GET /training/dashboard/employee/:id devuelve detalle de un empleado

## Flujo 2: Dashboard Admin Frontend

- [ ] AC-P4-09: Página /training/admin/dashboard carga sin errores
- [ ] AC-P4-10: Muestra 4 KPI cards (empleados, horas, tasa aprobación, sin reporte)
- [ ] AC-P4-11: Muestra sección "Distribución por Nivel" con barras
- [ ] AC-P4-12: Muestra sección "Horas de Estudio por Semana"
- [ ] AC-P4-13: Muestra sección "Alertas" con conteo
- [ ] AC-P4-14: Muestra KPIs secundarios (evaluaciones pendientes, niveles completados)

## Flujo 3: Certificados Backend

- [ ] AC-P4-15: GET /training/certificates/me devuelve array de certificados
- [ ] AC-P4-16: GET /training/certificates/:id devuelve detalle de un certificado
- [ ] AC-P4-17: GET /training/certificates/:id/download devuelve PDF o datos
- [ ] AC-P4-18: POST /training/certificates/:id/regenerate regenera el certificado (admin)
- [ ] AC-P4-19: Certificate tiene: employee, type, title, variables, issuedAt

## Flujo 4: Certificados Frontend

- [ ] AC-P4-20: Página /training/certificates carga sin errores
- [ ] AC-P4-21: Muestra mensaje "sin certificados" cuando no hay
- [ ] AC-P4-22: Cada certificado muestra tipo (nivel/insignia), título, fecha

## Flujo 5: Permisos Phase 4

- [ ] AC-P4-23: Solo training:manage accede a /training/admin/dashboard
- [ ] AC-P4-24: Dashboard endpoints requieren training:manage
- [ ] AC-P4-25: Certificados /me accesible con training:read
- [ ] AC-P4-26: Regenerate requiere training:manage

---

## Resumen

| Flujo | ACs |
|-------|-----|
| 1. Dashboard Backend | 8 |
| 2. Dashboard Frontend | 6 |
| 3. Certificados Backend | 5 |
| 4. Certificados Frontend | 3 |
| 5. Permisos | 4 |
| **Total** | **26** |
