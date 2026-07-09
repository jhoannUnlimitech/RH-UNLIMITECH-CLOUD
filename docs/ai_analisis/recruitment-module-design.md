# Módulo de Reclutamiento Inteligente — Diseño de Arquitectura

## 1. Visión General

Plataforma de Reclutamiento Inteligente integrada al sistema RH Unlimitech Cloud. No es solo un "analizador de HV" — es un ATS (Applicant Tracking System) con motor de matching basado en reglas + IA explicativa.

### Flujo Principal

```
RH crea vacante (con asistencia IA)
        │
        ▼
Motor de Definición del Puesto
  (criterios, pesos, hard/soft skills)
        │
        ▼
Vacante Publicada
        │
   ┌────┴────┐
   │         │
Formulario  PDF de HV
   │         │
   └────┬────┘
        │
Procesamiento Documental
  (PDF → Markdown → JSON estructurado)
        │
        ▼
Base de Conocimiento del Candidato
        │
        ▼
Motor de Matching (reglas + IA)
        │
        ▼
Score + Explicación + Fortalezas/Riesgos
        │
        ▼
Pipeline ATS (flujo de etapas)
```

---

## 2. Colecciones Existentes (contexto)

| Colección | Relación con Reclutamiento |
|-----------|---------------------------|
| `Employee` | Empleados actuales — los contratados finales llegan aquí |
| `Role` (Hat) | Los puestos/hats existentes — las vacantes se crean para un hat |
| `Division` | Las áreas — cada vacante pertenece a una división |
| `Permission` | Permisos del sistema — definen acceso al módulo de reclutamiento |
| `Project` | Proyectos — contexto para el candidato (a qué proyecto se uniría) |

---

## 3. Nuevas Colecciones (Modelo de Datos)

### 3.1 `JobOpening` (Vacante)

```typescript
interface IJobOpening {
  // Identidad
  title: string;                    // "QA Automation Senior"
  code: string;                     // "VAC-2026-001" (autogenerado)
  
  // Relaciones con sistema existente
  hatId: ObjectId;                  // Ref → Role (el hat que se busca llenar)
  divisionId: ObjectId;             // Ref → Division
  reportToId?: ObjectId;            // Ref → Employee (jefe directo)
  projectId?: ObjectId;             // Ref → Project (proyecto al que se uniría)
  
  // Descripción
  description: string;              // Descripción general del puesto
  responsibilities: string[];       // Lista de responsabilidades
  
  // Requisitos
  requirements: {
    education: {
      level: 'technician' | 'bachelor' | 'master' | 'phd';
      field?: string;               // "Ingeniería de Sistemas"
      required: boolean;
    };
    experience: {
      minYears: number;
      maxYears?: number;
      description?: string;
    };
    languages: {
      language: string;
      level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
      required: boolean;
    }[];
    certifications: {
      name: string;
      required: boolean;
    }[];
  };
  
  // Condiciones
  salary: {
    min?: number;
    max?: number;
    currency: string;               // "COP"
    visible: boolean;               // Mostrar al candidato
  };
  modality: 'remote' | 'onsite' | 'hybrid';
  location?: string;
  schedule?: string;
  contractType: 'indefinite' | 'fixed' | 'services' | 'internship';
  
  // Criterios de Evaluación (Motor de Matching)
  criteria: IJobCriteria[];
  
  // IA
  aiGenerated?: {
    suggestedResponsibilities: string[];
    suggestedQuestions: string[];
    suggestedCriteria: IJobCriteria[];
    generatedAt: Date;
  };
  
  // Estado y flujo
  status: 'draft' | 'open' | 'paused' | 'closed' | 'filled';
  openedAt?: Date;
  closedAt?: Date;
  maxCandidates?: number;
  
  // Metadata
  createdBy: ObjectId;              // Ref → Employee (quien creó)
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 `JobCriteria` (Criterios de Evaluación — subdocumento)

```typescript
interface IJobCriteria {
  category: 'hard_skill' | 'soft_skill' | 'experience' | 'education' | 'language' | 'certification' | 'custom';
  name: string;                     // "Playwright", "Comunicación", "Inglés B2"
  weight: number;                   // 0-100 (peso relativo)
  required: boolean;                // Eliminatorio o deseable
  description?: string;             // Contexto adicional
  
