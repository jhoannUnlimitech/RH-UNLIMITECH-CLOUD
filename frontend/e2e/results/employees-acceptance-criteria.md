# Acceptance Criteria — Módulo Empleados (CRUD Completo)

## A. Crear Empleado — Happy Path

| AC | Descripción |
|----|-------------|
| AC-EMP-01 | Navegar a `/employees` muestra lista paginada de empleados |
| AC-EMP-02 | Botón "Crear Empleado" abre modal de formulario |
| AC-EMP-03 | Formulario muestra campos: nombre, email, contraseña, teléfono, cédula, nacionalidad, fecha nacimiento, hat, división |
| AC-EMP-04 | Select de hat carga todos los hats activos |
| AC-EMP-05 | Select de división carga todas las divisiones |
| AC-EMP-06 | Select de nacionalidad permite buscar países |
| AC-EMP-07 | Checkbox "Forzar cambio de contraseña" marcado por defecto al crear |
| AC-EMP-08 | Botón "Generar contraseña" genera password seguro |
| AC-EMP-09 | Indicador de fortaleza muestra weak/medium/strong |
| AC-EMP-10 | Submit con campos válidos → cierra modal, empleado aparece en tabla |
| AC-EMP-11 | Toast "Empleado creado exitosamente" aparece |

## B. Ver Empleado (modal read-only)

| AC | Descripción |
|----|-------------|
| AC-EMP-12 | Click "Ver" abre modal con datos completos del empleado |
| AC-EMP-13 | Muestra nombre, email, teléfono coincidentes con datos enviados |
| AC-EMP-14 | Muestra hat, división correctos |
| AC-EMP-15 | Muestra cédula y nacionalidad |
| AC-EMP-16 | Muestra estado "Activo" con badge |
| AC-EMP-17 | Modal se cierra con botón X o click fuera |

## C. Editar Empleado

| AC | Descripción |
|----|-------------|
| AC-EMP-18 | Click "Editar" abre modal con datos precargados |
| AC-EMP-19 | Puede cambiar nombre, teléfono, cédula |
| AC-EMP-20 | Puede cambiar hat y división |
| AC-EMP-21 | Puede cambiar nacionalidad |
| AC-EMP-22 | Campo password es opcional en edición |
| AC-EMP-23 | Puede activar/desactivar flag `forcePasswordChange` |
| AC-EMP-24 | Submit actualiza empleado → cambios reflejados en tabla |
| AC-EMP-25 | Toast "Empleado actualizado exitosamente" aparece |

## D. Suspender Empleado (Toggle Status)

| AC | Descripción |
|----|-------------|
| AC-EMP-26 | Botón "Suspender" visible en fila del empleado activo |
| AC-EMP-27 | Al suspender, status cambia a "Inactivo" |
| AC-EMP-28 | Badge de status muestra "Inactivo" (rojo) |
| AC-EMP-29 | Empleado suspendido NO puede hacer login (error "cuenta inactiva") |
| AC-EMP-30 | Botón "Activar" visible en fila del empleado inactivo |
| AC-EMP-31 | Al activar, status vuelve a "Activo" |
| AC-EMP-32 | No puede suspender su propia cuenta |

## E. Eliminar Empleado

| AC | Descripción |
|----|-------------|
| AC-EMP-33 | Click "Eliminar" muestra modal de confirmación con nombre |
| AC-EMP-34 | Confirmar → empleado desaparece de la lista (soft delete) |
| AC-EMP-35 | Cancelar → empleado permanece |
| AC-EMP-36 | No puede eliminar su propia cuenta |
| AC-EMP-37 | Toast "Empleado eliminado exitosamente" aparece |

## F. Búsqueda y Filtros

| AC | Descripción |
|----|-------------|
| AC-EMP-38 | Búsqueda por nombre filtra la tabla |
| AC-EMP-39 | Búsqueda por email filtra la tabla |
| AC-EMP-40 | Búsqueda por cédula filtra la tabla |
| AC-EMP-41 | Filtro por división muestra solo empleados de esa división |
| AC-EMP-42 | Paginación: cambiar de página carga nuevos empleados |
| AC-EMP-43 | Items por página: cambiar recarga la tabla |

## G. Login del Empleado Creado

| AC | Descripción |
|----|-------------|
| AC-EMP-44 | Empleado creado puede hacer login con email y password asignado |
| AC-EMP-45 | Con `forcePasswordChange: true`, redirige a `/change-password` |
| AC-EMP-46 | Después de cambiar contraseña, puede acceder al dashboard |
| AC-EMP-47 | Puede ver su perfil en `/profile` con datos correctos |

