# Decisiones de Diseño — Módulo Training

Respuestas a las preguntas de implementación. Este documento es la referencia autoritativa para cualquier duda durante el desarrollo.

---

## Flujo de Cursos y Niveles

### D1: Progreso secuencial obligatorio entre niveles
**Un empleado NO puede tomar niveles en paralelo ni saltar niveles.** Debe completar nivel 0 → nivel 1 → nivel 2 → ... en orden estricto. No puede hacer nivel 0 y nivel 5 simultáneamente.

### D2: Asignación automática de insignias
Las insignias se asignan automáticamente cuando el empleado completa el nivel anterior. No requiere intervención manual del encargado para desbloquear el siguiente nivel dentro de una insignia.

### D3: Marcar curso como completado → empleado. Aprobar nivel → encargado.
- **Curso completado:** Lo marca el propio empleado en su reporte de estudio.
- **Nivel completado:** Solo después de que el encargado revise y apruebe el examen del nivel.

### D4: Cursos nuevos y asignaciones extraordinarias
Si se agrega un nuevo curso a un nivel que un empleado ya cursó:
- El encargado debe **asignarlo manualmente** a las personas que necesiten tomarlo.
- Las **asignaciones extraordinarias** (nuevas directivas, cursos nuevos, políticas) van **por encima** de los cursos regulares del empleado.
- Se puede asignar a personas específicas (X empleados) o a todos.
- Estas asignaciones deben ser **seleccionables** y aparecer como prioritarias en la vista del empleado.

**Implicación en el modelo:**

```typescript
interface IExtraAssignment {
  type: 'course' | 'document' | 'directive';
  resource: Types.ObjectId;        // ref: Course | LibraryDocument
  assignedTo: 'all' | Types.ObjectId[];  // Todos o lista específica
  assignedBy: Types.ObjectId;      // ref: Employee (encargado)
  reason: string;                  // Motivo de la asignación
  priority: 'normal' | 'high' | 'urgent';  // Se muestra arriba en la UI
  dueDate?: Date;                  // Fecha límite opcional
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}
```

---

## Exámenes

### D5: Un solo intento, configurable por examen
- **Default:** 1 intento. Si falla, queda bloqueado hasta reactivación del encargado.
- **Configurable:** El campo `maxAttempts` en el examen permite definir más intentos si se quiere.
- Después de agotar intentos, solo el encargado puede reactivar.

### D6: Sin tiempo límite + persistencia en cache
- Los exámenes NO tienen tiempo límite.
- El progreso se guarda temporalmente en **localStorage/sessionStorage** para que si se cierra el navegador, al volver pueda continuar desde donde iba.
- Las respuestas se **protegen** — no se evalúan hasta que el empleado confirme el envío.
- Al enviar: popup de confirmación "¿Estás seguro de que quieres enviar las respuestas? Una vez enviadas no podrás modificarlas."
- Solo después del envío se evalúa (selección múltiple automática, texto libre queda pendiente de evaluación).

### D7: Respuestas libres las evalúa el encargado obligatoriamente
Si el examen tiene preguntas de respuesta libre, el encargado **debe** leerlas y calificarlas manualmente. No hay auto-evaluación para texto libre.

---

## Reportes de Estudio

### D8: Mínimo 1h por día obligatorio (L, M, V)
El mínimo semanal de 3h se distribuye: **1 hora cada día obligatorio** (lunes, miércoles, viernes). No puede estudiar 3h un solo día y considerar que cumplió la semana — debe reportar al menos 1h cada L, M y V.

### D9: Ventana de reporte = jueves a miércoles 23:59
La semana de reporte va de **jueves a miércoles a las 23:59**. Un empleado puede reportar cualquier día dentro de esa ventana. No puede reportar días de semanas anteriores una vez cerrada la ventana.

**Ejemplo:**
- Semana del 10-16 julio: se puede reportar desde jueves 10 hasta miércoles 16 a las 23:59.
- El jueves 17 ya es semana nueva.

### D10: Alerta por falta de reporte
- **Notificación** al empleado si no ha reportado un día obligatorio.
- **Dashboard del empleado** muestra indicador visual de días sin reportar.
- No hay consecuencia automatizada más allá de la notificación y el indicador.
- El encargado ve en su dashboard quiénes no han reportado.

### D11: Solo cursos registrados en el sistema
Los reportes de estudio solo permiten seleccionar cursos que existen en la plataforma. No se puede reportar estudio de material externo no registrado.

---

## Tabla de Honor y Bonificaciones

### D12: Acumulativo por trimestre
La tabla de honor es **acumulativa por trimestre** (no semanal). Se suman todas las horas del trimestre y se ordena por total. Los trimestres son:
- Q1: Enero - Marzo
- Q2: Abril - Junio
- Q3: Julio - Septiembre
- Q4: Octubre - Diciembre

### D13: Bonos por trimestre, cálculo automático
- Los bonos se calculan **por trimestre**.
- El sistema calcula automáticamente al cierre del trimestre.
- El rango se determina por el total de horas del trimestre.

### D14: Bono y posición visibles para todos
Todos los empleados pueden ver en la tabla de honor:
- La posición de cada persona
- El monto del bono (o condecoración) de cada rango
- Su propia posición y rango

---

## Biblioteca

### D15: Solo usuarios con permisos crean/editan documentos
Solo los empleados con permisos `training:create` y `training:update` pueden crear y editar documentos en la biblioteca. Los demás solo leen.

### D16: Búsqueda por título y tags (v1)
Para v1, la búsqueda se hace por **título + tags**. No se implementa full-text search en el contenido Markdown en la primera versión.

---

## Certificados

