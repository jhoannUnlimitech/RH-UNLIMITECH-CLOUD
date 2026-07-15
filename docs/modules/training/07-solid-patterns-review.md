# Revisión SOLID y Patrones de Diseño — Módulo Training

## Análisis de la Arquitectura Actual

### Estructura existente (backend)

```
src/
├── controllers/    → Lógica de negocio + manejo HTTP (Fat Controllers)
├── models/         → Mongoose schemas + lógica de dominio embebida
├── routes/         → Definición de rutas + middleware
├── validators/     → Schemas Zod de validación
├── middleware/     → Auth, permisos, errores, CORS
├── config/         → Env, DB, Swagger
└── scripts/        → Seeds, migraciones
```

**Patrón actual:** `Route → Middleware → Controller → Model` (sin capa Service).

---

## Problemas Detectados vs SOLID

### ❌ Violación SRP (Single Responsibility Principle)

**Problema:** Los controllers mezclan 3 responsabilidades:
1. Manejo HTTP (parsear request, enviar response)
2. Lógica de negocio (validaciones, reglas de dominio)
3. Acceso a datos (queries a Mongoose directos)

**Ejemplo en `divisions.controller.ts`:**
```typescript
// Un solo método hace: validar body, verificar duplicados, verificar que el manager existe,
// crear la división, popular el resultado, y enviar response.
export const createDivision = async (req, res, next) => {
  // 1. HTTP parsing ← Responsabilidad de controller ✅
  const { name, code, managerId } = req.body;
  
  // 2. Validación de negocio ← Debería estar en Service ❌
  if (!mongoose.Types.ObjectId.isValid(managerId)) { ... }
  const existingDivision = await Division.findOne({ name });
  const manager = await Employee.findById(managerId);
  
  // 3. Operación de datos ← Debería estar en Repository/Service ❌
  const division = await Division.create({ ... });
  const divisionData = await Division.findById(division._id).populate(...);
  
  // 4. HTTP response ← Responsabilidad de controller ✅
  res.status(201).json({ success: true, data: divisionData });
};
```

### ❌ Violación OCP (Open/Closed Principle)

**Problema:** El modelo CSW tiene 500+ líneas con toda la lógica embebida (`initializeApprovalChain`, `approveAtLevel`, `rejectAtLevel`). Agregar un nuevo tipo de flujo requiere modificar el modelo existente.

### ⚠️ Violación DIP (Dependency Inversion Principle)

**Problema:** Los controllers dependen directamente de los modelos Mongoose (implementación concreta). No hay abstracción intermedia. Si cambiaras de Mongoose a otro ORM, tendrías que reescribir todos los controllers.

### ✅ Lo que SÍ está bien

- **Validators** separados con Zod (separación de validación de input)
- **Middleware** de auth/permisos reutilizable
- **BaseModel** con soft delete plugin (DRY)
- **Estructura de carpetas** clara por tipo

---

## Propuesta para el Módulo Training: Capa de Services

Para Training (módulo nuevo con 15 colecciones y lógica compleja), implementar una **capa de Services** que el resto del proyecto no tiene. Esto NO requiere refactorear los módulos existentes — solo aplica al nuevo módulo.

### Nueva estructura para Training

