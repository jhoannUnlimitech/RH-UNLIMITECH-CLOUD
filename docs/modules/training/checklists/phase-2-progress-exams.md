# Checklist — Phase 2: Progreso + Exámenes

**Branch:** `solution/training-phase-2`
**Estado:** � En progreso (Slices 09, 11 completados + refactor permisos)

---

## Slice 09 — Exam Model CRUD ✅
**Rama:** `solution/training-phase-2` (commit `de6ac95` + `09f26f8`)

- [x] Modelo `Exam` (schema + interface + `IExamQuestion` + índices)
- [x] Campo `expectedAnswer` en preguntas open_text (guía para evaluador D7)
- [x] Sin campo `timeLimitMinutes` (D6: sin tiempo límite)
- [x] `maxAttempts` default: 1 (D5)
- [x] Campo `assignedTo: ObjectId[]` para asignación a empleados específicos
- [x] Validator Zod: `exam.validator.ts` (create, update, reorderQuestions)
- [x] Service: `exams.service.ts` — create, update, delete, getByLevel, assignToEmployee, getMyExams
- [x] Validar que opciones de multiple_choice tengan exactamente 1 correcta
- [x] Controller + Routes
- [x] Endpoint: `GET /api/v1/training/exams` (list, filtros level/active)
- [x] Endpoint: `GET /api/v1/training/exams/me` (mis exámenes asignados, sin respuestas)
- [x] Endpoint: `GET /api/v1/training/exams/:id` (sin `isCorrect` para empleados sin manage)
- [x] Endpoint: `POST /api/v1/training/exams`
- [x] Endpoint: `PUT /api/v1/training/exams/:id`
- [x] Endpoint: `PUT /api/v1/training/exams/:id/reorder-questions`
- [x] Endpoint: `POST /api/v1/training/exams/:id/assign/:employeeId`
- [x] Endpoint: `DELETE /api/v1/training/exams/:id`
- [x] Permisos: `training:manage` para CRUD, `training:read` para ver

**Nota:** No hay UI/frontend para exámenes en este slice. La UI del CRUD de exámenes se implementará como parte del TrainingManage (Slice 18) o un slice dedicado.

---

## Slice 10 — Exam Questions Reorder + UI Gestión ✅
**Rama:** `slice/10-exam-questions-reorder` (commits `030fefb` → `9fdc5b7`)

- [x] Endpoint: `PUT /api/v1/training/exams/:id/reorder-questions` (ya en Slice 09)
- [x] Body: `{ questions: [{ order: number }] }` (nuevo orden)
- [x] Service: reorderQuestions con validación de cantidad
- [x] UI: TrainingManage.tsx — 4 tabs funcionales (Insignias/Niveles/Cursos/Exámenes)
- [x] UI: ExamForm.tsx — Crear/Editar examen con preguntas dinámicas
- [x] UI: Asociación flexible (nivel, curso o documento)
- [x] UI: Default 80% aprobación
- [x] Flechas ↑↓ para reordenar preguntas
- [x] Preguntas multiple_choice: opciones con radio correcta
- [x] Preguntas open_text: campo expectedAnswer para evaluador
- [x] `data-test-*` annotations en todos los elementos
- [x] API Service frontend: métodos exams completos
- [x] Rutas: /training/manage/exams/new y /training/manage/exams/edit/:id
- [ ] React-dnd drag & drop (implementado con flechas ↑↓, drag pendiente como mejora futura)
- [ ] Feedback visual al arrastrar (mejora futura)

---

## Slice 11 — Progress Model + Auto-init ✅
**Rama:** `solution/training-phase-2` (commit `134c1d9`)

- [x] Modelo `EmployeeTrainingProgress` (schema + interface + subdocuments)
- [x] Campo `active: boolean` (D22: false si empleado inactivo)
- [x] Hook: al crear Employee → crear EmployeeTrainingProgress automáticamente (D21)
- [ ] Hook: al suspender Employee → marcar progress `active: false` (D22)
- [ ] Hook: al reactivar Employee → marcar progress `active: true`
- [x] Inicializar con primer badge/nivel disponible como `currentLevel`
- [x] Service: `progress.service.ts` — getMyProgress, getProgressByEmployee, activate, deactivate
- [x] Endpoint: `GET /api/v1/training/progress/me`
- [x] Endpoint: `GET /api/v1/training/progress/:employeeId`

