# API Endpoints — Módulo Training

Base URL: `/api/v1/training`

## Cursos

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/courses` | training:read | Listar cursos (con filtros por nivel, activo) |
| GET | `/courses/:id` | training:read | Obtener curso por ID |
| POST | `/courses` | training:create | Crear curso |
| PUT | `/courses/:id` | training:update | Actualizar curso |
| PUT | `/courses/reorder` | training:update | Reordenar cursos dentro de un nivel |
| DELETE | `/courses/:id` | training:delete | Eliminar curso (soft) |

## Niveles

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/levels` | training:read | Listar niveles (filtro por badge) |
| GET | `/levels/:id` | training:read | Obtener nivel con cursos |
| POST | `/levels` | training:create | Crear nivel |
| PUT | `/levels/:id` | training:update | Actualizar nivel |
| PUT | `/levels/reorder` | training:update | Reordenar niveles |
| DELETE | `/levels/:id` | training:delete | Eliminar nivel (soft) |

## Insignias

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/badges` | training:read | Listar insignias |
| GET | `/badges/:id` | training:read | Obtener insignia con niveles |
| POST | `/badges` | training:create | Crear insignia |
| PUT | `/badges/:id` | training:update | Actualizar insignia |
| DELETE | `/badges/:id` | training:delete | Eliminar insignia (soft) |

## Exámenes

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/exams` | training:manage | Listar exámenes |
| GET | `/exams/:id` | training:read | Obtener examen (sin respuestas correctas para empleados) |
| POST | `/exams` | training:create | Crear examen |
| PUT | `/exams/:id` | training:update | Actualizar examen |
| PUT | `/exams/:id/reorder-questions` | training:update | Reordenar preguntas |
| DELETE | `/exams/:id` | training:delete | Eliminar examen (soft) |
| POST | `/exams/:id/assign/:employeeId` | training:manage | Asignar examen de ética a empleado |

## Progreso del Empleado

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/progress/me` | training:read | Mi progreso completo |
| GET | `/progress/:employeeId` | training:manage | Progreso de un empleado (encargado) |
| POST | `/progress/complete-course/:courseId` | training:read | Marcar curso como completado |
| POST | `/progress/reactivate-level/:employeeId/:levelId` | training:manage | Reactivar nivel |
| POST | `/progress/reactivate-course/:employeeId/:courseId` | training:manage | Reactivar curso (ética) |

## Intentos de Examen

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| POST | `/exam-attempts/:examId/start` | training:read | Iniciar intento de examen |
| PUT | `/exam-attempts/:attemptId/submit` | training:read | Enviar respuestas |
| GET | `/exam-attempts/:attemptId` | training:read | Ver resultado de intento |
| GET | `/exam-attempts/pending-evaluation` | training:manage | Exámenes pendientes de evaluar |
| PUT | `/exam-attempts/:attemptId/evaluate` | training:manage | Evaluar respuestas libres |

## Reportes de Estudio

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/reports/me` | training:report | Mis reportes (filtro por semana/mes) |
| GET | `/reports/me/week/:year/:week` | training:report | Mi reporte de una semana |
| POST | `/reports` | training:report | Crear reporte del día |
| PUT | `/reports/:id` | training:report | Actualizar reporte del día |
| GET | `/reports/weekly-summary` | training:manage | Resumen semanal de todos |
| GET | `/reports/missing` | training:manage | Empleados sin reporte |
| POST | `/reports/exempt-day` | training:manage | Eximir un día para todos |

## Tabla de Honor

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/honor-table/week/:year/:week` | training:read | Tabla de honor de una semana |
| GET | `/honor-table/current` | training:read | Tabla de honor semana actual |
| GET | `/honor-table/bonus-ranges` | training:read | Rangos de bonificación |

## Planes de Estudio

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/plans/me` | training:read | Mis planes de estudio |
| GET | `/plans/:employeeId` | training:manage | Planes de un empleado |
| POST | `/plans/:employeeId` | training:manage | Crear plan personalizado |
| PUT | `/plans/:id` | training:manage | Actualizar plan |
| POST | `/plans/:planId/complete-item/:itemIndex` | training:read | Marcar item completado |

## Certificados

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/certificates/me` | training:read | Mis certificados |
| GET | `/certificates/:employeeId` | training:manage | Certificados de un empleado |
| GET | `/certificates/:id/download` | training:read | Descargar PDF del certificado |
| POST | `/certificates/:id/regenerate` | training:manage | Regenerar certificado |

## Configuración

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/config` | training:manage | Obtener configuración |
| PUT | `/config` | training:manage | Actualizar configuración |
| PUT | `/config/bonus-ranges` | training:manage | Actualizar rangos de bonificación |
| PUT | `/config/certificate-template` | training:manage | Actualizar template de certificado |

## Dashboard del Encargado

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/dashboard/overview` | training:manage | Métricas generales |
| GET | `/dashboard/by-level` | training:manage | Distribución por nivel |
| GET | `/dashboard/study-hours` | training:manage | Horas totales de estudio del equipo |
| GET | `/dashboard/alerts` | training:manage | Alertas (sin reporte, examen fallido, pendientes) |
| GET | `/dashboard/employee/:id` | training:manage | Vista completa de un empleado |

---

## Total: ~50 endpoints agrupados en 10 sub-recursos
