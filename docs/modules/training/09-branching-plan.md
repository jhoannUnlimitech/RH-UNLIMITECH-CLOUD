# Plan de Branching — Módulo Training

## Estrategia de Ramas

Siguiendo el modelo de branching del proyecto:

```
develop
└── initiative/training-module
    ├── solution/training-phase-1 (Biblioteca + CRUD estructura)
    │   ├── slice/01-library-models
    │   ├── slice/02-library-categories-crud
    │   ├── slice/03-library-documents-crud
    │   ├── slice/04-library-editor-dual
    │   ├── slice/05-course-model-crud
    │   ├── slice/06-level-model-crud
    │   ├── slice/07-badge-model-crud
    │   └── slice/08-frontend-library-ui
    │
    ├── solution/training-phase-2 (Progreso + Exámenes)
    │   ├── slice/09-exam-model-crud
    │   ├── slice/10-exam-questions-reorder
    │   ├── slice/11-progress-model-init
    │   ├── slice/12-course-completion-flow
    │   ├── slice/13-exam-attempt-cache
    │   ├── slice/14-exam-evaluation-manual
    │   ├── slice/15-level-unlock-flow
    │   ├── slice/16-badge-completion
    │   ├── slice/17-extra-assignments
    │   └── slice/18-frontend-progress-ui
    │
    ├── solution/training-phase-3 (Reportes + Tabla de Honor)
    │   ├── slice/19-study-report-model
    │   ├── slice/20-report-form-ui
    │   ├── slice/21-calendar-csw-integration
    │   ├── slice/22-weekly-window-logic
    │   ├── slice/23-honor-table-quarterly
    │   ├── slice/24-bonus-ranges-config
    │   ├── slice/25-bonus-record-model
    │   └── slice/26-frontend-honor-table-ui
    │
    └── solution/training-phase-4 (Certificados + Dashboard)
        ├── slice/27-certificate-model
        ├── slice/28-pdf-generation
        ├── slice/29-study-plan-model
        ├── slice/30-training-config-singleton
        ├── slice/31-dashboard-encargado
        ├── slice/32-navbar-badge-integration
        ├── slice/33-permissions-seed
        └── slice/34-frontend-dashboard-ui
```

---

## Sprint 1 — Phase 1: Biblioteca + Estructura Formativa

**Branch:** `solution/training-phase-1`
**Duración estimada:** 2 semanas
**Objetivo:** Tener la biblioteca funcional + CRUD de cursos, niveles e insignias.

| Slice | Rama | Tareas | Backend | Frontend |
|-------|------|--------|---------|----------|
| 01 | `slice/01-library-models` | Crear modelos `LibraryCategory`, `LibraryDocument`, `LibraryDocumentVersion` + validators + seed de categorías base (Cursos, Políticas) | ✅ | — |
| 02 | `slice/02-library-categories-crud` | Endpoints CRUD categorías + sub-categorías jerárquicas + reorder | ✅ | — |
| 03 | `slice/03-library-documents-crud` | Endpoints CRUD documentos + versionado + búsqueda por título/tags | ✅ | — |
| 04 | `slice/04-library-editor-dual` | Instalar react-quill-new + turndown + react-markdown. Componente `DocumentEditor` con switch visual/markdown | — | ✅ |
| 05 | `slice/05-course-model-crud` | Modelo `Course` + service + controller + routes + validator | ✅ | — |
| 06 | `slice/06-level-model-crud` | Modelo `Level` + service + controller + routes + validator + reorder | ✅ | — |
| 07 | `slice/07-badge-model-crud` | Modelo `Badge` + service + controller + routes + validator. Instalar lucide-react. Componente `BadgeIcon` con shapes SVG | ✅ | ✅ |
| 08 | `slice/08-frontend-library-ui` | Páginas: Biblioteca (árbol categorías + docs), Gestión Cursos/Niveles/Insignias. Stores MobX (contract + live) | — | ✅ |

---

## Sprint 2 — Phase 2: Progreso + Exámenes

**Branch:** `solution/training-phase-2`
**Duración estimada:** 2.5 semanas
**Objetivo:** El empleado puede hacer cursos, presentar exámenes, obtener insignias.

| Slice | Rama | Tareas | Backend | Frontend |
|-------|------|--------|---------|----------|
| 09 | `slice/09-exam-model-crud` | Modelo `Exam` + service + CRUD + preguntas con tipos + `expectedAnswer` para evaluador | ✅ | — |
| 10 | `slice/10-exam-questions-reorder` | Endpoint reorder preguntas + UI con react-dnd para arrastrar preguntas | ✅ | ✅ |
| 11 | `slice/11-progress-model-init` | Modelo `EmployeeTrainingProgress` + auto-creación al crear empleado (D21) + campo `active` (D22) | ✅ | — |
| 12 | `slice/12-course-completion-flow` | Service de progreso: marcar curso completado → actualizar progress → verificar si nivel desbloquea examen | ✅ | — |
| 13 | `slice/13-exam-attempt-cache` | Modelo `ExamAttempt` + endpoint start/submit + lógica de cache (localStorage frontend + `cachedAnswers` backend) + popup confirmación | ✅ | ✅ |
| 14 | `slice/14-exam-evaluation-manual` | Dashboard evaluación: lista de exámenes pendientes + UI para calificar respuestas libres + feedback | ✅ | ✅ |
| 15 | `slice/15-level-unlock-flow` | ProgressOrchestrator: `EXAM_PASSED` → completar nivel → desbloquear siguiente automáticamente (D1/D2) | ✅ | — |
| 16 | `slice/16-badge-completion` | ProgressOrchestrator: `BADGE_EARNED` → actualizar `latestBadge` + `studyProgress` en Employee | ✅ | — |
| 17 | `slice/17-extra-assignments` | Modelo `ExtraAssignment` + service + CRUD + UI para asignar a personas/todos con prioridad (D4) | ✅ | ✅ |
| 18 | `slice/18-frontend-progress-ui` | Páginas: Mi Progreso (barras, insignias, curso actual), Vista Empleado (admin), Examen UI | — | ✅ |

