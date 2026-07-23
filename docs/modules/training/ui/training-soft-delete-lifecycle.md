# Diseño — Soft Delete Lifecycle para Training Entities

## Alcance

Aplicar el mismo patrón de lifecycle que ya funciona en **Categorías de la Biblioteca** a todas las entidades de Training:

- **Insignias** (Badges)
- **Niveles** (Levels)
- **Cursos** (Courses)
- **Exámenes** (Exams)

## Patrón (idéntico a Library Categories)

```
Activo → Soft Delete → [Vista Eliminados] → Restaurar (vuelve Activo)
                                           → Hard Delete (eliminación permanente)
```

## UI en TrainingManage

### Filtro por estado (cada tab)

Cada tab (Insignias, Niveles, Cursos, Exámenes) tendrá un **select de estado**:

```
[Activos ▼]  →  Activos | Eliminados
```

- **Activos** (default): muestra solo entidades no eliminadas
- **Eliminados**: muestra solo soft-deleted, con botones Restaurar + Hard Delete

### Acciones por estado

| Estado | Acciones visibles |
|--------|-------------------|
| Activo | Editar, Eliminar (soft) |
| Eliminado | Restaurar, Eliminar Permanentemente |

### Modales

| Acción | Modal | Comportamiento |
|--------|-------|----------------|
| Soft Delete | `DeleteConfirmModal` | "¿Está seguro de eliminar este {tipo}?" |
| Restaurar | Modal verde | "¿Restaurar este {tipo}? Volverá a estar activo." |
| Hard Delete | `HardDeleteModal` | Escribir nombre exacto para confirmar. IRREVERSIBLE. |

---

## Backend — Endpoints necesarios

### Para cada entidad (badges, levels, courses, exams):

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `?includeDeleted=true` | Listar incluyendo soft-deleted |
| POST | `/:id/restore` | Restaurar soft-deleted → activo |
| DELETE | `/:id/permanent` | Hard delete (eliminar de la BD) |

### Validaciones al eliminar

| Entidad | Regla al soft-delete |
|---------|---------------------|
| **Badge** | Desasocia niveles (no los elimina). Los niveles quedan huérfanos. |
| **Level** | Desasocia examen + quita ref de la insignia. Cursos quedan sin nivel. |
| **Course** | Quita ref del nivel. Decrementa contadores. |
| **Exam** | Quita ref del nivel. |

### Validaciones al hard-delete

| Entidad | Regla |
|---------|-------|
| **Badge** | Solo si está soft-deleted y no tiene niveles activos. |
| **Level** | Solo si está soft-deleted y no tiene cursos activos. |
| **Course** | Solo si está soft-deleted. |
| **Exam** | Solo si está soft-deleted. |

---

## Backend — Implementación

### Archivos a modificar:

| Archivo | Cambio |
|---------|--------|
| `services/training/badge.service.ts` | Agregar: `restore()`, `hardDelete()`, `getAll({ includeDeleted })` |
| `services/training/level.service.ts` | Agregar: `restore()`, `hardDelete()`, `getAll({ includeDeleted })` |
| `services/training/course.service.ts` | Agregar: `restore()`, `hardDelete()`, `getAll({ includeDeleted })` |
| `services/training/exam.service.ts` | Agregar: `restore()`, `hardDelete()` |
| `routes/training/badges.routes.ts` | Agregar: `POST /:id/restore`, `DELETE /:id/permanent` |
| `routes/training/levels.routes.ts` | Agregar: `POST /:id/restore`, `DELETE /:id/permanent` |
| `routes/training/courses.routes.ts` | Agregar: `POST /:id/restore`, `DELETE /:id/permanent` |
| `routes/training/exams.routes.ts` | Agregar: `POST /:id/restore`, `DELETE /:id/permanent` |
| Controllers correspondientes | Agregar funciones `restore` y `hardDelete` |

### Cambio en GET (listar):

```typescript
// Antes
router.get('/', authMiddleware, requirePermission('training', 'read'), getAll);

// Ahora: acepta ?includeDeleted=true
// El service filtra: si includeDeleted → setOptions({ includeDeleted: true })
// Si no → solo retorna activos (comportamiento default del softDelete plugin)
```

---

## Frontend — Implementación

### Archivos a modificar:

| Archivo | Cambio |
|---------|--------|
| `TrainingManage.tsx` | Agregar state `statusFilter` por tab + lógica condicional de botones |
| `api/services/training.ts` | Agregar métodos: `restoreBadge`, `hardDeleteBadge`, etc. |

### Nuevo en cada tab:

```tsx
// Select de filtro
<select value={statusFilter} onChange={...}>
  <option value="active">Activos</option>
  <option value="deleted">Eliminados</option>
</select>

// En vista "Eliminados": cambiar botones
{statusFilter === 'deleted' ? (
  <>
    <button title="Restaurar">↩️</button>
    <button title="Eliminar permanentemente">🗑️</button>
  </>
) : (
  <>
    <button title="Editar">✏️</button>
    <button title="Eliminar">🗑️</button>
  </>
)}
```

### Modales reutilizados:
- `DeleteConfirmModal` — ya existe (de employees)
- `HardDeleteModal` — ya existe (de ui/modal)
- Modal verde de restaurar — copiar patrón de `LibraryCategories.tsx`

---

## Orden de implementación

1. **Backend**: Agregar restore + hardDelete a los 4 servicios + controllers + routes
2. **Frontend API**: Agregar métodos al service `training.ts`
3. **Frontend UI**: Agregar filtro de estado + botones condicionales + modales a `TrainingManage.tsx`
4. **Testing**: Verificar flujo completo por entidad

---

## Estimación

- Backend: ~200 líneas (4 entidades × restore + hardDelete)
- Frontend API: ~40 líneas (8 métodos nuevos)
- Frontend UI: ~150 líneas (filtro + condicionales + modales)
- **Total estimado: ~400 líneas**
