# Criterios de Aceptación — Training Phase 2 (Progreso + Exámenes)

**Última ejecución:** 29 de Julio de 2026
**Resultado:** 40 passing ✅ | 9 skipped ⏭️ | 0 failed

---

## Rutas testeadas

| Ruta | Rol requerido | Descripción |
|------|---------------|-------------|
| `/training/manage` | training:manage | Gestión Badges/Levels/Courses/Exams (4 tabs) |
| `/training/manage/exams/new` | training:manage | Crear examen con preguntas |
| `/training/manage/exams/edit/:id` | training:manage | Editar examen existente |
| `/training/my-progress` | training:read | Mi progreso (badges, nivel, cursos) |

## Usuarios de prueba

| Usuario | Hat | Permisos Training |
|---------|-----|-------------------|
| admin@unlimitech.cloud (Manuel) | FOUNDER & SOLUTIONS ARCHITECT | manage, content, read, report, delete |

---

## Flujo 1: Gestión de Insignias (Tab Insignias en /training/manage)

- [x] AC-01: Admin ve lista de insignias del seed ✅
- [x] AC-02: Admin crea nueva insignia con nombre, descripción, ícono, forma, color ✅
- [x] AC-03: Insignia creada aparece en la grid ✅
- [x] AC-04: Admin edita una insignia (nombre, color) ✅ (via API + verifica UI)
- [x] AC-05: Admin elimina insignia ✅ (via API)
- [x] AC-06: Insignia eliminada desaparece de la grid ✅ (via API)

**Spec:** `training-manage.spec.ts` | **Tests:** 6

---

## Flujo 2: Gestión de Niveles (Tab Niveles)

- [x] AC-07: Admin ve tabla de niveles — switch a tab Niveles ✅
- [x] AC-08: Admin crea nuevo nivel asociado a una insignia ✅
- [x] AC-09: Nivel creado aparece en la tabla ✅
- [ ] AC-10: Admin edita un nivel (nombre, orden) — no testeado explícitamente
- [x] AC-11: Admin elimina un nivel con confirmación ✅

**Spec:** `training-manage.spec.ts` | **Tests:** 4

---

## Flujo 3: Gestión de Cursos (Tab Cursos)

- [x] AC-12: Admin ve tabla de cursos — switch a tab Cursos ✅
- [x] AC-13: Admin crea nuevo curso asociado a un nivel y documento ✅
- [x] AC-14: Curso creado aparece en la tabla ✅
- [ ] AC-15: Admin edita un curso — no testeado explícitamente
- [x] AC-16: Admin elimina un curso con confirmación ✅

**Spec:** `training-manage.spec.ts` | **Tests:** 4

---

## Flujo 4: Gestión de Exámenes (Tab Exámenes)

- [x] AC-17: Admin crea examen con preguntas via API ✅
- [ ] AC-18: Admin navega a /training/manage/exams/new desde botón
- [ ] AC-19: Admin llena datos generales (título, asociación nivel/curso, %, intentos)
- [ ] AC-20: Admin agrega pregunta de selección múltiple con opciones
- [ ] AC-21: Admin marca exactamente 1 opción como correcta
- [ ] AC-22: Admin agrega pregunta de respuesta libre
- [ ] AC-23: Admin reordena preguntas con flechas ↑↓
- [ ] AC-24: Admin reordena preguntas con drag & drop
- [ ] AC-25: Admin guarda examen → redirect a /training/manage
- [ ] AC-26: Examen creado aparece en la lista del tab Exámenes
- [ ] AC-27: Admin edita examen existente
- [ ] AC-28: Admin elimina examen con DeleteConfirmModal
- [x] AC-29: Default % aprobación es 80% ✅ (verificado en API payload)
- [x] AC-30: Asociar examen a nivel ✅ (via API: level field)

**Spec:** `training-api-progress.spec.ts` (setup steps) | **Tests:** 3 directos