---

## Sprint 3 — Phase 3: Reportes + Tabla de Honor

**Branch:** `solution/training-phase-3`
**Duración estimada:** 2 semanas
**Objetivo:** Reportes de estudio obligatorios + tabla de honor trimestral + bonificaciones.

| Slice | Rama | Tareas | Backend | Frontend |
|-------|------|--------|---------|----------|
| 19 | `slice/19-study-report-model` | Modelo `StudyReport` + service con lógica de ventana jue-mié (D9) + mínimo 1h/día (D8) | ✅ | — |
| 20 | `slice/20-report-form-ui` | Formulario reporte: seleccionar curso, horas, ¿terminaste?, ¿en qué parte? + validaciones | — | ✅ |
| 21 | `slice/21-calendar-csw-integration` | Integrar con CalendarEvent (festivos) y CSW (vacaciones) para marcar días exentos automáticamente | ✅ | — |
| 22 | `slice/22-weekly-window-logic` | Calcular semana activa, días obligatorios restantes, notificaciones de días sin reporte (D10) | ✅ | ✅ |
| 23 | `slice/23-honor-table-quarterly` | Service tabla de honor: aggregation trimestral, posiciones, excluir inactivos (D12/D22) | ✅ | — |
| 24 | `slice/24-bonus-ranges-config` | Modelo `TrainingConfig` (singleton) + CRUD config + UI de configuración de rangos (D13) | ✅ | ✅ |
| 25 | `slice/25-bonus-record-model` | Modelo `BonusRecord` + cálculo automático al cierre trimestre + status pending/paid | ✅ | — |
| 26 | `slice/26-frontend-honor-table-ui` | Páginas: Tabla de Honor (posiciones, rangos, bonos visibles D14), vista semanal del encargado | — | ✅ |

---

## Sprint 4 — Phase 4: Certificados + Dashboard

**Branch:** `solution/training-phase-4`
**Duración estimada:** 1.5 semanas
**Objetivo:** Certificados PDF, planes individuales, dashboard del encargado, integración navbar.

| Slice | Rama | Tareas | Backend | Frontend |
|-------|------|--------|---------|----------|
| 27 | `slice/27-certificate-model` | Modelo `Certificate` + service con template variables + tipo level/badge (D17) | ✅ | — |
| 28 | `slice/28-pdf-generation` | Generar PDF con jspdf: logo arriba, contenido centrado, firma abajo (D18) + endpoint descarga | ✅ | ✅ |
| 29 | `slice/29-study-plan-model` | Modelo `StudyPlan` + service + CRUD + completar items | ✅ | ✅ |
| 30 | `slice/30-training-config-singleton` | Completar config: template certificado, logo, firma, días obligatorios, moneda bonos | ✅ | ✅ |
| 31 | `slice/31-dashboard-encargado` | Endpoints dashboard: métricas, alertas, distribución por nivel, horas totales (D19/D20) | ✅ | — |
| 32 | `slice/32-navbar-badge-integration` | Mostrar última insignia en avatar del navbar + sección insignias en perfil | ✅ | ✅ |
| 33 | `slice/33-permissions-seed` | Script seed: crear permisos `training:*` + asignar a Oscar (QUALITY & TRAINING) y Laura (HUMAN TALENT) | ✅ | — |
| 34 | `slice/34-frontend-dashboard-ui` | Página dashboard encargado: KPIs, alertas, vista por empleado, bonos pendientes | — | ✅ |

---

## Resumen

| Fase | Slices | Duración | Entregable |
|------|--------|----------|-----------|
| Phase 1 | 8 slices (01-08) | ~2 semanas | Biblioteca funcional + CRUD formativo |
| Phase 2 | 10 slices (09-18) | ~2.5 semanas | Progreso completo + exámenes |
| Phase 3 | 8 slices (19-26) | ~2 semanas | Reportes + tabla de honor + bonos |
| Phase 4 | 8 slices (27-34) | ~1.5 semanas | Certificados + dashboard + integración |
| **Total** | **34 slices** | **~8 semanas** | **Módulo Training completo** |

---

## Flujo de trabajo por slice

```bash
# 1. Crear rama desde la solution
git checkout solution/training-phase-1
git checkout -b slice/01-library-models

# 2. Desarrollar
# ... commits con convención: feat(training): ..., fix(training): ...

# 3. Integrar a solution
git checkout solution/training-phase-1
git merge slice/01-library-models --no-edit
git push origin solution/training-phase-1
git branch -d slice/01-library-models

# 4. Al completar todos los slices de la fase:
git checkout develop
git merge solution/training-phase-1 --no-edit
git push origin develop
```

---

## Criterios de Done por Slice

- [ ] Modelo/Service/Controller implementados
- [ ] Validator Zod creado
- [ ] Endpoints documentados con JSDoc
- [ ] UI funcional con data-test-* annotations
- [ ] Sin errores TypeScript en el módulo
- [ ] Probado manualmente en el navegador