```
src/
├── controllers/
│   └── training/
│       ├── courses.controller.ts      → Solo HTTP: parsear req, llamar service, enviar res
│       ├── levels.controller.ts
│       ├── badges.controller.ts
│       ├── exams.controller.ts
│       ├── progress.controller.ts
│       ├── reports.controller.ts
│       ├── honorTable.controller.ts
│       ├── certificates.controller.ts
│       ├── library.controller.ts
│       └── assignments.controller.ts
│
├── services/
│   └── training/
│       ├── courses.service.ts         → Lógica de negocio pura
│       ├── levels.service.ts
│       ├── badges.service.ts
│       ├── exams.service.ts
│       ├── progress.service.ts        → Orquesta progreso (más complejo)
│       ├── reports.service.ts         → Calcula obligatoriedad, integra Calendar/CSW
│       ├── honorTable.service.ts      → Calcula trimestral, posiciones, bonos
│       ├── certificates.service.ts    → Genera PDFs, resuelve variables
│       ├── library.service.ts         → CRUD documentos + versionado
│       └── assignments.service.ts     → Asignaciones extraordinarias
│
├── models/
│   └── training/
│       ├── Course.ts
│       ├── Level.ts
│       ├── Badge.ts
│       ├── Exam.ts
│       ├── ExamAttempt.ts
│       ├── EmployeeTrainingProgress.ts
│       ├── StudyReport.ts
│       ├── StudyPlan.ts
│       ├── Certificate.ts
│       ├── BonusRecord.ts
│       ├── ExtraAssignment.ts
│       ├── TrainingConfig.ts
│       ├── LibraryCategory.ts
│       ├── LibraryDocument.ts
│       └── LibraryDocumentVersion.ts
│
├── validators/
│   └── training/
│       ├── course.validator.ts
│       ├── level.validator.ts
│       ├── badge.validator.ts
│       ├── exam.validator.ts
│       ├── report.validator.ts
│       ├── library.validator.ts
│       └── assignment.validator.ts
│
├── routes/
│   └── training/
│       ├── index.ts                   → Barrel que monta todas las sub-rutas
│       ├── courses.routes.ts
│       ├── levels.routes.ts
│       ├── badges.routes.ts
│       ├── exams.routes.ts
│       ├── progress.routes.ts
│       ├── reports.routes.ts
│       ├── honorTable.routes.ts
│       ├── certificates.routes.ts
│       ├── library.routes.ts
│       └── assignments.routes.ts
```

---

## Patrones de Diseño a Aplicar

### 1. Service Layer Pattern

Separa lógica de negocio del manejo HTTP.

```typescript
// controller — solo HTTP
export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.create(req.body, req.user!.id);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// service — lógica de negocio
class CourseService {
  async create(data: CreateCourseInput, createdBy: string): Promise<ICourse> {
    // Validar que el nivel existe
    const level = await Level.findById(data.level);
    if (!level) throw new AppError('Nivel no encontrado', 404);
    
    // Validar que no duplique orden
    const existing = await Course.findOne({ level: data.level, order: data.order });
    if (existing) throw new AppError('Ya existe un curso con ese orden en el nivel', 400);
    
    // Crear
    const course = await Course.create(data);
    
    // Actualizar el nivel (agregar curso a la lista)
    await Level.findByIdAndUpdate(data.level, { $push: { courses: course._id } });
    
    return course;
  }
}
```

**Beneficio:** El controller no sabe cómo funciona el negocio. El service no sabe que es HTTP. Se puede testear el service sin HTTP.

### 2. Strategy Pattern — Evaluación de Exámenes

Diferentes estrategias de evaluación según el tipo de pregunta:

```typescript
// Interfaz de estrategia
interface IEvaluationStrategy {
  evaluate(answer: IExamAnswer, question: IExamQuestion): EvaluationResult;
}

// Estrategia: selección múltiple (automática)
class MultipleChoiceStrategy implements IEvaluationStrategy {
  evaluate(answer: IExamAnswer, question: IExamQuestion): EvaluationResult {
    const correctOption = question.options!.findIndex(o => o.isCorrect);
    const isCorrect = answer.selectedOption === correctOption;
    return { isCorrect, score: isCorrect ? question.points : 0 };
  }
}

// Estrategia: texto libre (manual, solo valida que haya respuesta)
class OpenTextStrategy implements IEvaluationStrategy {
  evaluate(answer: IExamAnswer, question: IExamQuestion): EvaluationResult {
    return { isCorrect: null, score: null, pendingManualReview: true };
  }
}

// Factory
function getEvaluationStrategy(type: QuestionType): IEvaluationStrategy {
  switch (type) {
    case 'multiple_choice': return new MultipleChoiceStrategy();
    case 'open_text': return new OpenTextStrategy();
  }
}
```

