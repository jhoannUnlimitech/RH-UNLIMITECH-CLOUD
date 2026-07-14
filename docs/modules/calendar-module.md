# Módulo de Calendario — RH Unlimitech Cloud

## Implementación

### Librería de festivos: `date-holidays`
- Offline (sin API externa)
- Países configurados: Colombia (CO) y Estados Unidos (US)
- Solo carga festivos de tipo `public` (oficiales)
- Los festivos se muestran con bandera del país (🇨🇴 / 🇺🇸)

### Componente: FullCalendar
- Plugin: dayGrid, timeGrid, interaction
- Vistas: Mes, Semana, Día
- Locale: español
- Colores por tipo: Azul (primary), Verde (success), Naranja (warning), Rojo (danger)

### Permisos
- **Todos** pueden ver el calendario y los festivos
- **Solo HR/CEO/Founder** (`employees:update`) pueden crear/editar/eliminar eventos
- El botón "+ Evento" y la funcionalidad de seleccionar fechas solo aparecen con permiso

### Festivos con banderas
- Colombia: 🇨🇴 + color naranja
- Estados Unidos: 🇺🇸 + color azul
- No se pueden editar ni eliminar (son de solo lectura)

### Ruta
- `/calendar` — visible para todos (sin PermissionRoute)
- Item "Calendario" en sidebar con icono de calendario

---

## Pendiente (siguiente sesión)

### Modelo CalendarEvent (backend)
```typescript
interface ICalendarEvent {
  _id: ObjectId;
  title: string;
  startDate: Date;
  endDate: Date;
  color: 'primary' | 'success' | 'warning' | 'danger';
  allDay: boolean;
  createdBy: ObjectId;  // Empleado que creó el evento
  type: 'meeting' | 'holiday' | 'reminder' | 'other';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Endpoints
| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | /api/v1/calendar/events | Auth | Todos los eventos |
| POST | /api/v1/calendar/events | employees:update | Crear evento |
| PUT | /api/v1/calendar/events/:id | employees:update | Actualizar |
| DELETE | /api/v1/calendar/events/:id | employees:update | Eliminar |
| GET | /api/v1/calendar/holidays | Auth | Festivos (generados por date-holidays) |

### Página de lista de eventos
- Tabla con filtros: tipo, rango de fechas, color
- Botón crear (condicionado por permiso)
- Acciones: ver, editar, eliminar

---

**Última actualización:** Junio 24, 2026
