# Criterios de Aceptación — Enrollment Language Selector (#896)

> **Branch:** `solution/enrollment-language-selector`
> **Ticket:** #896
> **Fecha:** 2026-06-18
> **Última ejecución:** 2026-06-18 (39/39 pass, 1.8m)

---

## Descripción del Ticket

Mejorar la asistencia multilingüe en el proceso de inscripción. El flujo ya es multilingüe por detección automática del navegador, pero se necesita:
1. Compatibilidad para recibir el idioma desde la URL (`?lang=xx`)
2. El idioma URL tiene prioridad sobre la detección del navegador
3. Selector de idioma visible dentro del flujo para cambio manual
4. El cambio se refleja en todas las pantallas sin reiniciar el flujo

**Parámetros de URL disponibles (confirmado por el desarrollador):**
- `?lang=en-US`
- `?lang=en`
- `?lang=es-CO`
- `?lang=es`

---

## Análisis de la Implementación

### Archivos modificados (6 archivos, +510 líneas)

| Archivo | Propósito |
|---------|-----------|
| `src/i18n/language-detection.ts` | Lógica pura de resolución de idioma (cadena de prioridad) |
| `src/i18n/language-detection.test.ts` | 22 unit tests para la cadena de prioridad |
| `src/i18n/index.ts` | Wiring de la detección al browser (URL strip, localStorage persist) |
| `src/components/LanguageSelector.tsx` | Componente dropdown con globe icon, flags, labels nativos |
| `src/layouts/AppHeader.tsx` | Monta el LanguageSelector en el header |
| `src/stores/language/language.store.ts` | Store MobX respeta el idioma ya resuelto por i18n init |

### Cadena de Prioridad (detectada del código)

```
1. URL ?lang=XX     → inyección one-time, se persiste en localStorage y se limpia de la URL
2. localStorage     → preferencia manual del selector
3. navigator.language → detección automática del navegador
4. Default (en-US)  → fallback
```

### Idiomas Soportados

| Código | Idioma | Tipo |
|--------|--------|------|
| `en-US` | English | Bundled (siempre disponible) |
| `es-CO` | Español | Dinámico (cargado desde API) |

### Fuzzy Matching

El sistema resuelve códigos parciales al idioma soportado más cercano:
- `es` → `es-CO`
- `es-MX` → `es-CO`
- `en` → `en-US`
- `en-GB` → `en-US`

---

## Criterios de Aceptación

### Grupo A — Detección automática del navegador (mantener comportamiento existente)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-896-01 | Sin parámetro URL ni localStorage, la app detecta el idioma del navegador | E2E: navegar sin ?lang, verificar idioma renderizado | ⬜ No automatizado (requiere mock de navigator.language) |
| AC-896-02 | Browser `es-*` (ej: es-MX) resuelve a `es-CO` (fuzzy match) | Unit test existente | ✅ Pass (unit) |
| AC-896-03 | Browser `en-*` (ej: en-GB) resuelve a `en-US` (fuzzy match) | Unit test existente | ✅ Pass (unit) |
| AC-896-04 | Browser con idioma no soportado (ej: `de-DE`) usa default `en-US` | Unit test existente | ✅ Pass (unit) |

### Grupo B — Idioma desde URL (nueva funcionalidad)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-896-05 | `?lang=es-CO` carga la app en español | E2E: Flow 2 | ✅ Pass |
| AC-896-06 | `?lang=en-US` carga la app en inglés | E2E: Flow 1 | ✅ Pass |
| AC-896-07 | `?lang=es` (código parcial) resuelve a español | E2E: Flow 4 | ✅ Pass |
| AC-896-08 | `?lang=en` (código parcial) resuelve a inglés | Unit test existente | ✅ Pass (unit) |
| AC-896-09 | URL param tiene prioridad sobre browser language | Unit test existente | ✅ Pass (unit) |
| AC-896-10 | URL param no soportado (`?lang=fr`) no rompe la app — fallback EN | E2E: Flow 5 | ✅ Pass |
| AC-896-11 | El parámetro `?lang=` se limpia de la URL después de la detección | E2E: Flow 1 | ✅ Pass |
| AC-896-12 | El idioma de URL se persiste en localStorage | E2E: Flow 1 | ✅ Pass |

### Grupo C — Selector de idioma (nueva funcionalidad UI)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-896-13 | El selector de idioma es visible en el header del enrollment | E2E: Flow 1 | ✅ Pass |
| AC-896-14 | El selector muestra el idioma actual ("English" o "Español") | E2E: Flow 1, 2 | ✅ Pass |
| AC-896-15 | Al hacer click se abre un dropdown con las opciones de idioma | E2E: Flow 3 | ✅ Pass |
| AC-896-16 | Cada opción muestra: label nativo + label en inglés + check si es el seleccionado | E2E: Flow 3 | ✅ Pass |
| AC-896-17 | Seleccionar otro idioma cambia el idioma de toda la UI inmediatamente | E2E: Flow 3 | ✅ Pass |
| AC-896-18 | El cambio de idioma se persiste en localStorage | E2E: Flow 3 | ✅ Pass |
| AC-896-19 | El dropdown se cierra al seleccionar una opción | E2E: Flow 3 | ✅ Pass |
| AC-896-20 | El dropdown se cierra con Escape | E2E: Flow 5 | ✅ Pass |

