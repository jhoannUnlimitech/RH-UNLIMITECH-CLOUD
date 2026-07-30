# Phase 4 — Certificados + Dashboard Admin

## Plan de Implementación

**Rama:** `solution/training-phase-4`
**Base:** `qa/training-phase-3`
**Estado:** 🚧 En desarrollo

---

## Análisis: Qué ya existe vs qué falta

### Ya implementado (de phases anteriores)
- ✅ SystemConfig (slice 30): timezone, studyDays, minWeeklyHours, examPassingScore
- ✅ Permissions seed (slice 33): training:read/create/update/delete/report/content/manage
- ✅ Sidebar items con permisos
- ✅ Bonus Ranges + Records (bonificaciones trimestrales)
- ✅ Honor Table (ranking trimestral)
- ✅ Attendance (pase de lista)
- ✅ Study Reports (reporte de estudio)

### Pendiente para Phase 4 (priorizados por impacto)

| Prioridad | Slice | Descripción | Complejidad |
|-----------|-------|-------------|-------------|
| 🔴 ALTA | 27 | Certificate Model + Auto-generation | Media |
| 🔴 ALTA | 28 | PDF Generation (jsPDF) | Media |
| 🔴 ALTA | 31 | Dashboard Admin Backend (métricas + alertas) | Alta |
| 🟡 MEDIA | 34 | Dashboard Admin Frontend (UI + gráficas) | Alta |
| 🟡 MEDIA | 32 | Navbar Badge Integration | Baja |
| 🟢 BAJA | 29 | Study Plans (planes personalizados) | Media |

---

## Slice 27 — Certificate Model + Auto-generation

### Backend
```
backend/src/models/training/Certificate.ts
backend/src/services/training/certificate.service.ts
backend/src/controllers/training/certificate.controller.ts
backend/src/routes/training/certificates.routes.ts
```

### Modelo
```typescript
interface ICertificate {
  employee: ObjectId;
  type: 'level' | 'badge';
  referenceId: ObjectId;         // Level._id o Badge._id
  referenceName: string;         // Snapshot del nombre
  title: string;                 // "Certificado de TypeScript Básico"
  variables: {
    employeeName: string;
    employeeDivision: string;
    employeeHat: string;
    completedDate: string;
    totalHours: number;
    levelName?: string;
    badgeName?: string;
    examScore?: number;
  };
  pdfUrl?: string;               // URL o base64 del PDF generado
  issuedAt: Date;
  createdAt: Date;
}
```

### Auto-generation triggers
- Al completar un nivel (exam passed) → `generateLevelCertificate()`
- Al completar todos los niveles de una insignia → `generateBadgeCertificate()`

### Endpoints
- `GET /training/certificates/me` — Mis certificados
- `GET /training/certificates/:id/download` — Descargar PDF
- `POST /training/certificates/:id/regenerate` — Regenerar (admin)

---

## Slice 28 — PDF Generation

### Librería: `jsPDF` (ligera, sin dependencias del sistema)

### Layout del PDF
```
┌─────────────────────────────────────────┐
│              [LOGO EMPRESA]              │
│                                         │
│          CERTIFICADO DE LOGRO           │
│                                         │
│   Se certifica que                      │
│                                         │
│        **NOMBRE DEL EMPLEADO**          │
│                                         │
│   Ha completado exitosamente:           │
│   [Nivel/Insignia: NOMBRE]             │
│                                         │
│   Con una dedicación de X horas         │
│   Fecha: DD/MM/YYYY                     │
│                                         │
│   ────────────────────────────          │
│   [Firma]                               │
│   Nombre del firmante                   │
│   Cargo del firmante                    │
│                                         │
│   Unlimitech Cloud                      │
└─────────────────────────────────────────┘
```

---

## Slice 31 — Dashboard Admin Backend

### Métricas (endpoint: GET /training/dashboard/overview)
```json
{
  "totalEmployeesInTraining": 10,
  "averageStudyHoursThisWeek": 4.5,
  "examPassRate": 85,
  "employeesWithoutReportThisWeek": 3,
  "pendingEvaluations": 2,
  "pendingBonuses": 1
}
```

### Distribución por nivel (endpoint: GET /training/dashboard/by-level)
```json
[
  { "level": "TypeScript Básico", "count": 5, "percentage": 50 },
  { "level": "TypeScript Avanzado", "count": 3, "percentage": 30 },
  { "level": "React Fundamentals", "count": 2, "percentage": 20 }
]
```

### Alertas (endpoint: GET /training/dashboard/alerts)
```json
[
  { "type": "pending_evaluation", "count": 2, "message": "2 exámenes pendientes de evaluación" },
  { "type": "no_report", "count": 3, "employees": [...], "message": "3 empleados sin reporte esta semana" },
  { "type": "stalled", "count": 1, "message": "1 empleado sin progreso en +2 semanas" }
]
```

---

## Slice 34 — Dashboard Frontend

### Componentes
- `TrainingDashboard.tsx` — Página principal
- Stats cards (4): total empleados, horas trimestre, tasa aprobación, sin reporte
- Gráfica: distribución por nivel (ApexCharts pie)
- Gráfica: horas de estudio por semana (ApexCharts bar)
- Lista de alertas con acciones (evaluar, reactivar, ver)
- Tabla de empleados con búsqueda + click → detalle

### Ruta: `/training/admin/dashboard`
(Ya existe la ruta en App.tsx, apunta a TrainingManage como placeholder)

---

## Orden de implementación recomendado

```
1. Slice 31: Dashboard Backend (métricas + alertas)
   → Frontend ya tiene ruta placeholder
   
2. Slice 34: Dashboard Frontend UI
   → Usa los endpoints del slice 31
   
3. Slice 27: Certificate Model
   → Crea modelo + auto-generation al completar level/badge
   
4. Slice 28: PDF Generation
   → Instala jsPDF + genera el PDF
   
5. Slice 32: Navbar Badge Integration
   → Último (cosmético, bajo impacto)
```

---

## Dependencias externas nuevas

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `jspdf` | ^2.5 | Generación de PDF de certificados |
| (ApexCharts ya está) | — | Gráficas del dashboard |

---

## Estimación

| Slice | Backend | Frontend | Total |
|-------|---------|----------|-------|
| 31 — Dashboard Backend | 2-3h | — | 2-3h |
| 34 — Dashboard Frontend | — | 3-4h | 3-4h |
| 27 — Certificate Model | 2h | 1h | 3h |
| 28 — PDF Generation | 2h | 1h | 3h |
| 32 — Navbar Badge | 1h | 1h | 2h |
| **Total** | **7-8h** | **6-7h** | **13-15h** |