### D17: Certificados por nivel y por insignia
- Se genera un **certificado por cada nivel completado**.
- Si una insignia requiere múltiples niveles, se genera un **certificado de la insignia** solo al completar TODOS los niveles que la componen.
- Un empleado con 3 niveles + 1 insignia recibiría 4 certificados.

### D18: PDF con logo, contenido centrado y firma
El certificado PDF debe tener:
- **Logo de la empresa** en la parte superior
- **Contenido/mensaje** en el centro (con las variables resueltas)
- **Firma** en la parte inferior (del encargado o gerente)
- Diseño limpio y profesional (no solo texto plano)

---

## Permisos y Roles

### D19: `training:manage` es un permiso, no un Hat
Es un permiso asignable a cualquier Hat. El responsable actual es **Oscar** (hat: QUALITY & TRAINING OFFICER). Puede haber varios encargados si se les asigna el permiso.

### D20: HUMAN TALENT tiene acceso total al módulo
El hat **HUMAN TALENT MANAGEMENT** (Laura) tiene acceso completo a todo el módulo Training: dashboard, reportes, gestión, bonos, etc. Es una vista de supervisión.

---

## Integración con Employee

### D21: Asignación automática al crear empleado
Al crear un nuevo empleado, se le asigna automáticamente el training básico (primera insignia / primer nivel). No requiere inscripción manual.

### D22: Empleado inactivo → progreso congelado e invisible
Si un empleado se suspende/inactiva:
- Su progreso se **conserva** en la base de datos (no se elimina).
- **No aparece** en tablas de honor, reportes, ni dashboards.
- Si se reactiva, su progreso se retoma desde donde estaba.

---

## Fases de Implementación (confirmadas)

| Fase | Contenido | Prioridad |
|------|-----------|-----------|
| **Fase 1** | Biblioteca + CRUD cursos/niveles/insignias + editor dual | 🔴 Alta |
| **Fase 2** | Progreso del empleado + marcar cursos + exámenes | 🔴 Alta |
| **Fase 3** | Reportes de estudio + tabla de honor + bonificaciones | 🟡 Media |
| **Fase 4** | Certificados + planes individuales + dashboard encargado | 🟡 Media |

---

## Impacto en el Modelo de Datos (ajustes post-decisiones)

### Nuevo: Colección `ExtraAssignment` (asignaciones extraordinarias)

```typescript
interface IExtraAssignment extends Document {
  type: 'course' | 'document' | 'directive';
  resource: Types.ObjectId;           // ref: Course | LibraryDocument
  title: string;                      // Título (desnormalizado para lista rápida)
  assignedTo: 'all' | Types.ObjectId[];  // 'all' o array de Employee IDs
  assignedBy: Types.ObjectId;         // ref: Employee (encargado)
  reason: string;                     // Motivo de la asignación
  priority: 'normal' | 'high' | 'urgent';
  dueDate?: Date;                     // Fecha límite
  completions: {                      // Track por empleado
    employee: Types.ObjectId;
    completedAt: Date;
  }[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Ajuste: `StudyReport` → ventana jueves-miércoles

```typescript
// El campo week se calcula como: semana que inicia en jueves
// Agregar campo weekStart y weekEnd para claridad
interface IStudyReport {
  // ...existentes...
  weekStart: Date;    // Jueves 00:00
  weekEnd: Date;      // Miércoles 23:59
}
```

### Ajuste: `BonusRecord` → por trimestre (no por semana)

```typescript
interface IBonusRecord extends Document {
  employee: Types.ObjectId;
  quarter: number;              // 1, 2, 3 o 4
  year: number;
  totalHours: number;           // Horas totales del trimestre
  bonusRange: IBonusRange;      // Snapshot del rango alcanzado
  prizeType: 'symbolic' | 'monetary' | 'both';
  prizeAmount?: number;
  prizeCurrency?: string;
  status: 'pending' | 'paid' | 'acknowledged';
  paidAt?: Date;
  paidBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Índice
{ employee: 1, quarter: 1, year: 1 } // unique
```

### Ajuste: `ExamAttempt` → cache de progreso

```typescript
interface IExamAttempt {
  // ...existentes...
  cachedAnswers?: {             // Respuestas guardadas temporalmente (no evaluadas)
    questionOrder: number;
    answer: string;
    savedAt: Date;
  }[];
  // cachedAnswers se limpia al hacer submit
}
```

### Ajuste: `TrainingConfig` → reportes obligatorios con mínimo por día

```typescript
interface ITrainingConfig {
  // ...existentes...
  minDailyHours: number;          // Mínimo por día obligatorio (default: 1)
  reportWindowStart: number;      // Día inicio ventana ISO (4 = jueves)
  reportWindowEnd: number;        // Día fin ventana ISO (3 = miércoles)
}
```

---

## Resumen Final de Colecciones

| # | Colección | Nueva/Existente |
|---|-----------|-----------------|
| 1 | `Course` | Nueva |
| 2 | `Level` | Nueva |
| 3 | `Badge` | Nueva |
| 4 | `Exam` | Nueva |
| 5 | `EmployeeTrainingProgress` | Nueva |
| 6 | `ExamAttempt` | Nueva (con cache de respuestas) |
| 7 | `StudyReport` | Nueva (ventana jue-mié) |
| 8 | `StudyPlan` | Nueva |
| 9 | `Certificate` | Nueva |
| 10 | `TrainingConfig` | Nueva (singleton) |
| 11 | `LibraryCategory` | Nueva |
| 12 | `LibraryDocument` | Nueva |
| 13 | `LibraryDocumentVersion` | Nueva (con TTL) |
| 14 | `BonusRecord` | Nueva (trimestral) |
| 15 | `ExtraAssignment` | Nueva (asignaciones extraordinarias) |
| — | `Employee` (existente) | Agregar campo `studyProgress` |

**Total: 15 colecciones nuevas + 1 campo en Employee existente**