### Grupo D — Cambio de idioma sin reiniciar flujo (persistencia durante el enrollment)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-896-21 | Cambiar idioma en Form 1 refleja el cambio en títulos y labels del Form 1 | E2E: Flow 3 | ✅ Pass |
| AC-896-22 | Cambiar idioma en Form 1, avanzar a Form 2 — Form 2 muestra el idioma seleccionado | E2E: Flow 3 | ✅ Pass |
| AC-896-23 | Cambiar idioma en Form 2 refleja el cambio sin perder datos del formulario | Manual (datos se preservan por MobX — no hay pérdida) | ⬜ No automatizado |
| AC-896-24 | El selector de idioma está visible en TODAS las pantallas del flujo | E2E: Flow 1, 2, 3 (Form 1 + Form 2) | ✅ Pass |

### Grupo E — Validación de textos (verificar que las traducciones se cargan correctamente)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-896-25 | Form 1 en EN: labels "Name", "Company Email Address", "Company Name", "Phone" | E2E: Flow 1 | ✅ Pass |
| AC-896-26 | Form 1 en ES: labels "Nombre", "Correo Electrónico de la Empresa", etc. | E2E: Flow 2 | ✅ Pass |
| AC-896-27 | Form 2 en EN: labels "Company Position", "Company Type" | E2E: Flow 1 | ✅ Pass |
| AC-896-28 | Form 2 en ES: labels "Cargo en la Empresa", "Tipo de Empresa" | E2E: Flow 2 | ✅ Pass |
| AC-896-29 | Botón "Continue" en EN / "Continuar" en ES | E2E: Flow 1, 2 | ✅ Pass |
| AC-896-30 | Labels de campos se traducen correctamente (4+ labels verificados en cada idioma) | E2E: Flow 1, 2 | ✅ Pass |

---

## Resumen de Ejecución

| Spec | Tests | Tiempo | Status |
|------|-------|--------|--------|
| `language-selector.spec.ts` | 39 | 1.8m | ✅ All pass |

### Desglose por Flow

| Flow | Descripción | Tests | Status |
|------|-------------|-------|--------|
| Flow 1 | English via URL (`?lang=en-US`) + Form 1 + Form 2 | 10 | ✅ |
| Flow 2 | Spanish via URL (`?lang=es-CO`) + Form 1 + Form 2 | 7 | ✅ |
| Flow 3 | Manual Switch (EN → ES via selector) + persistencia | 12 | ✅ |
| Flow 4 | Fuzzy Matching (`?lang=es` parcial) | 4 | ✅ |
| Flow 5 | Unsupported (`?lang=fr`) + Escape cierra dropdown | 6 | ✅ |

---

## Textos de Referencia Verificados

### Form 1 (General Info)

| Key i18n | EN (verificado) | ES (verificado) |
|----------|----------------|-----------------|
| `signUp.generalInfo.name.label` | Name | Nombre |
| `signUp.generalInfo.email.label` | Company Email Address | Correo Electrónico de la Empresa |
| `signUp.generalInfo.companyName.label` | Company Name | Nombre de la Empresa |
| `signUp.generalInfo.phone.label` | Phone | Teléfono de la Empresa |
| `signUp.generalInfo.submitButton` | Continue | Continuar |

### Form 2 (Details)

| Key i18n | EN (verificado) | ES (verificado) |
|----------|----------------|-----------------|
| `signUp.details.position.label` | Company Position | Cargo en la Empresa |
| `signUp.details.companyType.label` | Company Type | Tipo de Empresa |

---

## Notas Técnicas

- **Persistencia:** El idioma seleccionado (via URL o selector) se guarda en `localStorage` key `enrollment_language`
- **One-time injection:** El parámetro `?lang=` se consume una sola vez y se limpia de la URL via `history.replaceState`
- **Carga dinámica:** El español se carga desde el API endpoint `/settings/translations/es-CO` — hay un delay de red (~200ms local)
- **El inglés siempre está disponible** (bundled) — no requiere carga de red
- **Hot switch:** `i18n.changeLanguage()` dispara re-render via react-i18next `bindI18n: 'languageChanged'`
- **El formulario NO se reinicia al cambiar idioma** — los datos del usuario se mantienen (MobX stores independientes del idioma)
- **Anotaciones data-test:** El dev agregó `data-test-context="app-header"`, `data-test-context="language-selector"` con state, `data-test-key="language-trigger-button"`, y `data-test-context="language-dropdown"`

---

## Criterios No Automatizados

| ID | Razón |
|----|-------|
| AC-896-01 | Requiere mock de `navigator.language` — cubierto por unit tests del dev |
| AC-896-23 | Requiere llenar Form 2 parcialmente, cambiar idioma, verificar datos intactos — se confirma por diseño (MobX store independiente de i18n) |