  // Para evaluación por reglas
  evaluationType: 'binary' | 'scale' | 'years' | 'level';
  // binary: tiene/no tiene (0 o 100%)
  // scale: 1-5 (20% por punto)
  // years: años de experiencia vs requerido
  // level: nivel de idioma vs requerido
}
```

### 3.3 `Candidate` (Candidato — Base de Talentos)

```typescript
interface ICandidate {
  // Datos personales
  firstName: string;
  lastName: string;
  email: string;                    // Único
  phone?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  location?: string;
  
  // Documento procesado
  resume: {
    originalPdf?: string;           // URL al PDF almacenado
    markdown: string;               // PDF convertido a markdown
    structured: ICandidateProfile;  // JSON estructurado por IA
    processedAt: Date;
    processingModel?: string;       // "gpt-4o-mini" — track de costos
  };
  
  // Formulario (datos explícitos del candidato)
  formData?: {
    salaryExpectation?: number;
    availability?: string;          // "Inmediata", "2 semanas", "1 mes"
    willingToRelocate?: boolean;
    questions?: { question: string; answer: string }[];  // Preguntas filtro
  };
  
  // Estado global
  status: 'active' | 'blacklisted' | 'hired';
  source: 'form' | 'referral' | 'linkedin' | 'portal' | 'other';
  tags: string[];                   // Tags manuales: ["senior", "bilingüe"]
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
}
```

### 3.4 `ICandidateProfile` (JSON estructurado de la HV)

```typescript
interface ICandidateProfile {
  // Extraído del PDF por IA (una sola vez)
  skills: {
    name: string;
    category: 'hard' | 'soft';
    years?: number;
    level?: 'basic' | 'intermediate' | 'advanced' | 'expert';
  }[];
  
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    technologies?: string[];
  }[];
  
  education: {
    institution: string;
    degree: string;
    field: string;
    level: 'technician' | 'bachelor' | 'master' | 'phd';
    startDate: string;
    endDate?: string;
    current: boolean;
  }[];
  
  languages: {
    language: string;
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  }[];
  
  certifications: {
    name: string;
    issuer?: string;
    date?: string;
    expires?: string;
  }[];
  
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }[];
  
  totalExperienceYears: number;
  summary: string;                  // Resumen generado por IA
}
```

### 3.5 `Application` (Postulación — une candidato con vacante)

```typescript
interface IApplication {
  candidateId: ObjectId;            // Ref → Candidate
  jobOpeningId: ObjectId;           // Ref → JobOpening
  
  // Score (calculado por motor de reglas)
  score: {
    overall: number;                // 0-100 ponderado
    breakdown: {
      hardSkills: number;           // 0-100
      softSkills: number;
      experience: number;
      education: number;
      languages: number;
      certifications: number;
    };
    details: {
      criteriaId: string;
      criteriaName: string;
      weight: number;
      score: number;                // 0-100
      evidence: string;             // "Tiene 3 años con Playwright"
    }[];
    calculatedAt: Date;
  };
  
  // Explicación IA (generada una vez después del scoring)
  aiAnalysis?: {
    strengths: string[];            // "Experiencia sólida en testing"
    risks: string[];                // "No tiene inglés B2 requerido"
    suggestedQuestions: string[];    // Preguntas para la entrevista
    cultureFit?: string;            // Análisis de fit cultural
    generatedAt: Date;
  };
  
  // Pipeline (estado actual en el flujo)
  currentStage: string;             // ID de la etapa actual
  stages: IApplicationStage[];
  
  // Estado
  status: 'active' | 'rejected' | 'withdrawn' | 'hired';
  rejectionReason?: string;
  
