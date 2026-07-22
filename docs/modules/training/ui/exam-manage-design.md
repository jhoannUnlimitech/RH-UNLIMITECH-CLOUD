# UI Design — Gestión de Exámenes (Admin)

## Ubicación

Dentro de `/training/manage` como un tab "Exámenes" al lado de Insignias, Niveles y Cursos.
Alternativamente accesible directamente desde la edición de un Nivel (ya que cada examen pertenece a un nivel).

## Vistas

### 1. Lista de Exámenes (Tab "Exámenes" en TrainingManage)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚙️ Gestión de Training                                             │
├─────────────────────────────────────────────────────────────────────┤
│  [Insignias] [Niveles] [Cursos] [✨ Exámenes]                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Exámenes                                     [+ Nuevo Examen]      │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 📝 Fundamentos TypeScript — Examen Nivel 1                    │ │
│  │    Nivel: Básico · 10 preguntas · 70% aprobación · 1 intento  │ │
│  │    ✅ Activo                              [Editar] [Eliminar]  │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │ 📝 React Avanzado — Examen Nivel 2                            │ │
│  │    Nivel: Intermedio · 8 preguntas · 80% aprobación · 2 int.  │ │
│  │    ✅ Activo                              [Editar] [Eliminar]  │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │ 📝 Examen de Ética — Empleado: Juan Pérez                     │ │
│  │    Asignado a: Juan Pérez · 5 preguntas · 90% · 1 intento     │ │
│  │    ⚠️ Asignación directa                  [Editar] [Eliminar]  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Formulario Crear/Editar Examen (Modal o página dedicada)

Dado que el editor de preguntas es complejo (múltiples preguntas con opciones, drag&drop), conviene usar una **página dedicada** en vez de un modal:

**Ruta:** `/training/manage/exams/new` y `/training/manage/exams/edit/:id`

```
┌─────────────────────────────────────────────────────────────────────┐
│  📝 Nuevo Examen                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Título *:        [                                    ]             │
│  Descripción:     [                                    ]             │
│  Nivel *:         [▼ Seleccionar nivel               ]             │
│  % Aprobación *:  [70] %                                            │
│  Intentos máx *:  [1]                                               │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  PREGUNTAS                                    [+ Agregar Pregunta]  │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌─ Pregunta 1 ──────────────────────────────── [↑] [↓] [🗑️] ──┐ │
│  │  Tipo: (•) Selección Múltiple  ( ) Respuesta Libre            │ │
│  │                                                                │ │
│  │  Enunciado *:                                                  │ │
│  │  [¿Cuál es el tipo de dato para números en TypeScript?     ]  │ │
│  │                                                                │ │
│  │  Puntos: [10]                                                  │ │
│  │                                                                │ │
│  │  Opciones:                                                     │ │
│  │    ○ [int              ] [🗑️]                                  │ │
│  │    ● [number           ] [🗑️]  ← correcta (radio)             │ │
│  │    ○ [float            ] [🗑️]                                  │ │
│  │    ○ [integer          ] [🗑️]                                  │ │
│  │                               [+ Agregar Opción]               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Pregunta 2 ──────────────────────────────── [↑] [↓] [🗑️] ──┐ │
│  │  Tipo: ( ) Selección Múltiple  (•) Respuesta Libre            │ │
│  │                                                                │ │
│  │  Enunciado *:                                                  │ │
│  │  [Explique la diferencia entre type e interface            ]  │ │
│  │                                                                │ │
│  │  Puntos: [20]                                                  │ │
│  │                                                                │ │
│  │  Respuesta esperada (guía para evaluador):                     │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ Las interfaces se pueden extender y fusionar,            │ │ │
│  │  │ los types son más flexibles con unions e intersections.  │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│                                     [Cancelar]  [Guardar Examen]    │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Reordenar preguntas (dentro del editor)

- Cada pregunta tiene botones **↑ ↓** para mover
- Opcionalmente: react-dnd drag handle (≡ ícono de 6 puntos)
- Al arrastrar/mover: feedback visual (sombra, borde azul)
- Guardado automático del orden al soltar

## Componentes necesarios

| Componente | Ubicación | Responsabilidad |
|-----------|-----------|-----------------|
| `ExamsList` | Tab dentro de TrainingManage | Lista de exámenes con acciones |
| `ExamForm` | Página `/training/manage/exams/new\|edit/:id` | Formulario completo del examen |
| `ExamQuestionCard` | Dentro de ExamForm | Una pregunta individual (editable, draggable) |
| `ExamOptionRow` | Dentro de ExamQuestionCard | Una opción de selección múltiple |

## Data-test annotations

```
training-manage-page
└── exams-tab (context)
    ├── create-exam-btn (key)
    └── exams-list (context)
        └── exam-{id} (key, indexed)
            ├── exam-title (key)
            ├── exam-level (key)
            ├── edit-btn (key)
            └── delete-btn (key)

exam-form-page (context)
├── title-input (key)
├── description-input (key)
├── level-select (key)
├── passing-score-input (key)
├── max-attempts-input (key)
├── questions-section (context)
│   ├── add-question-btn (key)
│   └── question-{order} (key, indexed)
│       ├── type-radio-multiple (key)
│       ├── type-radio-open (key)
│       ├── question-input (key)
│       ├── points-input (key)
│       ├── move-up-btn (key)
│       ├── move-down-btn (key)
│       ├── delete-question-btn (key)
│       ├── expected-answer-input (key) — solo open_text
│       └── options-section (context) — solo multiple_choice
│           ├── add-option-btn (key)
│           └── option-{index} (key, indexed)
│               ├── option-text-input (key)
│               ├── option-correct-radio (key)
│               └── delete-option-btn (key)
└── form-actions (context)
    ├── cancel-btn (key)
    └── save-btn (key)
```

## Flujo de usuario

1. Admin navega a `/training/manage` → Tab "Exámenes"
2. Ve lista de exámenes existentes con info resumida
3. Click "+ Nuevo Examen" → Navega a `/training/manage/exams/new`
4. Llena datos generales (título, nivel, % aprobación)
5. Agrega preguntas una por una:
   - Selecciona tipo (multiple_choice / open_text)
   - Escribe enunciado
   - Si multiple_choice: agrega opciones y marca la correcta
   - Si open_text: escribe respuesta esperada (guía para evaluador)
   - Asigna puntos
6. Reordena preguntas con ↑↓ o drag
7. Click "Guardar Examen"
8. Redirect a lista de exámenes

## Permisos

- Solo visible/accesible con `training:manage`
- El tab "Exámenes" solo aparece si el usuario tiene ese permiso
