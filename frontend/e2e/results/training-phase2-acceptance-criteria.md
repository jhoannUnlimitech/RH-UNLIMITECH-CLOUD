# Criterios de Aceptación — Training Phase 2 (Progreso + Exámenes)

## Rutas a testear

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
| training@unlimitech.cloud (Oscar) | QUALITY & TRAINING OFFICER | manage, content, read, report |
| moises@unlimitech.cloud | TECHNICAL ARCHITECT MANAGER | read, report, content |

---

## Flujo 1: Gestión de Insignias (Tab Insignias en /training/manage)

- [ ] AC-01: Admin ve lista de insignias del seed (Fullstack Developer, React Specialist)
- [ ] AC-02: Admin crea nueva insignia con nombre, descripción, ícono, forma, color
- [ ] AC-03: Insignia creada aparece en la grid
- [ ] AC-04: Admin edita una insignia (nombre, color)
- [ ] AC-05: Admin elimina insignia con DeleteConfirmModal
- [ ] AC-06: Insignia eliminada desaparece de la grid

---

## Flujo 2: Gestión de Niveles (Tab Niveles)

- [ ] AC-07: Admin ve tabla de niveles del seed con columnas (orden, nombre, insignia, cursos, examen)
- [ ] AC-08: Admin crea nuevo nivel asociado a una insignia
- [ ] AC-09: Nivel creado aparece en la tabla
- [ ] AC-10: Admin edita un nivel (nombre, orden)
- [ ] AC-11: Admin elimina un nivel con confirmación

---

## Flujo 3: Gestión de Cursos (Tab Cursos)

- [ ] AC-12: Admin ve tabla de cursos del seed con columnas (orden, nombre, nivel, horas)
- [ ] AC-13: Admin crea nuevo curso asociado a un nivel y un documento de la Biblioteca
- [ ] AC-14: Curso creado aparece en la tabla
- [ ] AC-15: Admin edita un curso (nombre, horas, documento asociado)
- [ ] AC-16: Admin elimina un curso con confirmación

---

## Flujo 4: Gestión de Exámenes (Tab Exámenes)

- [ ] AC-17: Admin ve lista de exámenes del seed (TS Básico, React Fundamentals)
- [ ] AC-18: Admin navega a /training/manage/exams/new desde botón "+ Nuevo Examen"
- [ ] AC-19: Admin llena datos generales (título, asociación nivel/curso, %, intentos)
- [ ] AC-20: Admin agrega pregunta de selección múltiple con 4 opciones
- [ ] AC-21: Admin marca exactamente 1 opción como correcta (radio)
- [ ] AC-22: Admin agrega pregunta de respuesta libre con expectedAnswer
- [ ] AC-23: Admin reordena preguntas con flechas ↑↓
- [ ] AC-24: Admin reordena preguntas con drag & drop (GripVertical handle)
- [ ] AC-25: Admin guarda examen → redirect a /training/manage
- [ ] AC-26: Examen creado aparece en la lista del tab Exámenes
- [ ] AC-27: Admin edita examen existente (navega a /training/manage/exams/edit/:id)
- [ ] AC-28: Admin elimina examen con DeleteConfirmModal
- [ ] AC-29: Default % aprobación es 80%
- [ ] AC-30: Asociar examen a nivel, curso o documento (select tipo)

---

## Flujo 5: Progreso del Empleado (/training/my-progress)

- [ ] AC-31: Empleado ve sus insignias (grid con BadgeIcon earned/in-progress/locked)
- [ ] AC-32: Empleado ve su nivel actual con nombre
- [ ] AC-33: Empleado ve lista de cursos del nivel con status (completado/pendiente)
- [ ] AC-34: Empleado marca curso como completado → botón "Marcar Completado"
- [ ] AC-35: Curso marcado aparece con checkmark verde + línea tachada
- [ ] AC-36: Al completar todos los cursos del nivel → mensaje "examen disponible"
- [ ] AC-37: Empleado ve timeline de todos los niveles con estados
- [ ] AC-38: Empleado ve total de horas de estudio

---

## Flujo 6: Asignaciones Extraordinarias

- [ ] AC-39: Asignaciones pendientes aparecen ARRIBA de los cursos (D4)
- [ ] AC-40: Asignaciones muestran prioridad visual (URGENTE/ALTA)
- [ ] AC-41: Empleado completa asignación → desaparece de la lista
- [ ] AC-42: Admin crea asignación para empleado específico → aparece en su vista
- [ ] AC-43: Admin crea asignación para "todos" → aparece para todos

