# Flujo del Sistema de Capacitación — Explicación Completa

## Cadena de Dependencias

```
Documento (Biblioteca) ──→ Curso ──→ Nivel ──→ Insignia
                                        │
                                        ▼
                                     Examen
```

**De abajo hacia arriba:**
1. Un **Documento** se crea en la Biblioteca (contenido de estudio en Markdown)
2. Un **Curso** se asocia a un documento (material de estudio) y pertenece a un Nivel
3. Un **Nivel** agrupa varios cursos + tiene un examen de evaluación
4. Una **Insignia** agrupa varios niveles secuenciales (completar todos = obtener insignia)

---

## Entidades y Relaciones

### Insignia (Badge)
- **Qué es:** Meta grande. Representa dominio de un área completa.
- **Campos:** nombre, descripción, ícono (Lucide), forma (SVG), color
- **Contiene:** N niveles en orden secuencial
- **Se obtiene:** Al completar TODOS los niveles de la insignia
- **Ejemplo:** "TypeScript Certified" (3 niveles: Básico → Intermedio → Avanzado)

### Nivel (Level)
- **Qué es:** Etapa dentro de una insignia. Tiene cursos + un examen.
- **Campos:** nombre, descripción, orden, badge (padre)
- **Contiene:** N cursos + 1 examen opcional
- **Se completa:** Al aprobar el examen (requiere haber completado todos los cursos)
- **Ejemplo:** "Nivel 1 — Básico" con 5 cursos + examen de 10 preguntas

### Curso (Course)
- **Qué es:** Unidad de estudio individual. Material que el empleado debe consumir.
- **Campos:** nombre, descripción, orden, nivel (padre), documento asociado, link externo, horas estimadas
- **Asociado a:** Un documento de la Biblioteca (el contenido real)
- **Se completa:** El empleado lo marca como "terminado" en su reporte de estudio
- **Ejemplo:** "Introducción a Tipos" → asociado a doc "Guía de TypeScript Tipos"

### Documento (LibraryDocument)
- **Qué es:** El contenido real de estudio (artículo, link, PDF, mixto)
- **Vive en:** La Biblioteca (`/library`)
- **Es independiente:** Puede existir sin estar asociado a un curso
- **Un curso apunta a un documento** (relación 1:1 por curso, un doc puede estar en N cursos)

### Examen (Exam)
- **Qué es:** Evaluación para verificar que el empleado aprendió
- **Asociado a:** Un nivel, un curso, o un documento específico
- **Se desbloquea:** Cuando el empleado completa todos los cursos del nivel
- **Tipos de preguntas:** Selección múltiple (auto-evaluable) + Respuesta libre (evaluación manual)
- **Aprobación:** 80% por defecto

---

## Flujo del Empleado (Progreso)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Empleado se crea → Se asigna automáticamente al primer nivel │
├─────────────────────────────────────────────────────────────────┤
│ 2. Empleado ve sus cursos asignados del nivel actual             │
│    → Lee el documento asociado a cada curso                      │
│    → Reporta estudio L/M/V (asistencia obligatoria)             │
│    → Marca curso como "terminado" al completarlo                 │
├─────────────────────────────────────────────────────────────────┤
│ 3. Al completar TODOS los cursos del nivel → Se desbloquea examen│
├─────────────────────────────────────────────────────────────────┤
│ 4. Empleado toma el examen                                       │
│    → Si aprueba (≥80%) → Nivel completado → Desbloquea siguiente│
│    → Si reprueba → Queda bloqueado → Admin puede reactivar       │
├─────────────────────────────────────────────────────────────────┤
│ 5. Al completar todos los niveles de una insignia → BADGE EARNED │
│    → Se genera certificado                                       │
│    → Se desbloquea la siguiente insignia                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Módulo de Asistencia de Estudio

### Qué es
Los empleados deben reportar que estudiaron los días **Lunes, Miércoles y Viernes** (configurable). Es una "asistencia" al estudio — no física a la oficina, sino confirmar que dedicaron al menos 1 hora a capacitarse.

### Flujo de Asistencia

