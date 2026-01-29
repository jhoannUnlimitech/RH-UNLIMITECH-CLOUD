# Patrón de Tabla Reutilizable

## Descripción General

Este documento describe el patrón estándar implementado en las tablas de la aplicación, utilizando la tabla de Divisiones como referencia. Este patrón puede ser reutilizado en otros módulos para mantener consistencia en la experiencia de usuario.

## Iconos de Acciones Estandarizados

Todas las tablas usan los iconos de WebForge para mantener consistencia visual:

```typescript
import { PencilIcon, TrashBinIcon, EyeIcon } from '../../icons';

// Botón Ver (cuando aplique)
<button
  onClick={() => handleView(item._id)}
  className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.05]"
  title="Ver detalles"
>
  <EyeIcon className="h-[18px] w-[18px]" />
</button>

// Botón Editar
<button
  onClick={() => handleEdit(item._id)}
  className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-white/[0.05]"
  title="Editar"
>
  <PencilIcon className="h-[18px] w-[18px]" />
</button>

// Botón Eliminar
<button
  onClick={() => handleDelete(item._id, item.name)}
  className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-white/[0.05]"
  title="Eliminar"
>
  <TrashBinIcon className="h-[18px] w-[18px]" />
</button>
```

**Estándares de Iconos:**
- Tamaño fijo: `h-[18px] w-[18px]`
- Colores: Gris (ver), Azul (editar), Rojo (eliminar)
- Estados hover con fondo de color
- Clases consistentes: `inline-flex items-center justify-center rounded-lg p-2`

**Columna de Acciones:**
```tsx
{/* Header centrado */}
<TableCell
  isHeader
  className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
>
  Acciones
</TableCell>

{/* Body con iconos centrados horizontalmente */}
<TableCell className="py-3.5 px-4 sm:px-6">
  <div className="flex items-center justify-center gap-3">
    {/* Botones de acción con espaciado de gap-3 */}
  </div>
</TableCell>
```

## Características Principales

### 1. Búsqueda con Debounce (500ms)

La búsqueda implementa un debounce de 500ms para evitar consultas excesivas mientras el usuario escribe.

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

// Debounce para el buscador (500ms)
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm]);
```

### 2. Filtrado Seguro con Campos Opcionales

El filtrado maneja correctamente campos que pueden ser `null` o `undefined`:

```typescript
const filteredData = useMemo(() => {
  let filtered = data;
  
  if (debouncedSearchTerm) {
    const searchLower = debouncedSearchTerm.toLowerCase();
    filtered = filtered.filter(item =>
      // Campos requeridos
      item.name?.toLowerCase().includes(searchLower) ||
      item.code?.toLowerCase().includes(searchLower) ||
      // Campos opcionales con verificación
      (item.manager?.name && item.manager.name.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  }
  
  return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
}, [data, debouncedSearchTerm]);
```

**Puntos clave:**
- Usar `?.` (optional chaining) para campos que pueden ser undefined
- Verificar existencia antes de llamar métodos (ej: `item.field && item.field.toLowerCase()`)
- Evitar `|| false` ya que no es necesario con el operador `||`

### 3. Paginación

Implementación de paginación con controles de elementos por página:

```typescript
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);

const totalPages = Math.ceil(filteredData.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
const currentData = filteredData.slice(startIndex, endIndex);

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
  }
};

const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setItemsPerPage(parseInt(e.target.value, 10));
  setCurrentPage(1); // Resetear a página 1
};

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchTerm(e.target.value);
  setCurrentPage(1); // Resetear a página 1 al buscar
};
```

### 4. Estados de Carga y Vacío

```tsx
{/* Loading State */}
{store.isLoading && (
  <TableSkeleton rows={5} columns={6} />
)}