---

## Flujo 7: Tomar Examen (API-level, sin UI de examen aún)

- [ ] AC-44: POST /exam-attempts/:examId/start → crea intento in_progress
- [ ] AC-45: No puede iniciar si agotó intentos (maxAttempts)
- [ ] AC-46: No puede iniciar si nivel no está en exam_pending
- [ ] AC-47: PUT /exam-attempts/:attemptId/cache → guarda respuestas temporales
- [ ] AC-48: PUT /exam-attempts/:attemptId/submit → evalúa MC automáticamente
- [ ] AC-49: Submit con solo MC → resultado inmediato (passed/failed)
- [ ] AC-50: Submit con open_text → status pending_evaluation
- [ ] AC-51: Cache se limpia al hacer submit
- [ ] AC-52: Notificación al empleado cuando examen es evaluado

---

## Flujo 8: Evaluación Manual (API-level)

- [ ] AC-53: GET /exam-attempts/pending-evaluation → lista intentos pendientes
- [ ] AC-54: PUT /exam-attempts/:id/evaluate → puntúa pregunta open_text con feedback
- [ ] AC-55: PUT /exam-attempts/:id/complete-evaluation → calcula resultado final
- [ ] AC-56: Si aprueba → nivel se marca completed + siguiente se desbloquea
- [ ] AC-57: Si reprueba → status failed, empleado queda bloqueado
- [ ] AC-58: Notificación a admins training cuando hay examen pendiente de revisión

---

## Flujo 9: Course Completion Flow (API-level)

- [ ] AC-59: POST /progress/complete-course/:courseId → marca curso completado
- [ ] AC-60: Valida que curso pertenece al nivel actual
- [ ] AC-61: Valida que curso no estaba ya completado
- [ ] AC-62: Suma horas estimadas al totalStudyHours
- [ ] AC-63: Si todos los cursos del nivel completados + tiene examen → exam_pending
- [ ] AC-64: Si todos los cursos del nivel completados + sin examen → nivel completado
- [ ] AC-65: Nivel completado → desbloquea siguiente nivel automáticamente
- [ ] AC-66: Todos los niveles de insignia completados → badge earned

---

## Flujo 10: Notificaciones

- [ ] AC-67: Bell icon muestra badge con conteo de no leídas
- [ ] AC-68: Dropdown muestra notificaciones reales del API
- [ ] AC-69: Click en notificación → marca como leída + navega al link
- [ ] AC-70: "Marcar todas leídas" funciona
- [ ] AC-71: Notificación al asignar examen a empleado
- [ ] AC-72: Notificación al aprobar CSW
- [ ] AC-73: Notificación al rechazar CSW
- [ ] AC-74: Notificación al siguiente aprobador cuando CSW se escala

---

## Flujo 11: Permisos Training Phase 2

- [ ] AC-75: Solo training:manage puede acceder a /training/manage
- [ ] AC-76: Solo training:manage puede crear/editar/eliminar exámenes
- [ ] AC-77: Todos con training:read pueden ver /training/my-progress
- [ ] AC-78: Todos con training:read pueden tomar exámenes
- [ ] AC-79: Solo training:manage puede evaluar exámenes manualmente
- [ ] AC-80: Solo training:manage puede crear asignaciones extraordinarias

---

## Resumen

| Flujo | ACs | Descripción |
|-------|-----|-------------|
| 1. Insignias CRUD | 6 (AC-01 a AC-06) | Tab Insignias en TrainingManage |
| 2. Niveles CRUD | 5 (AC-07 a AC-11) | Tab Niveles en TrainingManage |
| 3. Cursos CRUD | 5 (AC-12 a AC-16) | Tab Cursos en TrainingManage |
| 4. Exámenes CRUD + Editor | 14 (AC-17 a AC-30) | Tab Exámenes + ExamForm |
| 5. Progreso Empleado | 8 (AC-31 a AC-38) | MyProgress page |
| 6. Asignaciones Extra | 5 (AC-39 a AC-43) | Prioridad + CRUD |
| 7. Tomar Examen (API) | 9 (AC-44 a AC-52) | ExamAttempt lifecycle |
| 8. Evaluación Manual (API) | 6 (AC-53 a AC-58) | Admin evaluation flow |
| 9. Course Completion (API) | 8 (AC-59 a AC-66) | Progress cascade |
| 10. Notificaciones | 8 (AC-67 a AC-74) | Bell dropdown + triggers |
| 11. Permisos | 6 (AC-75 a AC-80) | Access control |
| **Total** | **80 ACs** | |
