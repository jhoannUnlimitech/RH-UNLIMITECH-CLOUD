# Acceptance Criteria — Dashboard

## A. Contenido Principal

| AC | Descripción | Status |
|----|-------------|--------|
| AC-DASH-01 | Navegar a `/` muestra el dashboard | ✅ Pass |
| AC-DASH-02 | Mensaje de bienvenida con nombre del usuario | ✅ Pass |
| AC-DASH-03 | Info muestra hat y división del usuario | ✅ Pass |
| AC-DASH-04 | Cards de estadísticas CSW visibles (total/pendientes/aprobadas/rechazadas) | ✅ Pass |
| AC-DASH-05 | Sección "Mi División" visible | ✅ Pass |
| AC-DASH-06 | Quick links funcionales (navegan correctamente) | ✅ Pass |
| AC-DASH-07 | No muestra errores | ✅ Pass |

## B. Anotaciones data-test-*

| AC | Descripción | Status |
|----|-------------|--------|
| AC-DASH-08 | `data-test-context="dashboard"` | ✅ Pass |
| AC-DASH-09 | `data-test-key="welcome-title"` | ✅ Pass |
| AC-DASH-10 | `data-test-key="user-info"` | ✅ Pass |

---

## Status

| Sección | ACs | Pass |
|---------|-----|------|
| A. Contenido | 7 | 7 |
| B. Anotaciones | 3 | 3 |
| **Total** | **10** | **10** |

## Tests

- `dashboard.spec.ts`: 8 tests ✅
