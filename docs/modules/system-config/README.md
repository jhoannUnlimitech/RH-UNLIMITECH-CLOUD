# Módulo: Configuración del Sistema

## Descripción

Módulo singleton que centraliza la configuración global del sistema. Todos los módulos que necesiten parámetros configurables (timezone, días de estudio, mínimos de horas, etc.) los leen desde aquí en vez de hardcodearlos.

## Arquitectura

```
Backend
├── models/SystemConfig.ts          → Modelo singleton (una sola instancia en BD)
├── services/systemConfig.service.ts → Servicio con cache en memoria + helpers
├── controllers/systemConfig.controller.ts → REST API
├── routes/systemConfig.routes.ts    → Rutas: GET /config, PUT /config/{section}
└── scripts/seed-system-config.ts    → Seed inicial con defaults + festivos CO 2026

Frontend
├── pages/Settings/SystemSettings.tsx → Página admin /settings con 4 tabs
└── (Sidebar: item "Configuración")
```

## Modelo de Datos

```typescript
interface ISystemConfig {
  general: {
    companyName: string;     // "Unlimitech Cloud"
    timezone: string;        // "America/Bogota" (IANA)
    locale: string;          // "es-CO"
    dateFormat: string;      // "DD/MM/YYYY"
  };
  schedule: {
    workDays: number[];      // [1,2,3,4,5] = Lun-Vie
    workHoursStart: string;  // "08:00"
    workHoursEnd: string;    // "18:00"
    studyDays: number[];     // [1,3,5] = Lun/Mié/Vie
  };
  training: {
    minWeeklyHours: number;            // 3
    examPassingScore: number;          // 80 (%)
    maxExamAttempts: number;           // 3
    studyReportMaxHoursPerDay: number; // 12
  };
  notifications: {
    retentionDays: number;          // 90
    emailEnabled: boolean;          // false
    summaryFrequency: string;       // 'none' | 'daily' | 'weekly'
  };
}
```

## API Endpoints

| Método | Ruta | Permiso | Descripción |
|--------|------|---------|-------------|
| GET | `/api/v1/config` | Cualquier autenticado | Obtener toda la configuración |
| PUT | `/api/v1/config/general` | training:manage | Actualizar sección general |
| PUT | `/api/v1/config/schedule` | training:manage | Actualizar horario y días |
| PUT | `/api/v1/config/training` | training:manage | Actualizar parámetros de training |
| PUT | `/api/v1/config/notifications` | training:manage | Actualizar notificaciones |

## Permisos

- **Lectura**: Cualquier usuario autenticado (todos necesitan timezone, locale, etc.)
- **Escritura**: Solo usuarios con `training:manage` (CEO, Talent)

## Festivos

Los festivos **NO se gestionan desde este módulo**. Se registran como eventos de tipo `holiday` en el módulo de Calendario (`CalendarEvent.type = 'holiday'`).

El servicio de configuración expone `isHoliday(date)` que consulta `CalendarEvent` directamente:

```typescript
// Verifica si una fecha es festivo consultando CalendarEvent
const esFestivo = await systemConfigService.isHoliday(new Date('2026-07-20'));
```

### Cómo agregar un festivo

Ir a **Calendario** → crear evento con tipo "Festivo (holiday)". Automáticamente el pase de lista lo excluirá.

## Cache

El servicio mantiene un cache en memoria del documento singleton. Se invalida al modificar cualquier sección. Esto evita queries repetitivas a MongoDB ya que la configuración cambia raramente.

```typescript
// El primer call hace query a MongoDB
const config = await systemConfigService.getConfig(); // → DB query

// Los siguientes leen del cache
const config2 = await systemConfigService.getConfig(); // → memoria

// Al actualizar, se invalida automáticamente
await systemConfigService.updateSchedule(userId, data); // → invalida cache
```

## Helpers disponibles

| Helper | Retorna | Uso |
|--------|---------|-----|
| `getConfig()` | ISystemConfig | Toda la configuración (con cache) |
| `getStudyDays()` | number[] | [1,3,5] — días obligatorios de estudio |
| `getTimezone()` | string | "America/Bogota" |
| `isHoliday(date)` | boolean | Consulta CalendarEvent type=holiday |
| `invalidateCache()` | void | Forzar recarga desde BD |

## Integración con otros módulos

### Attendance (Pase de Lista)
- Lee `studyDays` para saber qué días mostrar en la tabla
- Valida con `isHoliday()` antes de permitir marcar asistencia
- Usa los días configurados en vez de hardcodear L/M/V

### Study Report
- Lee `training.studyReportMaxHoursPerDay` para validar máximo de horas/día
- Lee `training.minWeeklyHours` para el indicador de progreso semanal

### Exams
- Lee `training.examPassingScore` para determinar aprobación
- Lee `training.maxExamAttempts` para limitar intentos

## Seed

```bash
cd backend
npx ts-node src/scripts/seed-system-config.ts
```

Crea:
- El documento SystemConfig con los defaults de Unlimitech Cloud
- 18 festivos de Colombia 2026 como CalendarEvent type='holiday'

## Frontend — Página /settings

4 tabs para editar la configuración:

| Tab | Campos |
|-----|--------|
| **General** | Nombre empresa, Timezone (dropdown IANA), Locale, Formato fecha |
| **Horario** | Días laborales (toggle), Hora inicio/fin, Días obligatorios de estudio (toggle) |
| **Training** | Min horas/semana, % aprobación, Max intentos, Max horas/día |
| **Notificaciones** | Retención (días), Email habilitado, Frecuencia resumen |

Solo visible para usuarios con `training:manage` en el sidebar.

## Decisiones de diseño

1. **Singleton** — Solo hay una configuración global, no por tenant/división
2. **Cache en memoria** — La configuración cambia raramente, no tiene sentido hacer query cada vez
3. **Festivos desde Calendario** — Evita duplicidad; el calendario ya tiene el CRUD de eventos
4. **studyDays dinámicos** — Si mañana cambian a M/J/S, solo modifican en config y todo se adapta
5. **Permiso training:manage** — Los encargados de Training son quienes configuran estos parámetros
