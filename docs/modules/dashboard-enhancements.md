# Dashboard Enhancements — Análisis e Implementación

## Features a implementar

### 1. StatisticsChart (gráfica estilo TailAdmin)

**Componente base:** `StatisticsChart.tsx` de TailAdmin Ecommerce

**Adaptación para RH:**
- Título: "Estadísticas de Productividad"
- Tabs: Semanal / Mensual
- Datepicker de rango (flatpickr mode: "range") para filtrar fechas
- Gráfica tipo `line` con gradiente
- Series dinámicas según hat type (QA: ACs | Dev: Insertions)

**Componentes del template a copiar:**
- `StatisticsChart.tsx` → adaptado como `ProductivityStatistics.tsx`
- `ChartTab.tsx` → componente de tabs (Monthly/Quarterly/Annually)
- Flatpickr para datepicker de rango

---

### 2. DemographicCard (empleados por país)

**Componente base:** `DemographicCard.tsx` de TailAdmin Ecommerce

**Adaptación para RH:**
- Título: "Distribución Geográfica"
- Muestra cantidad de empleados por nacionalidad/país
- Útil para RRHH para ver la distribución del equipo
- Datos reales de la colección employees (campo `nationality`)
- Solo visible para hats con permiso `employees:read`

---

### 3. Calendario de Festivos

**Librería:** `date-holidays` (npm)
- Offline (no requiere API externa)
- Soporta 230+ países
- Permite configurar múltiples países simultáneamente
- Funciona en Node.js y browser

**Países iniciales:** Estados Unidos (US) y Colombia (CO)

**Implementación:**
- Modelo `AppSettings` en backend para guardar configuración global
- Campo `holidayCountries: string[]` (ej: `['US', 'CO']`)
- Frontend: componente calendario (FullCalendar ya está instalado)
- Los festivos se marcan en el calendario con color diferente
- Solo RRHH (hat con `employees:update`) puede configurar los países

**Flujo:**
```
RRHH configura países → se guardan en AppSettings
Calendario carga → lee países configurados → date-holidays genera festivos
Se muestran en FullCalendar con colores por país
```

---

### 4. Datepicker de rango para reportes

**Componente:** Flatpickr con `mode: "range"`
- Ya está instalado en el proyecto (dependencia de TailAdmin)
- Se integra en el componente `WeeklyProductivityChart`
- Permite seleccionar rango personalizado (por defecto: últimas 8 semanas)
- Al cambiar rango → recarga datos del API con query params

---

## Modelo AppSettings (configuración global)

```typescript
interface IAppSettings {
  _id: ObjectId;
  key: string;           // 'holiday_countries' | 'theme' | etc
  value: any;            // ['US', 'CO'] para festivos
  updatedBy: ObjectId;   // Quién lo modificó
  updatedAt: Date;
}
```

---

## Estructura de archivos

```
frontend/src/
├── components/dashboard/
│   ├── ProductivityStatistics.tsx  (NUEVO — StatisticsChart adaptado)
│   ├── DemographicCard.tsx         (NUEVO — empleados por país)
│   ├── HolidayCalendar.tsx         (NUEVO — calendario con festivos)
│   └── WeeklyProductivityChart.tsx  (ACTUALIZAR — agregar datepicker rango)
│
├── components/common/
│   └── ChartTab.tsx                (COPIAR de TailAdmin)

backend/src/
├── models/
│   └── AppSettings.ts              (NUEVO)
├── controllers/
│   └── settings.controller.ts      (NUEVO)
└── routes/
    └── settings.routes.ts          (NUEVO)
```

---

## Dependencias a instalar

```bash
# Frontend (ya instaladas)
# flatpickr — ya está
# @fullcalendar/* — ya está
# apexcharts + react-apexcharts — ya está

# Backend
npm install date-holidays
```

---

## Orden de implementación

| # | Tarea | Estimado |
|---|-------|----------|
| 1 | Copiar ChartTab + adaptar ProductivityStatistics con datepicker | 30 min |
| 2 | DemographicCard con datos reales de nationality | 20 min |
| 3 | Modelo AppSettings + endpoints | 15 min |
| 4 | Instalar date-holidays + endpoint /settings/holidays | 15 min |
| 5 | HolidayCalendar con FullCalendar | 30 min |
| 6 | Integrar todo en Dashboard + reordenar layout | 20 min |
| 7 | Configuración de países en sidebar o settings | 15 min |

**Total estimado: ~2.5 horas**

---

**Última actualización:** Junio 24, 2026