```
┌────────────────────────────────────────────────────────────────┐
│ LUNES / MIÉRCOLES / VIERNES (días obligatorios)                 │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  El empleado debe:                                               │
│  1. Abrir su página de "Reportar Estudio" (/training/report)    │
│  2. Seleccionar el/los curso(s) que estudió hoy                 │
│  3. Indicar horas dedicadas por curso                            │
│  4. Indicar si terminó el curso (Sí/No)                          │
│     → Si NO: describir en qué parte quedó                        │
│     → Si SÍ: marca el curso como completado                     │
│  5. Guardar el reporte                                           │
│                                                                  │
│  Resultado:                                                      │
│  - Se registra la asistencia del día                             │
│  - Se suman horas al total del empleado                          │
│  - Si marcó "terminé" → actualiza progreso                      │
│  - Si completó todos los cursos del nivel → desbloquea examen   │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### Reglas de Asistencia

| Regla | Descripción |
|-------|-------------|
| Días obligatorios | L, M, V (configurable en TrainingConfig) |
| Mínimo por día | 1 hora |
| Ventana de reporte | Jueves a Miércoles 23:59 |
| Solo cursos del sistema | No se puede reportar material externo |
| Exenciones | Festivos y CSW aprobados (vacaciones/permisos) |
| Máximo por día | 12 horas |
| Edición retroactiva | Solo semana actual (admin puede editar pasadas) |

### Indicadores de Asistencia

| Estado | Significado | Visual |
|--------|-------------|--------|
| ✅ Reportado | El empleado reportó ese día | Verde |
| ❌ Sin reportar | Día obligatorio sin reporte | Rojo |
| ⬜ Exento | Festivo o permiso aprobado | Gris |
| 🔲 No obligatorio | Día no configurado (M, J, S, D) | No se muestra |

### Vista del Admin (Dashboard)

```
Semana: 14 Jul — 20 Jul 2026

| Empleado        | Lun | Mié | Vie | Total |
|-----------------|-----|-----|-----|-------|
| Juan Pérez      | ✅2h | ✅1h | ❌  | 3h    |
| María García    | ✅1h | ✅1.5h| ✅1h| 3.5h  |
| Carlos López    | ❌   | ⬜   | ✅2h | 2h    |
```

---

## Creación en el Admin: Orden Recomendado

Al configurar el sistema de capacitación por primera vez:

1. **Crear documentos** en la Biblioteca (el contenido de estudio)
2. **Crear una insignia** (ej: "TypeScript Fundamentals")
3. **Crear niveles** dentro de la insignia (ej: Básico, Intermedio, Avanzado)
4. **Crear cursos** dentro de cada nivel, asociando el documento correspondiente
5. **Crear examen** para cada nivel (opcional, pero recomendado)

---

## UI de Creación (Admin en /training/manage)

### Tab Insignias → Botón "+ Nueva Insignia"
Modal con: nombre, descripción, ícono (LucideIconPicker), forma (BadgeShapePicker), color

### Tab Niveles → Botón "+ Nuevo Nivel"
Modal con: nombre, descripción, insignia padre (select), orden

### Tab Cursos → Botón "+ Nuevo Curso"
Modal con: nombre, descripción, nivel padre (select), documento asociado (select de biblioteca), link externo (opcional), horas estimadas

### Tab Exámenes → Botón "+ Nuevo Examen"
Página dedicada: /training/manage/exams/new (ya implementada)

---

## Modelo de Datos Involucrado

```
Employee (1) ←──→ (1) EmployeeTrainingProgress
                         ├── courses: ICourseProgress[]
                         ├── levels: ILevelProgress[]
                         ├── badges: IBadgeProgress[]
                         ├── currentLevel
                         └── totalStudyHours

Badge (1) ←──→ (N) Level (1) ←──→ (N) Course (1) ──→ (1) LibraryDocument
                      │
                      └──→ (0-1) Exam ←──→ (N) ExamAttempt

StudyReport (por día)
  ├── employee
  ├── date
  ├── entries: [{ course, hoursSpent, completed }]
  └── totalHours
```