**Pendiente:** Los hooks de suspender/reactivar requieren modificar el Employee controller (employees.controller.ts) para que al cambiar el status del empleado llame a progressService.activate/deactivate.

---

## Refactor: Modelo de Permisos Unificado ✅
**Commit:** `09f26f8`

Permisos del módulo Training reorganizados:

| Acción | Quién | Ámbito |
|--------|-------|--------|
| `read` | Todos | Ver biblioteca, progreso propio, exámenes asignados |
| `report` | Todos | Reportar horas de estudio |
| `content` | Gestores contenido | CRUD biblioteca (docs + categorías) |
| `manage` | Admin Training | CRUD cursos/niveles/badges/exámenes + asignar + evaluar |
| `delete` | Admin | Eliminación permanente (hard delete) |

- [x] Permission model: action enum extendido con `content`
- [x] Rutas courses/levels/badges/exams: `manage` para escritura
- [x] Rutas library: `content` para escritura
- [x] Frontend: PermissionRoute + Sidebar actualizados
- [x] Migración: script `add-training-permissions.ts` ejecutado

---

## Slice 12 — Course Completion Flow
**Rama:** `slice/12-course-completion-flow`

- [ ] Service: `completeCourse(employeeId, courseId)`
- [ ] Validar: curso pertenece al nivel actual del empleado
- [ ] Validar: curso no estaba ya completado
- [ ] Actualizar: `ICourseProgress.status = 'completed'`, `completedAt`
- [ ] Sumar horas al `totalStudyHours`
- [ ] Verificar: ¿todos los cursos del nivel completados? → cambiar nivel a `exam_pending`
- [ ] Endpoint: `POST /api/v1/training/progress/complete-course/:courseId`
- [ ] Respuesta incluye estado actualizado del nivel (si desbloqueó examen)

---

## Slice 13 — Exam Attempt + Cache
**Rama:** `slice/13-exam-attempt-cache`

- [ ] Modelo `ExamAttempt` (schema + interface + `ICachedAnswer[]`)
- [ ] Service: `startExam(employeeId, examId)` → crear attempt `in_progress`
- [ ] Validar: empleado no ha agotado intentos (D5: maxAttempts)
- [ ] Validar: nivel está en estado `exam_pending`
- [ ] Service: `saveCache(attemptId, answers[])` → actualizar `cachedAnswers`
- [ ] Service: `submitExam(attemptId, answers[])` → evaluar + cambiar status
- [ ] Al submit: auto-evaluar multiple_choice, marcar open_text como `pending_evaluation`
- [ ] Al submit: limpiar `cachedAnswers`
- [ ] Frontend: guardar en localStorage cada 30 segundos
- [ ] Frontend: al abrir examen, verificar si hay cache → restaurar
- [ ] Frontend: popup confirmación "¿Estás seguro?" antes de enviar (D6)
- [ ] Frontend: proteger respuestas (no mostrar correctas hasta evaluación)
- [ ] Endpoint: `POST /api/v1/training/exam-attempts/:examId/start`
- [ ] Endpoint: `PUT /api/v1/training/exam-attempts/:attemptId/cache`
- [ ] Endpoint: `PUT /api/v1/training/exam-attempts/:attemptId/submit`
- [ ] Endpoint: `GET /api/v1/training/exam-attempts/:attemptId`

---

## Slice 14 — Exam Manual Evaluation
**Rama:** `slice/14-exam-evaluation-manual`

- [ ] Service: `getPendingEvaluations()` → exámenes con open_text sin evaluar
- [ ] Service: `evaluateAnswer(attemptId, questionOrder, score, feedback)`
- [ ] Service: `completeEvaluation(attemptId)` → calcular puntaje final → pass/fail
- [ ] Validar: solo encargado con `training:manage` puede evaluar
- [ ] Endpoint: `GET /api/v1/training/exam-attempts/pending-evaluation`
- [ ] Endpoint: `PUT /api/v1/training/exam-attempts/:attemptId/evaluate`
- [ ] Frontend: lista de exámenes pendientes de evaluación
- [ ] Frontend: vista de respuestas con campo para puntaje + feedback por pregunta
- [ ] Frontend: mostrar `expectedAnswer` como referencia para el evaluador (D7)
- [ ] Frontend: botón "Finalizar evaluación" → calcula resultado total

