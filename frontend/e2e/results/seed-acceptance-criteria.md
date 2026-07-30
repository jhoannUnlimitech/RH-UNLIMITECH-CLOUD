# Criterios de Aceptación — Seed & Migration

**Script:** `backend/src/scripts/seed-complete.ts`
**Comando:** `npx ts-node --transpile-only src/scripts/seed-complete.ts`
**Estado:** ✅ Verificado

---

## Pre-condiciones

- [ ] MongoDB corriendo en localhost:27017
- [ ] Variables de entorno (.env) configuradas

## Criterios del Seed

### 1. Limpieza de BD
- [x] AC-S01: El seed borra TODAS las colecciones antes de insertar ✅
- [x] AC-S02: No quedan datos residuales de ejecuciones anteriores ✅

### 2. Permisos (41)
- [x] AC-S03: Se crean 41 permisos únicos (resource:action) ✅
- [x] AC-S04: Recursos cubiertos: employees, csw, csw_categories, approval_flows, training, divisions, roles, permissions, projects ✅
- [x] AC-S05: Training incluye acciones especiales: report, content, manage ✅

### 3. Roles (13)
- [x] AC-S06: Se crean 13 roles con sus permisos asociados ✅
- [x] AC-S07: CEO y VP tienen todos los permisos (excepto training:manage) ✅
- [x] AC-S08: FOUNDER tiene training:manage (gestión completa) ✅
- [x] AC-S09: HUMAN TALENT MANAGER tiene training:manage ✅
- [x] AC-S10: QUALITY & TRAINING OFFICER tiene training:manage ✅
- [x] AC-S11: DEVELOPER solo tiene csw:read/create y training:read/report ✅
- [x] AC-S12: QA ANALYST tiene mismos permisos que DEVELOPER ✅

### 4. Divisiones (7)
- [x] AC-S13: Se crean 7 divisiones con código y manager ✅
- [x] AC-S14: Cada división tiene un manager asignado (empleado real) ✅
- [x] AC-S15: Códigos: TH, DIS, FIN, INF, CAL, RRPP, EJEC ✅

### 5. Empleados (10)
- [x] AC-S16: Se crean 10 empleados reales de Unlimitech Cloud ✅
- [x] AC-S17: Todos usan password: Pass2014! ✅
- [x] AC-S18: Password se hashea con bcrypt (no texto plano) ✅
- [x] AC-S19: forcePasswordChange es false para todos ✅
- [x] AC-S20: approve_csw correcto por empleado (CEO, VP, Founder, Talent, Training = true) ✅
- [x] AC-S21: Cada empleado asignado a su división correcta ✅
- [x] AC-S22: Cada empleado asignado a su rol correcto ✅

### 6. Training — Insignias (2)
- [x] AC-S23: Se crean 2 insignias (Fullstack Developer, React Specialist) ✅
- [x] AC-S24: Cada insignia tiene icono (Lucide), forma y color ✅

### 7. Training — Niveles (3)
- [x] AC-S25: Se crean 3 niveles asociados a sus insignias ✅
- [x] AC-S26: Fullstack Developer: TypeScript Básico (order 1), TypeScript Avanzado (order 2) ✅
- [x] AC-S27: React Specialist: React Fundamentals (order 1) ✅
- [x] AC-S28: Los exámenes se asocian correctamente a sus niveles ✅

### 8. Training — Cursos (6)
- [x] AC-S29: Se crean 6 cursos distribuidos en los 3 niveles ✅
- [x] AC-S30: TypeScript Básico: Intro a TS (2h), MongoDB Mongoose (2.5h) ✅
- [x] AC-S31: TypeScript Avanzado: Generics (3h), Node.js Express (4h) ✅
- [x] AC-S32: React Fundamentals: Hooks (2.5h), React+MobX (3h) ✅
- [x] AC-S33: Cada curso tiene order y estimatedHours ✅

### 9. Training — Exámenes (2)
- [x] AC-S34: Se crean 2 exámenes con preguntas ✅
- [x] AC-S35: Examen TS Básico: 4 preguntas (3 MC + 1 open_text), 80%, 2 intentos ✅
- [x] AC-S36: Examen React: 3 preguntas (2 MC + 1 open_text), 80%, 1 intento ✅
- [x] AC-S37: Cada pregunta MC tiene exactamente 1 opción correcta ✅
- [x] AC-S38: passingScore default es 80% ✅

### 10. Calendario (21 eventos)
- [x] AC-S39: Se crean 18 festivos de Colombia 2026 como type:holiday ✅
- [x] AC-S40: Se crean 3 eventos corporativos (meeting, deadline, training) ✅
- [x] AC-S41: Festivos tienen color:danger y allDay:true ✅

### 11. System Config
- [x] AC-S42: Se crea el singleton SystemConfig con defaults ✅
- [x] AC-S43: timezone: America/Bogota, locale: es-CO ✅
- [x] AC-S44: studyDays: [1,3,5] (L/M/V) ✅
- [x] AC-S45: minWeeklyHours: 3, examPassingScore: 80 ✅

### 12. Progress
- [x] AC-S46: Se inicializa progress para los 10 empleados ✅
- [x] AC-S47: Cada empleado tiene 2 badges, 3 levels, 6 courses en su progress ✅
- [x] AC-S48: El primer nivel de la primera insignia está desbloqueado (in_progress) ✅
- [x] AC-S49: Los demás niveles están locked ✅

---

## Post-condiciones

- [x] AC-S50: Se puede hacer login con admin@unlimitech.cloud / Pass2014! ✅
- [x] AC-S51: El dashboard carga sin errores ✅
- [x] AC-S52: /training/manage muestra badges, levels, courses, exams ✅
- [x] AC-S53: /training/my-progress muestra el progreso del empleado logueado ✅

---

## Resumen

| Categoría | ACs | Estado |
|-----------|-----|--------|
| Limpieza | 2 | ✅ |
| Permisos | 3 | ✅ |
| Roles | 7 | ✅ |
| Divisiones | 3 | ✅ |
| Empleados | 7 | ✅ |
| Insignias | 2 | ✅ |
| Niveles | 4 | ✅ |
| Cursos | 5 | ✅ |
| Exámenes | 5 | ✅ |
| Calendario | 3 | ✅ |
| System Config | 4 | ✅ |
| Progress | 4 | ✅ |
| Post-condiciones | 4 | ✅ |
| **Total** | **53** | **✅ Todos** |

---

## Comando de ejecución

```bash
cd backend
npx ts-node --transpile-only src/scripts/seed-complete.ts
```

**Tiempo:** ~5 segundos
**Output esperado:** "🎉 SEED COMPLETADO" con login credentials