---

## Flujo 5: Progreso del Empleado (/training/my-progress)

- [ ] AC-31: Empleado ve sus insignias
- [ ] AC-32: Empleado ve su nivel actual
- [ ] AC-33: Empleado ve lista de cursos del nivel
- [ ] AC-34: Empleado marca curso como completado
- [ ] AC-35: Curso marcado aparece con checkmark
- [ ] AC-36: Al completar todos los cursos → examen disponible
- [ ] AC-37: Empleado ve timeline de niveles
- [ ] AC-38: Empleado ve total de horas de estudio

**Status:** No testeado en E2E (requiere navegación UI en /training/my-progress)

---

## Flujo 6: Asignaciones Extraordinarias

- [ ] AC-39: Asignaciones pendientes arriba de cursos
- [ ] AC-40: Asignaciones muestran prioridad visual
- [ ] AC-41: Empleado completa asignación → desaparece
- [ ] AC-42: Admin crea asignación para empleado
- [ ] AC-43: Admin crea asignación para todos

**Status:** No testeado (funcionalidad implementada pero sin E2E)

---

## Flujo 7: Tomar Examen (API-level)

- [ ] AC-44: POST /exam-attempts/:examId/start → crea intento in_progress ⏭️ SKIP
- [ ] AC-45: No puede iniciar si agotó intentos ⏭️ SKIP
- [ ] AC-46: No puede iniciar si nivel no está en exam_pending
- [ ] AC-47: PUT /exam-attempts/:attemptId/cache → guarda respuestas ⏭️ SKIP
- [ ] AC-48: PUT /exam-attempts/:attemptId/submit → evalúa MC ⏭️ SKIP
- [ ] AC-49: Submit con solo MC → resultado inmediato
- [ ] AC-50: Submit con open_text → status pending_evaluation
- [ ] AC-51: Cache se limpia al hacer submit
- [ ] AC-52: Notificación al empleado cuando examen es evaluado

**Status:** ⏭️ SKIPPED — Requiere empleado con progress que contenga cursos E2E
**Causa:** El admin tiene progress inicializado con cursos del seed, no los E2E
**Solución:** Crear fixture con empleado temporal cuyo progress incluya cursos E2E

---

## Flujo 8: Evaluación Manual (API-level)

- [ ] AC-53: GET /exam-attempts/pending-evaluation → lista intentos pendientes
- [ ] AC-54: PUT /exam-attempts/:id/evaluate → puntúa pregunta open_text
- [ ] AC-55: PUT /exam-attempts/:id/complete-evaluation → resultado final
- [ ] AC-56: Si aprueba → nivel completado + siguiente desbloqueado
- [ ] AC-57: Si reprueba → status failed
- [ ] AC-58: Notificación a admins cuando hay examen pendiente

**Status:** No testeado (depende de AC-44 a AC-48)

---

## Flujo 9: Course Completion Flow (API-level)

- [ ] AC-59: POST /progress/complete-course/:courseId ⏭️ SKIP
- [ ] AC-60: Valida que curso pertenece al nivel actual ⏭️ SKIP
- [ ] AC-61: Valida que curso no estaba ya completado ⏭️ SKIP
- [ ] AC-62: Suma horas estimadas al totalStudyHours
- [ ] AC-63: Todos completados + examen → exam_pending ⏭️ SKIP
- [ ] AC-64: Todos completados + sin examen → nivel completado
- [ ] AC-65: Nivel completado → desbloquea siguiente ⏭️ SKIP
- [ ] AC-66: Todos niveles de insignia → badge earned

**Status:** ⏭️ SKIPPED — Mismo problema que Flujo 7

---

## Flujo 10: Notificaciones