---

## Slice 15 — Level Unlock Flow
**Rama:** `slice/15-level-unlock-flow`

- [ ] ProgressOrchestrator: evento `EXAM_PASSED`
- [ ] Acción: marcar nivel como `completed`
- [ ] Acción: desbloquear siguiente nivel automáticamente (D1/D2)
- [ ] Siguiente nivel: `status: 'in_progress'`, asignar como `currentLevel`
- [ ] Si no hay siguiente nivel en la insignia → emitir `BADGE_EARNED`
- [ ] Validar secuencia estricta: no se puede saltar niveles (D1)
- [ ] Service: `reactivateLevel(employeeId, levelId, reactivatedBy)` — para encargado
- [ ] Endpoint: `POST /api/v1/training/progress/reactivate-level/:employeeId/:levelId`

---

## Slice 16 — Badge Completion
**Rama:** `slice/16-badge-completion`

- [ ] ProgressOrchestrator: evento `BADGE_EARNED`
- [ ] Acción: marcar badge como `completed`, `earnedAt`
- [ ] Acción: actualizar `latestBadge` en EmployeeTrainingProgress
- [ ] Acción: actualizar `studyProgress` en Employee (para navbar)
- [ ] Acción: desbloquear siguiente insignia automáticamente (D2)
- [ ] Acción: generar certificado de insignia (delegado a slice 27)
- [ ] Calcular `percentage: 100` en `IBadgeProgress`

---

## Slice 17 — Extra Assignments
**Rama:** `slice/17-extra-assignments`

- [ ] Modelo `ExtraAssignment` (schema + interface + índices)
- [ ] Validator Zod: `assignment.validator.ts`
- [ ] Service: `assignments.service.ts` — create, complete, getMyAssignments, getAll
- [ ] Crear asignación: a personas específicas O a todos (`'all'`)
- [ ] Prioridad: urgent > high > normal (D4: aparecen arriba)
- [ ] Service: `completeAssignment(employeeId, assignmentId)`
- [ ] Registrar en `completions[]` con fecha
- [ ] Controller + Routes
- [ ] Endpoint: `GET /api/v1/training/assignments/me` (mis pendientes, ordenados por prioridad)
- [ ] Endpoint: `GET /api/v1/training/assignments` (todas, admin)
- [ ] Endpoint: `POST /api/v1/training/assignments`
- [ ] Endpoint: `POST /api/v1/training/assignments/:id/complete`
- [ ] Frontend: en vista del empleado, asignaciones aparecen ARRIBA de cursos regulares
- [ ] Frontend: form de asignación (seleccionar tipo, recurso, personas, prioridad, fecha límite)

---

## Slice 18 — Frontend Progress UI
**Rama:** `slice/18-frontend-progress-ui`

- [ ] Store MobX: `ProgressStore.contract.ts` + `ProgressStore.live.ts`
- [ ] Store MobX: `ExamStore.contract.ts` + `ExamStore.live.ts`
- [ ] API Service: `progress.ts`, `exams.ts`, `assignments.ts`
- [ ] Página: `/training/my-progress` — Mi progreso (barras, insignias, nivel actual)
- [ ] Componente: `BadgeGrid` — grid de insignias (color/gris/parcial)
- [ ] Componente: `LevelTimeline` — timeline vertical de niveles (TrackingProgress)
- [ ] Componente: `CourseChecklist` — lista de cursos con checkbox
- [ ] Página: `/training/exam/:examId` — UI del examen (preguntas + cache + confirmación)
- [ ] Página: `/training/assignments` — Mis asignaciones extraordinarias
- [ ] Página: `/training/admin/evaluations` — Dashboard evaluaciones pendientes
- [ ] Página: `/training/admin/employee/:id` — Vista progreso de un empleado
- [ ] Página: `/training/manage` — Tabs completos (Badges + Levels + Courses + Exams CRUD)
- [ ] ProgressBar componente reutilizado del template
- [ ] `data-test-*` annotations en todas las páginas

**Nota:** La UI de gestión de exámenes (CRUD admin) se incluirá aquí como un tab dentro de TrainingManage.