### 3. Observer Pattern — Progreso Automático

Cuando un evento ocurre, se actualizan múltiples cosas automáticamente:

```typescript
// Eventos del módulo Training
type TrainingEvent =
  | { type: 'COURSE_COMPLETED'; employeeId: string; courseId: string }
  | { type: 'EXAM_PASSED'; employeeId: string; levelId: string }
  | { type: 'BADGE_EARNED'; employeeId: string; badgeId: string }
  | { type: 'EMPLOYEE_CREATED'; employeeId: string }
  | { type: 'EMPLOYEE_DEACTIVATED'; employeeId: string };

class ProgressOrchestrator {
  async handle(event: TrainingEvent): Promise<void> {
    switch (event.type) {
      case 'COURSE_COMPLETED':
        await this.updateCourseProgress(event);
        await this.checkLevelUnlock(event);       // ¿Desbloquear examen?
        break;
        
      case 'EXAM_PASSED':
        await this.completLevel(event);
        await this.checkBadgeCompletion(event);   // ¿Insignia completa?
        await this.generateLevelCertificate(event);
        await this.unlockNextLevel(event);        // Desbloquear siguiente
        break;
        
      case 'BADGE_EARNED':
        await this.generateBadgeCertificate(event);
        await this.updateEmployeeNavbar(event);   // studyProgress en Employee
        await this.unlockNextBadge(event);
        break;
        
      case 'EMPLOYEE_CREATED':
        await this.initializeProgress(event);     // D21: asignación automática
        break;
        
      case 'EMPLOYEE_DEACTIVATED':
        await this.freezeProgress(event);         // D22: active = false
        break;
    }
  }
}
```

### 4. Template Method — Generación de Certificados

```typescript
abstract class CertificateGenerator {
  // Template method — define el flujo
  async generate(employeeId: string, data: CertificateData): Promise<ICertificate> {
    const variables = await this.resolveVariables(employeeId, data);
    const message = this.applyTemplate(variables);
    const pdf = await this.generatePDF(message, variables);
    return this.saveCertificate(employeeId, data, message, pdf);
  }
  
  // Pasos concretos que cambian según el tipo
  protected abstract resolveVariables(employeeId: string, data: CertificateData): Promise<CertificateVariables>;
  
  // Pasos comunes
  private applyTemplate(variables: CertificateVariables): string { /* ... */ }
  private async generatePDF(message: string, variables: CertificateVariables): Promise<Buffer> { /* ... */ }
  private async saveCertificate(...): Promise<ICertificate> { /* ... */ }
}

class LevelCertificateGenerator extends CertificateGenerator {
  protected async resolveVariables(employeeId: string, data: CertificateData) {
    // Resuelve variables específicas de nivel
  }
}

class BadgeCertificateGenerator extends CertificateGenerator {
  protected async resolveVariables(employeeId: string, data: CertificateData) {
    // Resuelve variables específicas de insignia
  }
}
```

### 5. Builder Pattern — Construcción de Reportes Complejos

```typescript
class HonorTableBuilder {
  private quarter: number;
  private year: number;
  private employees: IHonorTableEntry[] = [];
  
  setQuarter(q: number, y: number): this {
    this.quarter = q;
    this.year = y;
    return this;
  }
  
  async loadReports(): Promise<this> {
    // Agregar horas por empleado en el trimestre
    this.employees = await StudyReport.aggregate([
      { $match: { quarter: this.quarter, year: this.year } },
      { $group: { _id: '$employee', totalSeconds: { $sum: '$totalSeconds' } } },
      { $sort: { totalSeconds: -1 } }
    ]);
    return this;
  }
  
  excludeInactive(): this {
    // Filtrar empleados inactivos (D22)
    return this;
  }
  
  assignPositions(): this {
    this.employees.forEach((e, i) => e.position = i + 1);
    return this;
  }
  
  assignBonusRanges(ranges: IBonusRange[]): this {
    // Asignar rango según horas totales
    return this;
  }
  
  build(): IHonorTable {
    return { quarter: this.quarter, year: this.year, entries: this.employees };
  }
}
```