{/* Empty State */}
{!store.isLoading && store.items.length === 0 && (
  <div className="text-center py-12 px-4">
    <svg className="mx-auto h-12 w-12 text-gray-400" /* ... */>
      {/* Icon */}
    </svg>
    <h3 className="mt-2 text-theme-sm font-medium text-gray-900 dark:text-white">
      No hay registros
    </h3>
    <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
      Comienza creando un nuevo registro.
    </p>
  </div>
)}
```

### 5. Acciones CRUD

```tsx
const handleEdit = (id: string) => {
  setEditingId(id);
  editModal.openModal();
};

const handleDelete = async (id: string, name: string) => {
  setDeletingId(id);
  setDeletingItemName(name);
  deleteModal.openModal();
};

const confirmDelete = async () => {
  if (!deletingId) return;
  
  try {
    await store.deleteItem(deletingId);
    deleteModal.closeModal();
    setDeletingId(null);
    setDeletingItemName('');
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
};
```

### 6. Componentes de Modal

```tsx
{/* Create/Edit Modal */}
<ItemFormModal
  isOpen={createModal.isOpen || editModal.isOpen}
  onClose={() => {
    createModal.closeModal();
    editModal.closeModal();
    setEditingId(null);
  }}
  itemId={editingId}
/>

{/* Delete Confirmation Modal */}
<DeleteConfirmationModal
  isOpen={deleteModal.isOpen}
  onClose={deleteModal.closeModal}
  onConfirm={confirmDelete}
  itemName={deletingItemName}
  isDeleting={store.isDeleting}
/>
```

## Estructura de Archivos

```
pages/
  ModuleName/
    ModuleList.tsx          # Tabla principal con lista
    
components/
  module/
    ModuleFormModal.tsx     # Modal de crear/editar
    
stores/
  views/
    ModuleStore.ts          # MobX store
    ModuleStore.contract.ts # Interfaces TypeScript
    
api/
  services/
    module.ts               # Servicios API
```

## Backend - Transformación de Datos

Para mantener consistencia, el backend debe transformar los datos poblados:

```typescript
export const getItems = async (req, res, next) => {
  try {
    const items = await Model.find()
      .populate('relatedField', 'name email photo')
      .sort('name');

    // Transformar para enviar campo poblado separado
    const itemsTransformed = items.map(item => {
      const itemObj = item.toObject();
      
      // Si el campo está poblado, crear campo separado
      if (itemObj.relatedField && typeof itemObj.relatedField === 'object' && itemObj.relatedField._id) {
        itemObj.related = {
          _id: itemObj.relatedField._id,
          name: itemObj.relatedField.name,
          email: itemObj.relatedField.email,
          photo: itemObj.relatedField.photo
        };
        // Convertir ID a string
        itemObj.relatedField = itemObj.relatedField._id.toString();
      }
      
      return itemObj;
    });

    res.status(200).json({
      success: true,
      data: itemsTransformed
    });
  } catch (error) {
    next(error);
  }
};
```

## Validaciones en Formularios

```typescript
const validate = (): boolean => {
  const newErrors: typeof errors = {};

  if (!formData.name.trim()) {
    newErrors.name = "El nombre es requerido";
  }

  if (!formData.code.trim()) {
    newErrors.code = "El código es requerido";
  }

  if (!formData.relatedId || !formData.relatedId.trim()) {
    newErrors.relatedId = "Debe seleccionar una opción";
  } else if (formData.relatedId.length !== 24) {
    newErrors.relatedId = "El ID no es válido (debe ser ObjectId de 24 caracteres)";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## MobX Store Pattern

```typescript
import { makeAutoObservable, runInAction } from 'mobx';

class ModuleStore {
  items: Item[] = [];
  selectedItem: Item | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchItems() {
    this.isLoading = true;
    this.error = null;
    try {
      const data = await moduleService.getAll();
      runInAction(() => {
        this.items = data;
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
    }
  }

  async fetchItemById(id: string) {
    try {
      const data = await moduleService.getById(id);
      runInAction(() => {
        this.selectedItem = data;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
    }
  }

  async createItem(input: ItemInput) {
    try {
      const newItem = await moduleService.create(input);
      runInAction(() => {
        this.items.push(newItem);
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
      throw error;
    }
  }

  async updateItem(id: string, input: ItemInput) {
    try {
      const updated = await moduleService.update(id, input);
      runInAction(() => {
        const index = this.items.findIndex(item => item._id === id);
        if (index !== -1) {
          this.items[index] = updated;
        }
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
      throw error;
    }
  }

  async deleteItem(id: string) {
    try {
      await moduleService.delete(id);
      runInAction(() => {
        this.items = this.items.filter(item => item._id !== id);
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
      throw error;
    }
  }

  setSelectedItem(item: Item | null) {
    this.selectedItem = item;
  }

  clearError() {
    this.error = null;
  }
}

export const moduleStore = new ModuleStore();
```

## Checklist de Implementación

- [ ] Componente de lista con tabla responsive
- [ ] Búsqueda con debounce (500ms)
- [ ] Filtrado seguro de campos opcionales
- [ ] Paginación funcional
- [ ] Estados de carga (skeleton)
- [ ] Estado vacío con mensaje
- [ ] Modal de creación/edición
- [ ] Modal de confirmación de eliminación
- [ ] Modal de visualización (cuando aplique)
- [ ] Validación de formularios
- [ ] MobX store con acciones CRUD
- [ ] Servicios API con manejo de errores
- [ ] Backend con transformación de datos poblados
- [ ] Manejo correcto de ObjectIds (24 caracteres)
- [ ] Scroll vertical en modales (maxHeight: 70vh)
- [ ] Logs limpios en producción
- [ ] **Iconos estandarizados (PencilIcon, TrashBinIcon, EyeIcon)**
- [ ] **Columna "Acciones" centrada con `text-center`**
- [ ] **Botones con clases consistentes y colores apropiados**
- [ ] **Tamaño uniforme de iconos: `h-[18px] w-[18px]`**
  className="py-3 px-4 sm:px-6 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
>
  Acciones
</TableCell>

{/* En el body de la tabla */}
<TableCell className="py-3.5 px-4 sm:px-6 text-end">
  <div className="flex items-center justify-end gap-2">
    {/* Botones de acción */}
  </div>
</TableCell>
```

## Checklist de Implementación

- [ ] Componente de lista con tabla responsive
- [ ] Búsqueda con debounce (500ms)
- [ ] Filtrado seguro de campos opcionales
- [ ] Paginación funcional
- [ ] Estados de carga (skeleton)
- [ ] Estado vacío con mensaje
- [ ] Modal de creación/edición
- [ ] Modal de confirmación de eliminación
- [ ] Modal de visualización (cuando aplique)
- [ ] Validación de formularios
- [ ] MobX store con acciones CRUD
- [ ] Servicios API con manejo de errores
- [ ] Backend con transformación de datos poblados
- [ ] Manejo correcto de ObjectIds (24 caracteres)
- [ ] Scroll vertical en modales (maxHeight: 70vh)
- [ ] Logs limpios en producción
- [ ] Iconos estandarizados (PencilIcon, TrashBinIcon, EyeIcon)
- [ ] Columna "Acciones" centrada con `text-center`
- [ ] Botones con clases consistentes y colores apropiados

## Notas Adicionales

### Performance
- Usar `useMemo` para cálculos costosos (filtrado, ordenamiento)
- Usar `useCallback` para funciones que se pasan como props
- Implementar debounce en búsquedas

### Accesibilidad
- Labels descriptivos en formularios
- Estados de loading visibles
- Mensajes de error claros
- Botones con estados disabled apropiados

### Responsive
- Tablas con scroll horizontal en móvil
- Modales adaptables a diferentes tamaños
- Paginación visible en todas las resoluciones

### Backend
- Siempre validar ObjectIds antes de usar
- Usar populate selectivamente (solo campos necesarios)
- Transformar datos para separar campos poblados del ID
- Implementar soft delete donde sea apropiado
