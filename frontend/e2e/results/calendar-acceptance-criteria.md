# Acceptance Criteria — Módulo Calendario

## A. Vista Calendario

| AC | Descripción | Status |
|----|-------------|--------|
| AC-CAL-01 | Navegar a `/calendar` muestra calendario FullCalendar | ✅ Pass |
| AC-CAL-02 | Toolbar de navegación (mes/semana/día) visible | ✅ Pass |
| AC-CAL-03 | Festivos de Colombia y US se cargan automáticamente | ✅ Pass |
| AC-CAL-04 | Eventos se muestran en el calendario como bloques de color | ✅ Pass |

## B. Lista de Eventos

| AC | Descripción | Status |
|----|-------------|--------|
| AC-CAL-05 | Navegar a `/calendar/events` muestra tabla de eventos | ✅ Pass |
| AC-CAL-06 | Tabla muestra: título, tipo, fecha, color | ✅ Pass |
| AC-CAL-07 | Crear evento via API aparece en la lista | ✅ Pass |
| AC-CAL-08 | Eliminar evento via API lo remueve de la lista | ✅ Pass |

## C. CRUD Eventos

| AC | Descripción | Status |
|----|-------------|--------|
| AC-CAL-09 | Crear evento con título, fecha inicio/fin, tipo, color | ✅ Pass |
| AC-CAL-10 | Evento creado visible en tabla después de reload | ✅ Pass |
| AC-CAL-11 | Eliminar evento (soft delete) | ✅ Pass |
| AC-CAL-12 | Evento eliminado no aparece en lista | ✅ Pass |

## D. Anotaciones data-test-*

| AC | Descripción | Status |
|----|-------------|--------|
| AC-CAL-13 | `data-test-context="calendar-page"` | ✅ Pass |
| AC-CAL-14 | `data-test-context="events-list"` | ✅ Pass |

---

## Status

| Sección | ACs | Pass | Pending |
|---------|-----|------|---------|
| A. Vista Calendario | 4 | 4 | 0 |
| B. Lista de Eventos | 4 | 4 | 0 |
| C. CRUD Eventos | 4 | 4 | 0 |
| D. Anotaciones | 2 | 2 | 0 |
| **Total** | **14** | **14** | **0** |

## Tests

- `calendar-all.spec.ts`: 10 tests ✅
