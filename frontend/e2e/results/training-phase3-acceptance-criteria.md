# Criterios de Aceptación — Training Phase 3 (Reportes + Tabla de Honor)

**Rama:** `qa/training-phase-3`
**Última ejecución:** Pendiente

---

## Flujo 1: Reporte de Estudio (/training/report)

- [ ] AC-P3-01: Empleado ve formulario con fecha, curso, horas, completado
- [ ] AC-P3-02: Dropdown de cursos solo muestra cursos del nivel actual (searchable)
- [ ] AC-P3-03: POST /training/study-reports crea reporte
- [ ] AC-P3-04: Validación: no más de 12h por día
- [ ] AC-P3-05: Validación: mínimo 0.25h por entrada
- [ ] AC-P3-06: GET /training/study-reports/me devuelve reportes de la semana
- [ ] AC-P3-07: Resumen semanal muestra total horas con barra de progreso (mínimo 3h)

## Flujo 2: Pase de Lista (/training/admin/attendance)

- [ ] AC-P3-08: Admin ve tabla de empleados × días L/M/V
- [ ] AC-P3-09: GET /training/attendance devuelve todos los empleados activos
- [ ] AC-P3-10: Click en celda cicla: presente → ausente → exento → presente
- [ ] AC-P3-11: POST /training/attendance/mark guarda asistencia individual
- [ ] AC-P3-12: POST /training/attendance/bulk guarda día completo
- [ ] AC-P3-13: POST /training/attendance/exempt marca exención
- [ ] AC-P3-14: Navegación de semana (← →) funciona
- [ ] AC-P3-15: Los días obligatorios vienen de SystemConfig.studyDays
- [ ] AC-P3-16: Festivos del calendario bloquean el pase de lista

## Flujo 3: Tabla de Honor (/training/honor-table)

- [ ] AC-P3-17: GET /training/honor-table/current devuelve ranking del trimestre actual
- [ ] AC-P3-18: GET /training/honor-table/:year/:quarter devuelve trimestre específico
- [ ] AC-P3-19: Ranking ordenado por totalHours descendente
- [ ] AC-P3-20: Incluye: position, employee, totalHours, averagePerWeek, aboveMinimum
- [ ] AC-P3-21: Navegación por trimestre (← →) funciona en UI
- [ ] AC-P3-22: Stats cards muestran participantes, mínimo semanal, mínimo trimestral

## Flujo 4: Bonificaciones — Rangos (CRUD)

- [ ] AC-P3-23: GET /training/bonuses/ranges devuelve rangos activos
- [ ] AC-P3-24: POST /training/bonuses/ranges crea un rango nuevo
- [ ] AC-P3-25: PUT /training/bonuses/ranges/:id actualiza rango
- [ ] AC-P3-26: DELETE /training/bonuses/ranges/:id desactiva rango
- [ ] AC-P3-27: Rango tiene: name, minHours, maxHours, prizeType, prizeDescription, color

## Flujo 5: Bonificaciones — Cálculo y Pago

- [ ] AC-P3-28: POST /training/bonuses/calculate calcula bonos del trimestre
- [ ] AC-P3-29: GET /training/bonuses/pending devuelve bonos sin pagar
- [ ] AC-P3-30: PUT /training/bonuses/:id/pay marca como pagado
- [ ] AC-P3-31: GET /training/bonuses/me devuelve bonos del empleado logueado

## Flujo 6: Configuración del Sistema (/settings)

- [ ] AC-P3-32: GET /config devuelve configuración completa
- [ ] AC-P3-33: PUT /config/general actualiza timezone, locale, companyName
- [ ] AC-P3-34: PUT /config/schedule actualiza workDays, studyDays, horario
- [ ] AC-P3-35: PUT /config/training actualiza minWeeklyHours, examPassingScore
- [ ] AC-P3-36: PUT /config/notifications actualiza retentionDays, emailEnabled
- [ ] AC-P3-37: Página /settings muestra 4 tabs (General, Horario, Training, Notificaciones)

## Flujo 7: Permisos Phase 3

- [ ] AC-P3-38: Solo training:manage puede acceder a /training/admin/attendance
- [ ] AC-P3-39: Solo training:manage puede acceder a /training/admin/bonuses
- [ ] AC-P3-40: Todos con training:read pueden ver /training/honor-table
- [ ] AC-P3-41: Solo training:manage puede modificar /config/*
- [ ] AC-P3-42: Todos autenticados pueden leer GET /config

---

## Resumen

| Flujo | ACs |
|-------|-----|
| 1. Reporte de Estudio | 7 |
| 2. Pase de Lista | 9 |
| 3. Tabla de Honor | 6 |
| 4. Bonificaciones (Rangos) | 5 |
| 5. Bonificaciones (Cálculo) | 4 |
| 6. Configuración del Sistema | 6 |
| 7. Permisos | 5 |
| **Total** | **42** |
