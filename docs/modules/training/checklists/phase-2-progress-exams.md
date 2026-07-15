# Checklist — Phase 2: Progreso + Exámenes

**Branch:** `solution/training-phase-2`
**Estado:** 📋 Pendiente

---

## Slice 09 — Exam Model CRUD
**Rama:** `slice/09-exam-model-crud`

- [ ] Modelo `Exam` (schema + interface + `IExamQuestion` + índices)
- [ ] Campo `expectedAnswer` en preguntas open_text (guía para evaluador D7)
- [ ] Sin campo `timeLimitMinutes` (D6: sin tiempo límite)
- [ ] `maxAttempts` default: 1 (D5)
- [ ] Validator Zod: `exam.validator.ts`
- [ ] Service: `exams.service.ts` — create, update, delete, getByLevel, assignToEmployee
- [ ] Validar que opciones de multiple_choice tengan exactamente 1 correcta
- [ ] Controller + Routes
- [ ] Endpoint: `GET /api/v1/training/exams`
- [ ] Endpoint: `GET /api/v1/training/exams/:id` (sin `isCorrect` para empleados)
- [ ] Endpoint: `POST /api/v1/training/exams`
- [ ] Endpoint: `PUT /api/v1/training/exams/:id`
- [ ] Endpoint: `POST /api/v1/training/exams/:id/assign/:employeeId`
- [ ] Endpoint: `DELETE /api/v1/training/exams/:id`

---

## Slice 10 — Exam Questions Reorder
**Rama:** `slice/10-exam-questions-reorder`

- [ ] Endpoint: `PUT /api/v1/training/exams/:id/reorder-questions`
- [ ] Body: `{ questions: [{ order: number }] }` (nuevo orden)
- [ ] Service: validar que todos los orders son consecutivos
- [ ] Frontend: UI de preguntas con react-dnd drag & drop
- [ ] Flechas ↑↓ como alternativa al drag
- [ ] Feedback visual al arrastrar
- [ ] `data-test-*` annotations en cada pregunta reordenable

---

## Slice 11 — Progress Model + Auto-init
**Rama:** `slice/11-progress-model-init`

- [ ] Modelo `EmployeeTrainingProgress` (schema + interface + subdocuments)
- [ ] Campo `active: boolean` (D22: false si empleado inactivo)
- [ ] Hook: al crear Employee → crear EmployeeTrainingProgress automáticamente (D21)
- [ ] Hook: al suspender Employee → marcar progress `active: false` (D22)
- [ ] Hook: al reactivar Employee → marcar progress `active: true`
- [ ] Inicializar con primer badge/nivel disponible como `currentLevel`
- [ ] Service: `progress.service.ts` — getMyProgress, getProgressByEmployee
- [ ] Endpoint: `GET /api/v1/training/progress/me`
- [ ] Endpoint: `GET /api/v1/training/progress/:employeeId`

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
- [ ] ProgressBar componente reutilizado del template
- [ ] `data-test-*` annotations en todas las páginas