### 6. Singleton Pattern — TrainingConfig

```typescript
class TrainingConfigService {
  private static instance: TrainingConfigService;
  private cachedConfig: ITrainingConfig | null = null;
  private lastFetch: number = 0;
  private TTL = 60_000; // Cache por 1 minuto
  
  static getInstance(): TrainingConfigService {
    if (!this.instance) this.instance = new TrainingConfigService();
    return this.instance;
  }
  
  async getConfig(): Promise<ITrainingConfig> {
    if (this.cachedConfig && Date.now() - this.lastFetch < this.TTL) {
      return this.cachedConfig;
    }
    this.cachedConfig = await TrainingConfig.findOne() || await this.createDefault();
    this.lastFetch = Date.now();
    return this.cachedConfig;
  }
  
  invalidateCache(): void {
    this.cachedConfig = null;
  }
}
```

---

## Principios SOLID Aplicados

| Principio | Aplicación en Training |
|-----------|----------------------|
| **S** — Single Responsibility | Controller solo HTTP. Service solo lógica. Model solo datos. Validator solo validación. |
| **O** — Open/Closed | Strategy para evaluación (nuevo tipo de pregunta = nueva strategy, no modificar existentes). Observer para eventos de progreso. |
| **L** — Liskov Substitution | `CertificateGenerator` — Level y Badge generators son intercambiables donde se espera el abstract. |
| **I** — Interface Segregation | Contracts pequeños y específicos por dominio (no un "ITrainingService" gigante) |
| **D** — Dependency Inversion | Controllers dependen de services (abstracciones), no de models directamente. Services encapsulan el acceso a datos. |

---

## Resumen de Mejoras vs Arquitectura Actual

| Aspecto | Módulos existentes | Módulo Training (nuevo) |
|---------|-------------------|------------------------|
| Capa de servicios | ❌ No existe | ✅ `services/training/` |
| Fat controllers | ❌ 200-500 líneas | ✅ 10-20 líneas (solo HTTP) |
| Lógica en modelo | ❌ CSW.ts tiene 600+ líneas | ✅ Modelos solo schema + validación Mongoose |
| Orquestación de eventos | ❌ Manual en cada controller | ✅ ProgressOrchestrator centralizado |
| Evaluación | ❌ Hardcoded | ✅ Strategy pattern |
| Certificados | — (no existe) | ✅ Template method |
| Config singleton | ❌ Re-lee cada vez | ✅ Cache con TTL |
| Testing unitario | ❌ Difícil (todo acoplado) | ✅ Services testeables sin HTTP |

**Nota importante:** No se refactorean los módulos existentes. Estos patrones solo aplican al nuevo módulo Training. Los módulos actuales siguen funcionando tal cual. A futuro, si se quiere mejorar un módulo existente, se puede migrar gradualmente al patrón de services.

---

## Checklist de Implementación (para cada sub-módulo)

Para cada feature del módulo Training, seguir este orden:

1. ☐ Model (`models/training/X.ts`) — Schema Mongoose + interfaces
2. ☐ Validator (`validators/training/x.validator.ts`) — Zod schemas
3. ☐ Service (`services/training/x.service.ts`) — Lógica de negocio
4. ☐ Controller (`controllers/training/x.controller.ts`) — Solo HTTP
5. ☐ Routes (`routes/training/x.routes.ts`) — Rutas + middleware
6. ☐ Tests (si se piden) — Service tests unitarios