  // Metadata
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.6 `IApplicationStage` (Etapa del Pipeline — subdocumento)

```typescript
interface IApplicationStage {
  stageId: string;                  // "review" | "screening" | "interview_hr" | ...
  name: string;                     // "Entrevista RH"
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  
  // Responsable
  assignedTo?: ObjectId;            // Ref → Employee
  assignedToName?: string;
  
  // Resultado
  result?: 'passed' | 'failed' | 'on_hold';
  rating?: number;                  // 1-10
  
  // Notas y feedback
  notes: {
    authorId: ObjectId;
    authorName: string;
    content: string;
    createdAt: Date;
    type: 'note' | 'feedback' | 'decision';
  }[];
  
  // Historial
  startedAt?: Date;
  completedAt?: Date;
}
```

### 3.7 `RecruitmentPipeline` (Definición del flujo — configurable por división)

```typescript
interface IRecruitmentPipeline {
  name: string;                     // "Pipeline Estándar Tech"
  divisionId?: ObjectId;            // Ref → Division (o null = global)
  
  stages: {
    id: string;                     // "review", "screening", "interview_hr", etc.
    name: string;                   // "Revisión Inicial"
    order: number;
    type: 'auto' | 'manual';        // auto = IA pre-filtra, manual = humano decide
    assignToRole?: string;          // "HUMAN TALENT MANAGER" → auto-asignar
    required: boolean;
    description?: string;
  }[];
  
  active: boolean;
  createdAt: Date;
}
```

---

## 4. Pipeline Estándar (Flujo por defecto)

```
1. Aplicación Recibida (auto)
   ↓
2. Procesamiento IA (auto)
   - PDF → Markdown → JSON
   - Cálculo de Score
   - Generación de análisis
   ↓
3. Pre-filtrado (auto/manual)
   - Score > umbral → pasa
   - Score < umbral → rechazado automáticamente
   - Score intermedio → revisión manual
   ↓
4. Revisión RH (manual — Laura/RRHH)
   - Revisa perfil completo
   - Deja notas
   - Decide: pasa o rechaza
   ↓
5. Entrevista RH (manual)
   - Agenda entrevista
   - Evalúa soft skills
   - Calificación 1-10
   ↓
6. Prueba Técnica (manual — jefe de área)
   - Asigna prueba
   - Evalúa resultado
   - Calificación 1-10
   ↓
7. Entrevista Técnica/Jefe de Área (manual)
   - Entrevista con jefe directo
   - Evalúa fit técnico y cultural
   - Calificación 1-10
   ↓
8. Presentación (manual — CEO/Director)
   - Presentación final al equipo directivo
   - Decisión go/no-go
   ↓
9. Oferta (manual — RRHH)
   - Genera oferta laboral
   - Envía al candidato
   ↓
10. Contratación (manual)
    - Candidato acepta
    - Se crea como Employee en el sistema
    - Flujo conecta con el módulo de Employees existente
```

---

## 5. IA — Dónde y Cómo se Usa

| Punto | Uso de IA | Modelo sugerido | Costo |
|-------|-----------|-----------------|-------|
| Crear vacante | Sugerir requisitos, competencias, preguntas | GPT-4o-mini | Bajo (~$0.01/vacante) |
| Procesar PDF | Extraer a JSON estructurado | GPT-4o-mini | Bajo (~$0.02/PDF) |
| Explicar match | Fortalezas, riesgos, preguntas sugeridas | GPT-4o-mini | Bajo (~$0.01/candidato) |
| Buscar candidatos | NLP → filtros de BD | GPT-4o-mini | Bajo |
| Redactar correos | Templates inteligentes | GPT-4o-mini | Mínimo |

**Costo estimado por candidato: ~$0.04 USD total**

### Optimización de Costos

1. **PDF → Markdown primero** (reduce tokens 70-80%)
2. **Procesar una sola vez** → guardar JSON, nunca reprocesar
3. **Score por reglas** (sin IA) — IA solo explica
4. **Batch processing** — procesar múltiples candidatos juntos
5. **Cache de sugerencias** — misma vacante no regenera

---

## 6. Motor de Matching (Reglas, no IA)

```typescript
function calculateScore(candidate: ICandidateProfile, criteria: IJobCriteria[]): Score {
  let totalWeight = 0;
  let totalScore = 0;
  
  for (const criterion of criteria) {
    totalWeight += criterion.weight;
    const candidateScore = evaluateCriterion(candidate, criterion);
    totalScore += candidateScore * criterion.weight;
  }
  
  return {
    overall: totalScore / totalWeight,
    // ... breakdown por categoría
  };
}

function evaluateCriterion(candidate: ICandidateProfile, criterion: IJobCriteria): number {
  switch (criterion.evaluationType) {
    case 'binary':
      // ¿Tiene la skill? → 100% o 0%
      return candidate.skills.some(s => s.name.toLowerCase().includes(criterion.name.toLowerCase())) ? 100 : 0;
    
    case 'years':
      // Años de experiencia vs requerido
      const exp = candidate.experience.filter(e => e.technologies?.includes(criterion.name));
      const years = calculateYears(exp);
      return Math.min(years / criterion.targetYears * 100, 100);
    
    case 'level':
      // Nivel de idioma vs requerido
      return compareLevels(candidate.languages, criterion.name, criterion.targetLevel);
    
    case 'scale':
      // Evaluación manual 1-5
      return 0; // Se llena durante entrevista
  }
}
```

**Ventaja: determinístico, auditable, económico, consistente.**

---

## 7. Integraciones con Módulos Existentes

| Módulo Existente | Integración |
|------------------|-------------|
| `Employee` | Al contratar → se crea Employee automáticamente |
| `Role` (Hat) | Vacante referencia el Hat que se busca |
| `Division` | Vacante pertenece a una División |
| `Project` | Vacante puede asociarse a un Proyecto |
| `ApprovalFlow` | Pipeline de reclutamiento similar al de CSW |
| `CalendarEvent` | Agendar entrevistas crea eventos |

---

## 8. Permisos Necesarios

| Recurso | Acciones | Quién |
|---------|----------|-------|
| `recruitment` | read | RRHH, CEO, Jefes de área |
| `recruitment` | create | RRHH |
| `recruitment` | update | RRHH |
| `recruitment` | manage_pipeline | RRHH |
| `recruitment` | evaluate | RRHH, Jefes de área (en su etapa) |
| `recruitment` | hire | RRHH, CEO |

---

## 9. Diagrama de Flujo del Módulo

```
┌──────────────────────────────────────────────────────────┐
│                    MÓDULO RECLUTAMIENTO                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │ Vacantes │───▶│ Candidatos   │───▶│ Aplicaciones   │  │
│  │ (CRUD)   │    │ (Base Talent)│    │ (Pipeline ATS) │  │
│  └─────────┘    └──────────────┘    └────────────────┘  │
│       │                │                     │           │
│       ▼                ▼                     ▼           │
│  ┌─────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │ Criterios│    │ Procesamiento│    │ Evaluaciones   │  │
│  │ + Pesos  │    │ PDF→JSON     │    │ + Notas        │  │
│  └─────────┘    └──────────────┘    └────────────────┘  │
│       │                │                     │           │
│       └────────────────┼─────────────────────┘           │
│                        ▼                                 │
│              ┌──────────────────┐                        │
│              │  Motor Matching  │                        │
│              │  (Reglas + IA)   │                        │
│              └──────────────────┘                        │
│                        │                                 │
│                        ▼                                 │
│              ┌──────────────────┐                        │
│              │ Score + Análisis │                        │
│              └──────────────────┘                        │
│                        │                                 │
│                        ▼                                 │
│              ┌──────────────────┐                        │
│              │   Contratación   │───▶ Employee (módulo   │
│              │   (fin flujo)    │     existente)         │
│              └──────────────────┘                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 10. Próximos Pasos

1. **Validar modelo de datos** con el equipo
2. **Crear colecciones** en MongoDB (models/)
3. **Implementar endpoints** CRUD básicos (vacantes, candidatos)
4. **Integrar procesamiento PDF** (pdf-parse → markdown → GPT → JSON)
5. **Motor de matching** (función pura, sin dependencias)
6. **Pipeline ATS** (basado en ApprovalFlow existente)
7. **Frontend** — páginas del módulo
8. **Tests e2e** — siguiendo la arquitectura establecida
