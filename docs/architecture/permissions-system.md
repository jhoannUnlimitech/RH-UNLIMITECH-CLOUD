# Sistema de Control de Acceso Basado en Roles y Permisos

## Descripción General

Se ha implementado un sistema completo de control de acceso basado en roles y permisos que protege tanto el acceso a módulos completos como acciones específicas dentro de cada módulo.

---

## Componentes del Sistema

### 1. **Utilidades de Permisos** (`utils/permissions.ts`)

Funciones auxiliares para verificar permisos:

- `hasPermission(permissions, resource, action)`: Verifica un permiso específico
- `hasAnyPermissionInResource(permissions, resource)`: Verifica si tiene al menos un permiso en un recurso
- `getResourcePermissions(permissions, resource)`: Obtiene todos los permisos de un recurso
- `hasAllPermissions(permissions, checks)`: Verifica múltiples permisos (todos requeridos)
- `hasAnyPermission(permissions, checks)`: Verifica múltiples permisos (al menos uno)

**Recursos disponibles:**
- `employees`, `divisions`, `roles`, `permissions`, `csw`, `csw_categories`, `approval_flows`, `training`, `policies`, `tasks`

**Acciones disponibles:**
- `read`, `create`, `update`, `delete`, `approve`, `cancel`

---

### 2. **Hook de Permisos** (`hooks/usePermissions.ts`)

Hook personalizado que proporciona acceso fácil a las verificaciones de permisos:

```typescript
const { can, canAccessResource, getResourcePermissions } = usePermissions();

// Verificar permiso específico
if (can('employees', 'create')) {
  // Mostrar botón crear
}

// Verificar acceso a recurso
if (canAccessResource('roles')) {
  // Mostrar módulo en sidebar
}
```

---

### 3. **Componente de Protección de Rutas** (`components/common/ProtectedRoute.tsx`)

Protege rutas completas basándose en permisos:

```tsx
<ProtectedRoute resource="employees">
  <EmployeesList />
</ProtectedRoute>
```

Si el usuario no tiene ningún permiso en el recurso, es redirigido a `/unauthorized`.

---

### 4. **Página de Acceso Denegado** (`pages/Unauthorized.tsx`)

Página amigable que se muestra cuando un usuario intenta acceder a un módulo sin permisos.

---

### 5. **Componentes de UI con Permisos**

#### **TableActions** (`components/common/TableActions.tsx`)
Botones de acción para tablas que se muestran según permisos:

```tsx
<TableActions
  resource="employees"
  onView={() => handleView(employee)}
  onEdit={() => handleEdit(employee._id)}
  onDelete={() => handleDelete(employee._id, employee.name)}
/>
```

- Solo muestra el botón "Ver" si tiene permiso `read`
- Solo muestra el botón "Editar" si tiene permiso `update`
- Solo muestra el botón "Eliminar" si tiene permiso `delete`

#### **CreateButton** (`components/common/CreateButton.tsx`)
Botón de crear que solo se muestra si tiene permiso:

```tsx
<CreateButton
  resource="employees"
  onClick={createModal.openModal}
  label="Nuevo Empleado"
/>
```

Solo se renderiza si el usuario tiene permiso `create` en el recurso.

---

### 6. **Sidebar Filtrado** (`layout/AppSidebar.tsx`)

El sidebar filtra automáticamente los módulos según los permisos del usuario:

- Si no tiene ningún permiso en un módulo, no se muestra en el sidebar
- Los submenús se filtran para mostrar solo las opciones accesibles
- Si un menú padre no tiene submenús visibles, se oculta completamente

---

## Implementación en Rutas

En `App.tsx`, todas las rutas están protegidas:

```tsx
<Route 
  path="/employees" 
  element={
    <PermissionProtectedRoute resource="employees">
      <EmployeesList />
    </PermissionProtectedRoute>
  } 
/>
```

---

## Flujo de Seguridad

1. **Usuario inicia sesión** → Recibe token JWT con información de rol y permisos
2. **Permisos cargados** → Se almacenan en `authStore.user.role.permissions`
3. **Sidebar renderiza** → Filtra módulos según `canAccessResource()`
4. **Usuario navega** → `ProtectedRoute` verifica permiso antes de renderizar
5. **Acciones en tabla** → `TableActions` muestra solo botones permitidos
6. **Botones de crear** → `CreateButton` solo se renderiza con permiso `create`

---

## Ejemplo de Implementación en un Módulo

### Paso 1: Proteger la Ruta
```tsx
<Route 
  path="/divisions" 
  element={
    <PermissionProtectedRoute resource="divisions">
      <DivisionsList />
    </PermissionProtectedRoute>
  } 
/>
```

### Paso 2: Usar TableActions
```tsx
import { TableActions } from "../../components/common/TableActions";

<TableCell>
  <TableActions
    resource="divisions"
    onView={() => handleView(division)}
    onEdit={() => handleEdit(division._id)}
    onDelete={() => handleDelete(division._id, division.name)}
  />
</TableCell>
```

### Paso 3: Usar CreateButton
```tsx
import { CreateButton } from "../../components/common/CreateButton";

<CreateButton
  resource="divisions"
  onClick={createModal.openModal}
  label="Nueva División"
/>
```

### Paso 4: Agregar al Sidebar
```tsx
{
  name: "Divisiones",
  icon: <BoxCubeIcon />,
  path: "/divisions",
  resource: "divisions" // Agrega el recurso para filtrado
}
```

---

## Validación en Backend

**Importante:** Este sistema de permisos es solo en el frontend (UX). El backend DEBE validar todos los permisos en cada endpoint para garantizar seguridad real.

El backend ya tiene middleware de permisos (`middleware/permission.ts`) que debe usarse en todas las rutas sensibles.

---

## Beneficios del Sistema

✅ **Seguridad en capas** - Frontend + Backend
✅ **UX mejorada** - Usuario solo ve lo que puede hacer
✅ **Reutilizable** - Componentes y hooks centralizados
✅ **Escalable** - Fácil agregar nuevos recursos y permisos
✅ **Mantenible** - Lógica centralizada en utilidades
✅ **Consistente** - Misma lógica en todo el sistema

---

## Extensión para Nuevos Módulos

Para agregar control de permisos a un nuevo módulo:

1. Agregar el recurso a `PermissionResource` en `utils/permissions.ts`
2. Proteger las rutas con `PermissionProtectedRoute`
3. Usar `TableActions` en las tablas
4. Usar `CreateButton` para botones de crear
5. Agregar el recurso en el sidebar
6. Verificar permisos en el backend

---

## Estado Actual

✅ **Implementado:**
- Sistema completo de utilidades y hooks
- Protección de rutas
- Página de acceso denegado
- Componentes de UI con permisos
- Sidebar filtrado
- Módulo de Employees actualizado

🔄 **Por Implementar:**
- Aplicar a módulos: Divisions, Roles, CSW, CSW Categories
- Documentar permisos específicos de cada módulo
- Tests unitarios

---

## Troubleshooting

**Problema:** Usuario no ve ningún módulo en el sidebar
- **Solución:** Verificar que el rol tenga permisos asignados en la base de datos

**Problema:** Usuario puede acceder a una ruta directamente pero no ve el botón
- **Solución:** Verificar que el recurso esté correctamente configurado en `ProtectedRoute`

**Problema:** Botones no se ocultan correctamente
- **Solución:** Asegurarse de usar los componentes `TableActions` y `CreateButton` en lugar de botones personalizados