- [x] AC-67: Bell icon muestra badge con conteo ✅
- [x] AC-68: Dropdown muestra notificaciones reales ✅
- [ ] AC-69: Click en notificación → marca leída + navega
- [x] AC-70: "Marcar todas leídas" botón existe ✅
- [x] AC-71: Notifications API retorna datos válidos ✅
- [x] AC-72: Notificación CSW aprobado puede crearse ✅
- [ ] AC-73: Notificación al rechazar CSW
- [ ] AC-74: Notificación al siguiente aprobador

**Spec:** `training-permissions.spec.ts` | **Tests:** 5

---

## Flujo 11: Permisos Training Phase 2

- [x] AC-75: Solo training:manage puede acceder a /training/manage ✅
- [x] AC-76: training:manage puede CRUD badges via API ✅
- [x] AC-77: training:read puede ver /training/my-progress ✅
- [ ] AC-78: Todos con training:read pueden tomar exámenes
- [x] AC-79: Solo training:manage puede evaluar exámenes (endpoint accesible) ✅
- [ ] AC-80: Solo training:manage puede crear asignaciones

**Spec:** `training-permissions.spec.ts` | **Tests:** 5

---

## Resumen de Ejecución

| Flujo | ACs Total | Passing | Skipped | No testeado |
|-------|-----------|---------|---------|-------------|
| 1. Insignias CRUD | 6 | 6 ✅ | 0 | 0 |
| 2. Niveles CRUD | 5 | 4 ✅ | 0 | 1 |
| 3. Cursos CRUD | 5 | 4 ✅ | 0 | 1 |
| 4. Exámenes CRUD | 14 | 3 ✅ | 0 | 11 |
| 5. Progreso UI | 8 | 0 | 0 | 8 |
| 6. Asignaciones | 5 | 0 | 0 | 5 |
| 7. Tomar Examen | 9 | 0 | 5 ⏭️ | 4 |
| 8. Evaluación Manual | 6 | 0 | 0 | 6 |
| 9. Course Completion | 8 | 0 | 4 ⏭️ | 4 |
| 10. Notificaciones | 8 | 5 ✅ | 0 | 3 |
| 11. Permisos | 6 | 5 ✅ | 0 | 1 |
| **Total** | **80** | **27 ✅** | **9 ⏭️** | **44** |

### Tests en specs que pasan

| Spec | Tests Passing |
|------|--------------|
| `training-manage.spec.ts` | 15 (login + nav + cleanup + 12 ACs) |
| `training-api-progress.spec.ts` | 15 (cleanup + login + setup + exam creation) |
| `training-permissions.spec.ts` | 10 (login + routes + notifications + APIs) |
| **Total ejecutados** | **40 passing** |

---

## Diagnóstico de los 9 Skipped

**Causa raíz:** `EmployeeTrainingProgress` se inicializa una sola vez al crear el empleado. Carga los badges/levels/courses activos en BD **en ese momento**. Los cursos E2E se crean después, así que no están en el progress del admin.

**Impacto:** Los tests de progress lifecycle (completar curso → exam pending → tomar examen → pasar → unlock level) no se pueden ejecutar con el usuario admin del seed.

**Solución propuesta:**
1. Crear script `seed-e2e-employee.ts` que cree un empleado temporal
2. El script espera a que los cursos E2E existan en BD
3. Inicializa progress para ese empleado (incluye cursos E2E)
4. Los tests corren con ese empleado
5. Cleanup al final elimina el empleado

**Prioridad:** Media — La lógica de progress/exams está probada manualmente y funciona. La automatización requiere infraestructura de test adicional.

---

## Comando de Ejecución

```bash
cd frontend
CDP_ENDPOINT=http://127.0.0.1:9223 npx playwright test --config=e2e/playwright.config.ts \
  e2e/specs/happy-path/training-manage.spec.ts \
  e2e/specs/happy-path/training-api-progress.spec.ts \
  e2e/specs/happy-path/training-permissions.spec.ts \
  --reporter=list
```

**Tiempo de ejecución:** ~30 segundos