## H. Validaciones del Formulario

| AC | Descripción |
|----|-------------|
| AC-EMP-48 | Nombre vacío → error "El nombre es requerido" |
| AC-EMP-49 | Nombre < 3 chars → error de longitud |
| AC-EMP-50 | Email vacío → error "El email es requerido" |
| AC-EMP-51 | Email inválido → error de formato |
| AC-EMP-52 | Email duplicado → error "ya está registrado" |
| AC-EMP-53 | Password vacío (crear) → error "contraseña requerida" |
| AC-EMP-54 | Password < 6 chars → error de longitud |
| AC-EMP-55 | Teléfono vacío → error "requerido" |
| AC-EMP-56 | Cédula vacía → error "requerida" |
| AC-EMP-57 | Cédula duplicada → error "ya registrada" |
| AC-EMP-58 | Nacionalidad vacía → error "requerida" |
| AC-EMP-59 | Fecha nacimiento vacía → error "requerida" |
| AC-EMP-60 | Edad < 18 → error "mayor de 18 años" |
| AC-EMP-61 | Hat vacío → error "Debe seleccionar un hat" |
| AC-EMP-62 | División vacía → error "Debe seleccionar una división" |

## I. Anotaciones data-test-*

| AC | Descripción |
|----|-------------|
| AC-EMP-63 | `data-test-context="employees-list"` en contenedor principal |
| AC-EMP-64 | `data-test-key="create-employee-button"` en botón crear |
| AC-EMP-65 | `data-test-key="search-input"` en campo de búsqueda |
| AC-EMP-66 | `data-test-key="division-filter"` en filtro de división |
| AC-EMP-67 | `data-test-context="employee-form-modal"` en modal crear/editar |
| AC-EMP-68 | Todos los inputs del form con `data-test-key` correspondiente |
| AC-EMP-69 | Botones ver/editar/suspender/eliminar con `data-test-key` por fila |
| AC-EMP-70 | `data-test-context="employee-view-modal"` en modal ver |
| AC-EMP-71 | `data-test-context="employee-delete-modal"` en modal eliminar |

---

## Status

| Sección | ACs | Tests | Result |
|---------|-----|-------|--------|
| A. Crear Empleado | 11 | ⏳ | ⏳ Pending |
| B. Ver Empleado | 6 | ⏳ | ⏳ Pending |
| C. Editar Empleado | 8 | ⏳ | ⏳ Pending |
| D. Suspender | 7 | ⏳ | ⏳ Pending |
| E. Eliminar | 5 | ⏳ | ⏳ Pending |
| F. Búsqueda/Filtros | 6 | ⏳ | ⏳ Pending |
| G. Login del creado | 4 | ⏳ | ⏳ Pending |
| H. Validaciones | 15 | ⏳ | ⏳ Pending |
| I. Anotaciones | 9 | ⏳ | ⏳ Pending |
| **Total** | **71** | | **⏳ Pending** |

---

## Specs a Crear

```
frontend/e2e/specs/
├── happy-path/
│   ├── employees-create.spec.ts             ← Crear empleado + verificar en tabla + ver datos
│   ├── employees-edit-suspend-delete.spec.ts ← Editar + ver + suspender + eliminar
│   └── employees-login-created.spec.ts      ← Login → forcePasswordChange → cambiar → dashboard → profile
└── validation/
    └── employees-form-validation.spec.ts    ← Validaciones de campos requeridos y formato
```

## Datos de Test del Empleado a Crear

| Campo | Valor |
|-------|-------|
| Nombre | QA Test Employee |
| Email | qa-employee-{timestamp}@emxeecta.mailosaur.net |
| Password | TestPass2024! |
| Teléfono | +573109876543 |
| Cédula | 1234567890 |
| Nacionalidad | Colombia |
| Fecha Nacimiento | 1990-05-15 |
| Hat | DEVELOPER |
| División | División 4 — Infraestructura |
| forcePasswordChange | true |

## Flujo de Test Completo (Lifecycle)

```
1. Login como admin (Moises/Manuel — tiene employees:create)
2. Crear empleado con datos de test
3. Buscar empleado por nombre → verificar en tabla
4. Ver empleado → validar datos coinciden
5. Editar empleado → cambiar teléfono → verificar
6. Suspender empleado → verificar badge "Inactivo"
7. Intentar login con empleado suspendido → error
8. Reactivar empleado → verificar badge "Activo"
9. Login con empleado → redirige a /change-password
10. Cambiar contraseña → accede al dashboard
11. Verificar perfil en /profile con datos correctos
12. Eliminar empleado → confirmar → desaparece de lista
```
