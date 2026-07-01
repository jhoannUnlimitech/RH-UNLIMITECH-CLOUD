# Acceptance Criteria — Profile & Change Password

## A. Página de Perfil (`/profile`) — Datos del Usuario Logueado

| AC | Descripción |
|----|-------------|
| AC-PRF-01 | Navegar a `/profile` muestra la página con título "Mi Perfil" |
| AC-PRF-02 | Muestra nombre completo del usuario logueado |
| AC-PRF-03 | Muestra iniciales (o foto) como avatar |
| AC-PRF-04 | Muestra hat/rol del usuario (badge) |
| AC-PRF-05 | Muestra división del usuario |
| AC-PRF-06 | Muestra email del usuario |
| AC-PRF-07 | Muestra teléfono del usuario |
| AC-PRF-08 | Muestra cédula del usuario |
| AC-PRF-09 | Muestra nacionalidad del usuario |
| AC-PRF-10 | Muestra fecha de nacimiento del usuario |
| AC-PRF-11 | Muestra estado "Activo" |
| AC-PRF-12 | Botón "Editar" es visible |
| AC-PRF-13 | Botón "Cambiar Contraseña" es visible y navega a `/change-password` |

## B. Editar Perfil (Modal)

| AC | Descripción |
|----|-------------|
| AC-PRF-14 | Click en "Editar" abre modal con campos nombre y teléfono precargados |
| AC-PRF-15 | Puede modificar el nombre |
| AC-PRF-16 | Puede modificar el teléfono |
| AC-PRF-17 | Click "Guardar Cambios" actualiza los datos y cierra modal |
| AC-PRF-18 | Los cambios se reflejan inmediatamente en la página |
| AC-PRF-19 | Toast "Perfil actualizado exitosamente" aparece |
| AC-PRF-20 | Click "Cancelar" cierra modal sin guardar |

## C. Cambio de Contraseña (`/change-password`)

| AC | Descripción |
|----|-------------|
| AC-PWD-01 | Navegar a `/change-password` muestra formulario con 3 campos |
| AC-PWD-02 | Muestra: contraseña actual, nueva contraseña, confirmar contraseña |
| AC-PWD-03 | Indicador de fortaleza muestra débil/media/fuerte |
| AC-PWD-04 | Contraseña actual incorrecta → error "La contraseña actual es incorrecta" |
| AC-PWD-05 | Nueva contraseña < 6 chars → error |
| AC-PWD-06 | Nueva = actual → error "debe ser diferente" |
| AC-PWD-07 | Confirmar no coincide → error "Las contraseñas no coinciden" |
| AC-PWD-08 | Cambio exitoso → redirige a dashboard, toast de éxito |
| AC-PWD-09 | Puede hacer login con la nueva contraseña |

## D. Forzar Cambio de Contraseña (primer login)

| AC | Descripción |
|----|-------------|
| AC-PWD-10 | Login con `forcePasswordChange: true` redirige a `/change-password` |
| AC-PWD-11 | No permite navegar a otra página mientras `forcePasswordChange: true` |
| AC-PWD-12 | Después de cambiar contraseña, `forcePasswordChange` se desactiva |
| AC-PWD-13 | Puede navegar libremente después de cambiar contraseña |

## E. Anotaciones data-test-*

| AC | Descripción |
|----|-------------|
| AC-PRF-21 | `data-test-context="profile-page"` en contenedor principal |
| AC-PRF-22 | `data-test-context="profile-header"` en sección header |
| AC-PRF-23 | `data-test-context="profile-info"` en sección info |
| AC-PRF-24 | `data-test-context="change-password-page"` en página cambio contraseña |
| AC-PRF-25 | Todos los elementos con `data-test-key` según POM |

---

## Status

| Sección | ACs | Tests | Result |
|---------|-----|-------|--------|
| A. Datos del perfil | 13 | `profile.spec.ts` (16 tests) | ✅ Pass |
| B. Editar perfil | 7 | `profile.spec.ts` | ✅ Pass (open/cancel verified) |
| C. Cambio de contraseña (modal) | 9 | `profile.spec.ts` (modal opens) | ✅ Pass |
| D. Forzar cambio | 4 | Backend endpoint verified | ✅ Pass (API) |
| E. Anotaciones | 5 | All data-test-* verified | ✅ Pass |
| **Total** | **38** | **16 pass** | **✅ All Pass** |

---

## Datos del Usuario E2E para Validación

| Campo | Valor Esperado |
|-------|---------------|
| Nombre | E2E Test Developer |
| Email | greatly-hide@emxeecta.mailosaur.net |
| Hat/Rol | DEVELOPER |
| División | División 4 — Infraestructura |
| Teléfono | +573001234567 |
| Cédula | 9999888877 |
| Nacionalidad | Colombia |
| Fecha Nacimiento | 22 de agosto de 1995 |
| Estado | Activo |
