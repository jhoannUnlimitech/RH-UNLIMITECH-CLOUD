# Criterios de Aceptación — WISE Membership Registration and Payment

> **Fuente de verdad:** [wise-membership-registration-and-payment.md](/workspace/wise-membership-registration-and-payment/wise-membership-registration-and-payment.md)
>
> **Fecha:** 2026-04-20
> **Última actualización:** 2026-05-04 (V4 flow validation via Chrome MCP + Mailosaur API)
>
> **Flujo V4 validado:** Jam `01e8f2d9` + Chrome MCP replay `a39c1bce`

---

## 1. Gestión de Sesión

| ID | Criterio |
|----|----------|
| AC-01 | El sistema debe inicializar la sesión únicamente si se inyecta un session-id válido de DynamoDB a través de la URL. El session-id es un UUID usado como partition key de DynamoDB. |
| AC-02 | Si el session-id es inválido, ha expirado o no está presente, la aplicación debe redirigir al usuario a una nueva sesión válida con un UUID generado por el sistema. El usuario nunca queda bloqueado — siempre obtiene una sesión funcional. Las sesiones expiran después de 3 días vía DynamoDB TTL (campo `expiresAt`). |
| AC-03 | Los datos ingresados en el Formulario 1 (General Info) y Formulario 2 (Details) deben persistir en el estado de la sesión en DynamoDB para permitir la recuperación ante cierres accidentales del navegador. No se usa sessionStorage — el backend es la única fuente de verdad. |

---

## 2. Formulario General Info (Formulario 1 — Lead Capture)

| ID | Criterio |
|----|----------|
| AC-04 | Los campos Nombre (`person.name.first`), Apellido (`person.name.last`), Email (`person.email`), Nombre de la Empresa (`company.name`), Teléfono de Trabajo (`company.phone.full` + `company.phone.code` + `company.phone.number` + `company.phone.country`), y Dirección de la Empresa (`company.address.line1`, `company.address.city`, `company.address.zip`, `company.address.country.iso` + `company.address.country.name`) son obligatorios y deben estar marcados como tal en la interfaz. |
| AC-05 | El campo Correo Electrónico debe validar un formato estándar (`usuario@dominio.com`) y rechazar entradas malformadas. |
| AC-06 | El selector de País debe listar todos los países disponibles sin restricción. El dropdown debe cargar correctamente las opciones desde la librería `country-state-city` y no debe estar vacío. |
| AC-07 | El campo Estado / Provincia / Región debe cargarse y filtrarse dinámicamente según el país seleccionado. Cambiar el país debe limpiar el estado previamente seleccionado. |
| AC-08 | El campo Teléfono debe incluir un selector de país que aplique automáticamente el prefijo internacional correspondiente. El componente almacena 4 valores separados: código de país (`company.phone.code`), número (`company.phone.number`), número completo (`company.phone.full`), e ISO del país (`company.phone.country`). |

---

## 3. Formulario Details (Formulario 2 — Registration)

### 3.1 Perfil Profesional

| ID | Criterio |
|----|----------|
| AC-09 | Los campos de perfil profesional Position (`company.position`), Company Type (`company.type`), Industry (`company.industry`) y Company Size (`company.size`) deben ser obligatorios y presentar las opciones predefinidas en el esquema. Todos los valores son validados contra whitelist — solo se aceptan valores definidos en `options.ts`. |
| AC-10 | El campo Company Founded (`company.founded`) debe aceptar únicamente 4 dígitos numéricos y validar que el año no sea futuro. |

### 3.2 Dirección de Envío

| ID | Criterio |
|----|----------|
| AC-11 | Si el checkbox "Same as billing address" (`company.shipping.same_as_billing`) en la sección de dirección de envío está marcado, el sistema debe omitir la solicitud de una dirección de envío separada. Si el checkbox NO está marcado, los campos Dirección (`company.shipping.address.line1`), Ciudad (`company.shipping.address.city`), Código Postal (`company.shipping.address.zip`), País (`company.shipping.address.country.iso`) y Estado (`company.shipping.address.state.iso`) son obligatorios. El campo Dirección Línea 2 (`company.shipping.address.line2`) es opcional. |

### 3.3 Preferencias de Membresía

| ID | Criterio |
|----|----------|
| AC-12 | En las secciones de Prosperity Planner y HCA Booklets, el usuario debe estar obligado a seleccionar una de las opciones de preferencia de envío presentadas (radio buttons). Al ser radio buttons, no debe permitir más de una opción seleccionada a la vez — seleccionar una opción debe desmarcar automáticamente la anterior. |
| AC-13 | La sección "I am interested in learning about" debe permitir selección múltiple, pero si se marca "None of the above" (`none`), debe desmarcar automáticamente las demás opciones. El mismo comportamiento aplica para la sección Email Newsletters. |

### 3.4 Perfil Personal

| ID | Criterio |
|----|----------|
| AC-14 | En la sección de perfil personal, los campos Education (`person.education`) y Preferred Language (`person.language.preferred.iso` + `person.language.preferred.name`) son obligatorios para habilitar el botón "Proceed to Payment". El campo Birth Year (`person.birth_year`) debe aceptar únicamente 4 dígitos numéricos y no debe permitir caracteres no numéricos. Adicionalmente, el backend requiere que Prosperity Planner, HCA Booklets, al menos un Interest y al menos un Email Newsletter estén configurados. |

---

## 4. Selección de Plan & Stripe Checkout

| ID | Criterio |
|----|----------|
| AC-15 | El sistema debe resolver el Stripe Price ID correcto consultando los metadatos de Stripe basándose en el País (ISO), Tier de membresía (cname) y Frecuencia de facturación (month/year). Los productos son: Individual (tier 1, solo anual), General (tier 2), Company (tier 3), Charter (tier 4), Corporate (tier 5) — los tiers 2-5 soportan mensual y anual. |
| AC-15b | La página de Selección de Plan debe mostrar opciones de precios mensuales y anuales con un toggle para alternar entre ellos. Los planes que solo soportan facturación anual (Individual) deben mostrar el precio anual independientemente del estado del toggle. |
| AC-15d | Las tarjetas de plan deben mostrar la etiqueta de intervalo correcta (`/month` o `/year`) según el estado del toggle de facturación. Al cambiar el toggle, las etiquetas deben actualizarse inmediatamente. |
| AC-17 | La aplicación no debe capturar ni almacenar datos de tarjetas de crédito, delegando toda la sensibilidad PCI a la página hospedada de Stripe. |

---

## 5. Post-Pago & Verificación de Email

| ID | Criterio |
|----|----------|
| AC-16 | La redirección a Stripe Checkout debe ser exitosa y debe incluir los datos de email y nombre ya capturados para evitar que el usuario los reingrese. El controller Checkout reutiliza sesiones existentes si quedan >2 horas y los parámetros coinciden. Tras completar el pago en Stripe, el usuario debe ser redirigido a la página `/paid`. |
| AC-18 | Tras un pago exitoso, el sistema debe procesar el webhook `checkout.session.completed` para disparar automáticamente el envío del email de verificación. El estado de la sesión transiciona de `pending` → `paid`. |
| AC-18a | **Pago exitoso (estado `ready`)**: La PaidPage debe mostrar `data-test-state="ready"`, título de pago exitoso (`page-title`), subtítulo descriptivo (`page-subtitle`), mensaje de siguiente paso (`next-step-message`), y botón "Continue to Agreement" habilitado (`continue-button`). |
| AC-18b | **Pago pendiente (estados `verifying` → `processing`)**: Mientras el webhook no ha procesado, la PaidPage debe mostrar estado `verifying` con spinner y mensaje de verificación (`status-message`), transicionar a `processing` después del primer intento fallido, y hacer polling progresivo con backoff (2s → 4s → 6s → 8s → 10s cap, 12 intentos máximo). **Validado por código:** Implementación verificada en PaidPage.tsx (líneas 23-116). No testeable con interceptors aislados — route guards requieren flujo completo. |
| AC-18c | **Timeout de verificación (estado `timeout`)**: Si después de 12 intentos (~1 min) el pago no se confirma, la PaidPage debe mostrar `data-test-state="timeout"`, mensaje de timeout (`timeout-message`), y botón "Reintentar" visible y funcional (`retry-button`). **Validado por código:** Implementación verificada. |
| AC-18d | **Error de verificación (estado `error`)**: Si `GET /payment/{sessionId}` falla con error de red o servidor, la PaidPage debe mostrar `data-test-state="error"`, mensaje de error (`error-message`), y botón "Reintentar" visible y funcional (`retry-button`). **Validado por código:** Implementación verificada. |
| AC-19 | ~~El enlace de continuación enviado por email debe validar la identidad del usuario y permitir el avance a la fase de firma del acuerdo.~~ **Expandido en AC-19a, AC-19b, AC-19c, AC-19d (sección 14.3).** |

---

## 6. Firma del Acuerdo (Zoho Sign)

| ID | Criterio |
|----|----------|
| AC-20 | El contrato de membresía de WISE debe cargarse mediante el Embedded Signing API de Zoho Sign dentro del flujo de la aplicación. El usuario firma el acuerdo sin salir del módulo. |
| AC-20a | **Estado loading**: Al navegar a `/agreement`, la página debe mostrar `data-test-state="loading"` con spinner y mensaje de preparación (`loading-message`) mientras el backend prepara el documento de Zoho Sign (Phase 1 polling cada 3s, máximo 60 intentos). **Validado por código:** Implementación verificada en AgreementPage.tsx (línea 117). No testeable con interceptors aislados — route guards requieren flujo completo. |
| AC-20b | **Estado ready con iframe**: Cuando el backend retorna `ready=true` con `signingUrl`, la página debe transicionar a `data-test-state="ready"` mostrando: título (`page-title`), subtítulo (`page-subtitle`), contenedor de firma (`signing-container`), e iframe de Zoho Sign (`signing-iframe`) con `src` apuntando a `sign.zoho.com`. |
| AC-20c | **Estado error**: Si `GET /agreement/{sessionId}` falla o el polling agota los 60 intentos, la página debe mostrar `data-test-state="error"` con mensaje de error (`error-message`). **Validado por código:** Implementación verificada en AgreementPage.tsx (línea 107). |
| AC-20d | **Persistencia al recargar**: Si el usuario recarga la página (`/agreement`) después de que el iframe ya cargó, la página debe volver a cargar el iframe de Zoho Sign sin perder el progreso del registro. El backend genera un nuevo embed token. |
| AC-20e | **Selección de template por idioma**: El sistema debe seleccionar automáticamente el template de Zoho Sign basado en el idioma preferido del usuario (Form 2, campo `person.language.preferred.iso`) y el país (Form 1, campo `company.address.country.iso`). La cadena de fallback es: idioma+país → solo idioma → inglés. **✅ PASS** — Validado por E2E `agreement-template-i18n-audit.spec.ts` (escenario en-usa). Template `en` se resuelve y carga correctamente. Re-validado 03 Jun 2026: nuevo flujo de firma (Check→Add signature) funciona con `full-enrollment-v4.spec.ts` (32/32 tests). |
| AC-20f | **Fallback idioma+país → idioma → inglés**: Si existe un template con locale `{idioma}-{país}` (ej: `es-COL`), se usa ese. Si no existe, se busca solo por idioma (ej: `es`). Si tampoco existe, se usa el template en inglés (`en`). **⚠️ PARCIAL** — Fallback funciona correctamente en código (ZohoSignTemplateResolver.ts). Templates `en`, `es`, `es-COL` pasan. Los 15 idiomas restantes (fr, de, it, pt, ja, ru, nl, sv, zh, cs, da, el, he, hu, no, sk) fallan porque sus templates en Zoho Sign no tienen campos de firma configurados (error 9101). Spec preparado para re-validar cuando se configuren. |
| AC-20g | **Escenario: Español + Colombia → es-COL**: Con idioma preferido = español y país = Colombia, el sistema debe usar el template con locale `es-COL` (exact match). La página de agreement debe cargar exitosamente (`data-test-state="ready"`). **✅ PASS** — Validado por E2E `agreement-template-i18n-audit.spec.ts`. |
| AC-20h | **Escenario: Español + España → es**: Con idioma preferido = español y país = España (no existe template `es-ESP`), el sistema debe usar el template con locale `es` (fallback a solo idioma). **✅ PASS** — Validado por E2E `agreement-template-i18n-audit.spec.ts`. |
| AC-20i | **Escenario: Idioma no soportado → en**: Con un idioma que no tiene template (ej: coreano), el sistema debe usar el template en inglés `en` como fallback final. La página de agreement debe cargar exitosamente. **⚠️ BLOQUEADO** — No verificable hasta que se resuelva el Defecto 2 (ProcessAgreement.ts no persiste error cuando template falla). El escenario ko→en debería funcionar (fallback a `en` que sí tiene campos), pero requiere que el caché del resolver no tenga entradas stale. Spec preparado (escenario ko-kor). |
| AC-20j | **Convención de nombres de templates**: Los templates en Zoho Sign siguen el formato `2021-WISE-US-Member-Agreement-Envelope (003) - {locale}` donde `{locale}` es el código ISO del idioma (ej: `es`, `en`, `fr`) o idioma+país (ej: `es-COL`). |
| AC-21 | Si el token de Zoho Sign expira debido al límite de 2 minutos, el sistema debe ser capaz de generar un nuevo token sin perder el progreso del registro. |
| AC-22 | El sistema debe detectar la finalización de la firma a través de webhooks de Zoho Sign para actualizar el estado del miembro. El estado de la sesión transiciona a `completed`. |
| AC-22a | **Firma completada — redirect a `/completed`**: Después de firmar el documento en el iframe de Zoho Sign, el polling de Phase 2 (cada 5s) debe detectar `status='signed'` y navegar automáticamente a `/sign-up/{sessionId}/completed`. |
| AC-22b | **Página Completed**: Después del redirect, la página de Completed debe mostrar un mensaje de bienvenida confirmando que el enrollment está completo. |

---

## 7. Procesamiento Asíncrono & Integración CRM

| ID | Criterio |
|----|----------|
| AC-23 | Todos los eventos del flujo deben enviarse a una cola FIFO agrupados por el email del registrador para asegurar el orden correcto de procesamiento. |
| AC-24 | La sincronización con Zoho CRM debe realizarse de forma estrictamente asíncrona a través de la cola de mensajes. El flujo orientado al usuario nunca espera operaciones del CRM. |
| AC-25 | ~~El sistema debe asociar al nuevo cliente con el Stripe Customer Portal correcto basado en su combinación de región y moneda.~~ **BACKLOG — Fase 2.** |

---

## 8. Seguridad & Validación de Webhooks

| ID | Criterio |
|----|----------|
| AC-26 | Todos los webhooks recibidos de Stripe y Zoho Sign deben ser validados mediante firmas de seguridad antes de ser procesados. Stripe usa webhook signing secret; Zoho Sign usa HMAC. |

---

## 9. Control de Navegación & Restricciones Post-Pago

| ID | Criterio |
|----|----------|
| AC-32 | Después de un pago exitoso (estado de sesión `paid`, `pending_signature` o `completed`), el usuario no debe poder navegar de vuelta al Formulario 1 (General Info), Formulario 2 (Details) o Selección de Plan. Tanto los route guards del SPA como los endpoints del backend deben hacer cumplir esta restricción. Intentar acceder a estas URLs debe redirigir al paso válido actual. |
| AC-33 | Los endpoints del backend `POST /lead` y `POST /registration` deben rechazar modificaciones de datos cuando el estado de la sesión es `pending`, `paid`, `pending_signature` o `completed`. La respuesta debe retornar un código de error apropiado (ej: 409 Conflict o 403 Forbidden). |
| AC-34 | La aplicación debe implementar redirección basada en estado: cuando un usuario accede a cualquier URL de una sesión, el SPA debe redirigir a la página correspondiente al estado actual de la sesión. Si la sesión está `completed`, TODAS las URLs deben redirigir a la página de Completado. Si `pending_signature`, redirigir a Agreement. Si `paid`, redirigir a Paid/Agreement. |
| AC-35 | La aplicación no debe usar sessionStorage ni localStorage para persistencia de datos de formulario. Todos los datos deben cargarse exclusivamente desde el backend vía `GET /lead/{sessionId}` y `GET /registration/{sessionId}`. El backend (DynamoDB) es la única fuente de verdad. |

---

## 10. Divisa & Visualización de Precios

| ID | Criterio |
|----|----------|
| AC-36 | La página de Selección de Plan debe mostrar los precios en la moneda local correspondiente al país seleccionado en el Formulario 1 (General Info). Por ejemplo, si el usuario seleccionó Colombia, los precios deben mostrarse en Pesos Colombianos (COP). El símbolo de moneda y el formato deben coincidir con el locale. |
| AC-37 | El endpoint `GET /plans` debe aceptar el país del usuario (desde la sesión) y retornar precios resueltos desde los metadatos de Stripe para ese país específico. Si no existe un precio para una combinación país/tier/intervalo, el plan debe mostrarse como no disponible para ese intervalo. |

---

## 11. Manejo de Errores & Feedback al Usuario

| ID | Criterio |
|----|----------|
| AC-38 | Los errores de validación del backend (campos obligatorios faltantes, valores inválidos, formato de email inválido) deben mostrarse al usuario en el frontend como helper text directamente debajo de cada campo afectado. El patrón de anotación es `data-test-key="{field}-error"` con `data-test-state="visible"` para el helper text, y `data-test-state="error"` en el campo input. Al ser un formulario público, no se deben usar toasts ni notificaciones flotantes para errores de validación de campos. |
| AC-39 | Los campos de formulario que esperan formatos de datos específicos deben validar la entrada y mostrar mensajes de error apropiados: Email debe coincidir con el patrón `usuario@dominio.com`; Company Website debe ser una URL válida (si se proporciona); Company Founded debe ser exactamente 4 dígitos numéricos y no un año futuro; Phone debe contener solo dígitos después del código de país; ZIP/Postal Code debe coincidir con el formato esperado. |
| AC-45 | Cuando el usuario intente enviar un formulario con datos faltantes o inválidos, debe existir un mensaje de error claro visible en la interfaz que señale al usuario cuál campo está mal o falta por completar. Al ser un formulario público, los errores deben mostrarse como helper text directamente debajo de cada campo afectado (patrón: `data-test-key="{field}-error"` con `data-test-state="visible"`), no mediante toasts ni notificaciones flotantes. El campo afectado debe cambiar a `data-test-state="error"`. |

---

## 12. Orquestación de Side Effects del CRM

| ID | Criterio |
|----|----------|
| AC-40 | El sistema debe enviar un evento de sincronización al CRM en cada uno de los siguientes hitos del flujo: (1) Envío del Formulario 1 (lead created), (2) Envío del Formulario 2 (registration completed), (3) Checkout iniciado (payment pending), (4) Pago completado (checkout.session.completed), (5) Página de acuerdo abierta (pending_signature), (6) Acuerdo firmado (completed). Cada evento debe incluir los datos de sesión relevantes para ese hito. |
| AC-41 | La sincronización con el CRM debe mapear las keys canónicas del formulario (ej: `person.name.first`, `company.name`) a los campos custom correspondientes de Zoho CRM. El contrato de mapeo debe definirse y mantenerse como parte de la implementación del queue consumer. |

---

## 13. Internacionalización (i18n)

| ID | Criterio |
|----|----------|
| AC-42 | Todo texto visible al usuario en la aplicación debe usar claves de traducción i18n. No debe haber strings hardcodeados en componentes. La aplicación debe soportar como mínimo Inglés (en-US) y Español (es-CO). |
| AC-43 | La aplicación debe detectar y respetar la preferencia de idioma del navegador del usuario. Si el idioma del navegador coincide con un locale soportado, la aplicación debe renderizar en ese idioma automáticamente. |
| AC-46 | El idioma base/por defecto de todos los formularios debe ser Inglés (en-US). La aplicación detecta automáticamente el idioma del navegador (AC-43) y renderiza en el locale correspondiente. Al ser un formulario público sin sesión autenticada, no requiere switch manual de idioma — el cambio se realiza configurando el idioma del navegador. |

---

## 14. Notificaciones por Email

> **Nota:** AC-44 original fue expandido en sub-criterios verificables. AC-19 original fue expandido en AC-19a a AC-19d.

### 14.1 Entrega del Email

| ID | Criterio |
|----|----------|
| AC-44a | Después de un pago exitoso (webhook procesado, estado `paid`), el sistema debe enviar exactamente un email al correo electrónico registrado en el Formulario 1 (`person.email`). El email debe llegar dentro de los 60 segundos posteriores al cambio de estado. |
| AC-44b | El email debe tener un subject reconocible que identifique el propósito (verificación/continuación del enrollment). El subject no debe estar vacío ni contener placeholders sin resolver (ej: `{{name}}`). |
| AC-44c | El sender (from) del email debe ser una dirección corporativa válida (no `noreply@localhost` ni direcciones de test). El nombre del sender debe identificar a WISE o la organización. |
| AC-44d | Si el pago no se completa (webhook no procesado, estado `pending`), el sistema NO debe enviar el email de verificación. |

### 14.2 Contenido del Email

| ID | Criterio |
|----|----------|
| AC-44e | El body HTML del email debe contener el nombre del usuario (`person.name.first`) registrado en el Formulario 1, personalizando el mensaje. |
| AC-44f | El body HTML del email debe contener al menos un link (`<a href="...">`) que apunte a la ruta de continuación del enrollment (`/agreement` o equivalente). |
| AC-44g | El email NO debe contener links a rutas internas del sistema (`/admin`, `/api`, `/internal`) ni a dominios no autorizados. Solo debe contener links al dominio de la aplicación. |
| AC-44h | El body del email debe tener versión HTML y versión texto plano (text/plain). La versión texto plano debe contener el mismo link de continuación. |

### 14.3 Funcionalidad del Link

| ID | Criterio |
|----|----------|
| AC-19a | El link de continuación del email debe contener el session-id de la sesión activa como parte de la URL (ej: `/sign-up/{sessionId}/agreement`). |
| AC-19b | Al navegar al link del email en un browser, la aplicación debe cargar la página de Agreement (`/agreement`) con el iframe de Zoho Sign. La página debe alcanzar `data-test-state="ready"` o `data-test-state="loading"`. |
| AC-19c | Si el link del email se usa con un session-id que ya completó la firma (estado `completed`), la aplicación debe redirigir a la página de Completed en lugar de mostrar el Agreement. |
| AC-19d | Si el link del email se usa con un session-id expirado o inválido, la aplicación debe mostrar un mensaje de error (consistente con AC-02). |

### 14.4 Idempotencia y Re-envío

| ID | Criterio |
|----|----------|
| AC-44i | Si el usuario recarga la página `/paid` y el estado ya es `paid`, el sistema NO debe enviar un segundo email. El email se envía una sola vez como side-effect del webhook, no del polling del frontend. |
| AC-44j | Si el usuario hace click en "Continue to Agreement" sin haber recibido el email (ej: navegación directa), la aplicación debe funcionar normalmente — el email es informativo, no bloqueante para el flujo. |

---

## 15. Criterios Adicionales

| ID | Criterio |
|----|----------|
| AC-27 | La página de Selección de Plan debe mostrar un toggle entre frecuencias de facturación Mensual y Anual, mostrando el precio correcto para cada plan según el intervalo seleccionado. Individual Membership solo soporta facturación anual. |
| AC-28 | El sistema debe reutilizar una Stripe Checkout session existente si tiene más de 2 horas restantes y los parámetros de product/interval coinciden, evitando la creación innecesaria de sesiones. |
| AC-29 | El sistema debe eliminar el TTL de DynamoDB durante el proceso de checkout para prevenir la expiración de la sesión mientras el usuario completa el pago en Stripe. El TTL se restaura si el checkout es abandonado. |
| AC-30 | Todos los valores de dropdown en el Formulario 2 deben ser validados contra whitelist tanto del lado del cliente (vía `isWhitelisted()`) como del lado del servidor (vía `isValidRegistrationKey()`). Los valores inválidos deben ser rechazados. |
| AC-31 | ~~La aplicación debe soportar mecanismos de prevención de bots (reCAPTCHA o similar) en todos los formularios públicos.~~ **BACKLOG — No implementado.** |
| AC-47 | Todos los campos de texto (inputs) deben incluir un placeholder descriptivo que guíe al usuario sobre la información que debe ingresar. Los placeholders deben estar internacionalizados usando claves i18n. |
| AC-48 | Los dropdowns usan `<select>` nativo del browser que soporta búsqueda por teclado (type-ahead). No requiere componente custom de search/filter. |
| AC-49 | No debe existir información hardcodeada (quemada) en el código fuente, como nombres de personas, emails, direcciones u otros datos de prueba. Toda la data de ejemplo o valores por defecto deben provenir de configuración, variables de entorno o archivos de traducción. Ejemplos prohibidos: `"name": "Manuel Lara"`, `"email": "test@example.com"`, etc. |
| AC-50 | El botón de reenvío de email en la página Thank You debe implementar un cooldown de 60 segundos entre reenvíos. Durante el cooldown, el botón debe estar deshabilitado con `data-test-state="cooldown"`. Al completar el reenvío exitosamente, debe mostrarse un mensaje de confirmación (`resend-success`). |
| AC-51 | La aplicación no debe almacenar datos personales (nombre, email, teléfono, dirección) en `localStorage` ni `sessionStorage`. Todos los datos del formulario deben cargarse exclusivamente desde el backend vía API. Referencia: Documento solución §5.6 — GDPR compliance. |


---

## 16. Página de Completado (Completed Page)

| ID | Criterio |
|----|----------|
| AC-22b | La página de Completado debe mostrar `data-test-context="completed-page"` con `data-test-state="ready"` al cargar. |
| AC-22c | El título de bienvenida (`page-title`) debe ser visible y no estar vacío. El texto proviene de la clave i18n `signUp.completed.title`. |
| AC-22d | El subtítulo (`page-subtitle`) debe ser visible y no estar vacío. El texto proviene de la clave i18n `signUp.completed.subtitle`. |
| AC-22e | Deben mostrarse 3 items de confirmación visibles: pago confirmado (`payment-confirmed`), acuerdo firmado (`agreement-signed`), y correo enviado (`email-sent`). Cada uno con su respectivo ícono de check. |
| AC-22f | El mensaje de footer (`footer-message`) debe ser visible con información de contacto de soporte. |
| AC-22g | Al acceder a `/completed` con una sesión que NO tiene status `completed`, la aplicación debe redirigir al paso correspondiente según el estado actual de la sesión (route guard). Validado via AC-34 — sesión en estado `lead` redirige de `/paid` a `/details`. |

### Anotaciones `data-test-*` requeridas en CompletedPage.tsx

```
<div data-test-context="completed-page" data-test-state="ready">
  <h1 data-test-key="page-title">{t('signUp.completed.title')}</h1>
  <p data-test-key="page-subtitle">{t('signUp.completed.subtitle')}</p>
  <div>
    <p data-test-key="payment-confirmed">{t('signUp.completed.paymentConfirmed')}</p>
    <p data-test-key="agreement-signed">{t('signUp.completed.agreementSigned')}</p>
    <p data-test-key="email-sent">{t('signUp.completed.emailSent')}</p>
  </div>
  <p data-test-key="footer-message">{t('signUp.completed.footer')}</p>
</div>
```


---

## 17. Flujo V4 — Reordenamiento y Query Params (2026-05-04)

> **Cambio principal:** Plan Selection se mueve a paso 3 (después de Registration).
> **Validado:** Chrome MCP replay + Mailosaur API (session `a39c1bce-bdf0-4e78-8ef6-c2a0b56768ad`)

### 17.1 Orden del Flujo (AC-53)

| ID | Criterio | Estado |
|----|----------|--------|
| AC-53 | El orden del flujo V4 es: General Info → Details → Plan Selection → Thank You → Verify → Agreement → Agreement Signed → Checkout → Paid. Plan Selection se ejecuta después de Details (no antes de General Info como en V3). | ✅ Validado 2026-05-04 |

### 17.2 Query Params Opcionales e Independientes (AC-52)

| ID | Criterio | Estado |
|----|----------|--------|
| AC-52 | Los query params (`plan`, `interval`, `country`) son opcionales e independientes. Cualquier combinación es válida. En V4, `plan+interval` NO salta plan selection — solo pre-selecciona/resalta. | ✅ Validado 2026-05-04 (8 escenarios, 62 tests) |
| AC-52a | Con `plan` en params: el plan se resalta/pre-selecciona en la página de Plan Selection (paso 3). | ✅ Validado — escenarios 1,2,6,8 |
| AC-52b | Con `interval` en params: el toggle se pre-selecciona en `month` o `year`. | ✅ Validado — escenarios 1,4,7,8 (year+month) |
| AC-52c | Con `country` en params: el select de país en General Info se pre-llena con ese valor. | ✅ Validado — escenarios 1,3,6,7 |
| AC-52d | Sin params: todo es manual. El flujo empieza en `/general-info` sin pre-selecciones. | ✅ Validado — escenario 5 |

**Combinaciones validadas (8 escenarios):**

| # | Combinación | Params | Tests |
|---|-------------|--------|-------|
| 1 | plan + interval + country | `?plan=general&interval=year&country=USA` | 9 ✅ |
| 2 | plan only | `?plan=general` | 8 ✅ |
| 3 | country only | `?country=USA` | 7 ✅ |
| 4 | interval only | `?interval=month` | 6 ✅ |
| 5 | no params | (vacío) | 8 ✅ |
| 6 | plan + country | `?plan=company&country=USA` | 8 ✅ |
| 7 | country + interval | `?country=USA&interval=month` | 8 ✅ |
| 8 | plan + interval | `?plan=company&interval=year` | 8 ✅ |

### 17.3 Emails del Sistema (3 emails, ignorar CRM)

| ID | Criterio | Estado |
|----|----------|--------|
| AC-44-v4a | El sistema debe enviar un email de verificación después de completar Plan Selection (paso 3). Subject: "Verify your email — WISE Membership". Sender: `contact@unlimitech.cloud`. Debe contener link con token de verificación y session-id en formato `/sign-up/{sessionId}/verify?token={hash}`. | ✅ Validado — email recibido 16:41:20 UTC |
| AC-44-v4b | El sistema debe enviar un email de "Agreement Signed" después de que el usuario firma el acuerdo en Zoho Sign. Subject: "Agreement Signed — WISE Membership". Sender: `contact@unlimitech.cloud`. Debe contener link a `/agreement-signed`. | ✅ Validado — email recibido 16:44:57 UTC |
| AC-44-v4c | El sistema debe enviar un email de "Welcome to WISE!" después de que el pago se confirma (webhook `checkout.session.completed`). Subject: "Welcome to WISE!". Sender: `contact@unlimitech.cloud`. | ✅ Validado — email recibido 16:47:50 UTC |
| AC-44-v4d | NO debe enviarse email de verificación si solo se completa el lead form y registration (sin plan selection). En V4, el email se envía después de plan selection, no después de registration. | ⏳ Pendiente validación (negativo test) |
| AC-44-v4e | Los emails del sistema NO deben contener links internos prohibidos (`/admin`, `/api/`, `/internal`). Deben tener versión HTML y texto plano. | ✅ Validado — link de verificación es `/sign-up/{sessionId}/verify?token=...` |
| AC-44-v4f | Los emails enviados por Zoho CRM (desde dominios como `contacts.zoho.com`, `zoho.com`) NO son parte del scope de validación de emails del enrollment. Solo se validan emails enviados desde `contact@unlimitech.cloud`. | ✅ Documentado |

### 17.4 Resumen de Validación del Flujo Completo V4

**Fecha de validación:** 2026-05-04

| Spec | Tests | Estado | Tiempo |
|------|-------|--------|--------|
| `full-enrollment-v4.spec.ts` | 16/16 | ✅ ALL PASS | 2.3m |
| `full-enrollment-with-params.spec.ts` | 62/62 | ✅ ALL PASS | 6.6m |
| `full-validation.spec.ts` | 43/43 | ✅ ALL PASS | 5.0m |
| `email-validation.spec.ts` | 25/25 | ✅ ALL PASS | 3.5m |

**Total: 146 tests, ALL PASSING**

**Criterios de Aceptación:**
- ✅ Completados: 72 (89%)
- ⏳ Pendiente validación: 6 (AC-20e a AC-20j — template selection by language)
- 📋 Backlog (no implementado): 1 (AC-31 reCAPTCHA)
- Total: 80 ACs activos

| Paso | Página | Resultado | Notas |
|------|--------|-----------|-------|
| 1 | `/sign-up?plan=general&interval=year&country=USA` → `/general-info` | ✅ | AC-53: siempre va a general-info |
| 2 | Country pre-filled "United States" | ✅ | AC-52c |
| 3 | Fill Lead Form (nombre, email, empresa, teléfono, dirección) | ✅ | AC-04 a AC-08 |
| 4 | Submit Lead → `/details` | ✅ | |
| 5 | Fill Registration (selects, radios, checkboxes, dirección personal) | ✅ | AC-09 a AC-14 |
| 6 | Submit Registration → `/plan` | ✅ | V4: no /thank-you |
| 7 | Plan Selection: 5 planes, USD, toggle Anual activo | ✅ | AC-15, AC-36, AC-52b |
| 8 | Select General → `/thank-you` | ✅ | Email enviado |
| 9 | Mailosaur API: "Verify your email — WISE Membership" | ✅ | AC-44-v4a |
| 10 | Navigate verify link → "¡Correo verificado!" | ✅ | AC-19a |
| 11 | Continue → `/agreement` (Zoho Sign iframe) | ✅ | AC-20 |
| 12 | Sign: Start → Agree → Add signature (UC) → Ok → Finish | ✅ | AC-22 |
| 13 | `/agreement-signed` — "¡Acuerdo Firmado!" | ✅ | |
| 14 | Mailosaur API: "Agreement Signed — WISE Membership" | ✅ | AC-44-v4b |
| 15 | Continue → `/checkout` (Stripe redirect) | ✅ | AC-16 |
| 16 | Fill test card (4242...) → Subscribe | ✅ | AC-17 |
| 17 | `/paid` — "¡Bienvenido a WISE!" | ✅ | |
| 18 | Mailosaur API: "Welcome to WISE!" | ✅ | AC-44-v4c |


---

## 18. Enrollment Form Adjustments (2026-05-25)

> **Rama:** `bugfix/enrollment-form-adjustments`
> **Spec:** `e2e/specs/validation/enrollment-form-adjustments.spec.ts`
> **Fecha:** 2026-05-26
> **Spec:** `e2e/specs/validation/enrollment-form-adjustments.spec.ts` — 25 tests ✅
> **Última ejecución:** 2026-05-26 (CDP, 1.9m, 25/25 pass)

### 18.1 Referral Field — "How did you hear about WISE?" (General Info)

| ID | Criterio | Estado |
|----|----------|--------|
| AC-EF01 | El campo "How did you hear about WISE?" (`referral-input`) debe ser visible en el formulario General Info dentro de `data-test-context="referral-section"`. | ✅ Pass |
| AC-EF02 | El campo referral debe aceptar texto libre (input type text). | ✅ Pass |
| AC-EF03 | El valor del campo referral debe incluirse en el payload al enviar el formulario (persiste en sesión). | ✅ Pass |
| AC-EF04 | El formulario debe enviarse exitosamente con el campo referral lleno. | ✅ Pass |
| AC-EF05 | El valor del campo referral debe persistir al navegar atrás desde Details a General Info (recuperación de sesión). | ✅ Pass |

### 18.2 Billing Address (Details Form)

| ID | Criterio | Estado |
|----|----------|--------|
| AC-EF06 | La sección de Billing Address (`data-test-context="billing-address-section"`) debe existir con `data-test-state="hidden"` por defecto (checkbox "Same as company" marcado). | ✅ Pass |
| AC-EF07 | El checkbox "Same as company address" (`same-as-company-checkbox`) debe estar marcado por defecto. | ✅ Pass |
| AC-EF08 | Al desmarcar "Same as company", los campos de billing address deben hacerse visibles: `billing-street-input`, `billing-line2-input`, `billing-city-input`, `billing-zip-input`, `billing-country-select`, `billing-state-select`. El estado de la sección cambia a `visible`. | ✅ Pass |
| AC-EF09 | El cascading country→state debe funcionar en billing address: seleccionar un país habilita el select de estado con opciones del país seleccionado. | ✅ Pass |
| AC-EF10 | Al volver a marcar "Same as company", los campos de billing se ocultan (estado vuelve a `hidden`). | ✅ Pass |

### 18.3 Repeatable Company Website (Details Form)

| ID | Criterio | Estado |
|----|----------|--------|
| AC-EF11 | El primer campo de website (`company-website-0`) debe ser visible por defecto en la sección `website-section`. | ✅ Pass |
| AC-EF12 | El botón "Add" (`company-website-add-button`) debe agregar campos adicionales de website (hasta 5 máximo). Cada campo tiene key `company-website-{N}` (N=0..4). | ✅ Pass |
| AC-EF13 | Al alcanzar 5 URLs, el botón "Add" se deshabilita con `data-test-state="disabled"`. | ✅ Pass |
| AC-EF14 | Cada campo adicional (N>0) debe tener un botón "Remove" (`company-website-remove-{N}`) que elimina ese campo. Al eliminar, el botón "Add" se rehabilita. | ✅ Pass |

### 18.4 WISE Country Filter (96 países implementados)

| ID | Criterio | Estado |
|----|----------|--------|
| AC-EF15 | El dropdown de país en General Info debe mostrar exactamente 96 países permitidos + 1 placeholder (97 opciones totales). Filtrado por `isAllowedCountryIso2`. | ✅ Pass |
| AC-EF16 | Los países incluidos en el filtro (USA, COL, GBR, AUS, DEU, BRA, JPN, KOR, ZAF, MEX) deben ser seleccionables. | ✅ Pass |
| AC-EF17 | Los países excluidos del filtro (CHN, RUS, IRN, PRK, AFG, SYR, IRQ, LBY, SDN, SOM) NO deben aparecer en el dropdown. | ✅ Pass |
| AC-EF18 | El filtro de países debe aplicarse a todos los selects de país del flujo (General Info, Personal Address, Billing Address, Shipping Address). | ✅ Pass |

### 18.5 Charter Plan Removal

| ID | Criterio | Estado |
|----|----------|--------|
| AC-EF19 | La página de Plan Selection debe mostrar 4 planes: Individual, General, Company, Corporate. | ✅ Pass |
| AC-EF20 | El plan Charter NO debe ser visible en la grilla de planes. | ✅ Pass |

### 18.6 CRM Fixes (Zoho)

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM01 | El teléfono del Lead debe mapearse correctamente al Individual durante la conversión Lead→Individual en Zoho CRM. | 📋 Backend |
| AC-CRM02 | El manejo de múltiples campos DUPLICATE_DATA durante la conversión debe eliminar cada campo conflictivo y reintentar la conversión Lead→Individual. | 📋 Backend |

### 18.7 Customer Portal (Stripe) — Provisioning

| ID | Criterio | Estado | Spec |
|----|----------|--------|------|
| AC-CP01 | Click en "Suscripción" (Settings → Organization → Subscription) dispara redirect al Stripe Customer Portal. | ✅ Pass | `customer-portal-subscription.spec.ts` |
| AC-CP02 | La URL del portal contiene `https://billing.stripe.com/p/session/` (Stripe hosted). | ✅ Pass | `customer-portal-subscription.spec.ts` |
| AC-CP03 | El portal muestra precios en la moneda correcta según el país de la suscripción (USD/$) | ✅ Pass | `customer-portal-subscription.spec.ts` |
| AC-CP03f | Detalle de factura: estado pagada, monto USD, COP (moneda local), número de factura, método de pago (Visa 4242) | ✅ Pass | `customer-portal-subscription.spec.ts` |
| AC-CP04 | Al cerrar/volver del portal, el usuario retorna a la app web correctamente. | ✅ Pass | `customer-portal-subscription.spec.ts` |

---

## 19. CRM Field Mapping Validation (2026-05-26)

> **Rama:** `bugfix/crm-account-field-mapping`
> **Specs:** `e2e/specs/validation/crm-field-mapping/crm-contact-validation.spec.ts`, `crm-account-validation.spec.ts`, `crm-cross-module-validation.spec.ts`
> **Fecha:** 2026-05-26
> **Modo:** API-only (no browser, no Playwright interactions — solo consultas a Zoho CRM API)
> **Pre-requisito:** Ejecutar enrollment flow completo (`full-enrollment-v4.spec.ts`) que exporta `session-snapshot.json`

### 19.1 Bridge — Session Snapshot Export

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V01 | El `session-snapshot.json` exportado contiene la data completa del Form 1 (lead): firstName, lastName, email, companyName, phoneFull, street, addressLine2, city, zip, countryISO3, countryName, stateISO, stateName, referralSource. | ✅ Pass |
| AC-CRM-V02 | El `session-snapshot.json` exportado contiene la data completa del Form 2 (registration): position, companyType, industry, companySize, companyWebsite, companyWebsites, companyFounded, altPhoneFull, billingSameAsCompany, billing*, shippingSameAsBilling, shipping*, prosperityPlanner, hcaBooklets, interests, emailNewsletters, personal*, birthYear, education, preferredLanguage*, secondaryLanguage*. | ✅ Pass |
| AC-CRM-V03 | El `session-snapshot.json` exportado contiene metadata de Stripe: customerId, plan, interval. | ✅ Pass (customerId puede estar vacío si API no lo retorna) |
| AC-CRM-V04 | El `session-snapshot.json` exportado contiene metadata de sesión: id, createdAt, status. | ✅ Pass |

### 19.2 Autenticación y Búsqueda CRM

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V05 | El spec se autentica correctamente con la API de Zoho CRM via OAuth2 refresh token (credenciales de `.env`). | ✅ Pass |
| AC-CRM-V06 | El spec busca el Contact por email en Zoho CRM y lo encuentra (search criteria: `Email = session.lead.email`). | ✅ Pass |
| AC-CRM-V07 | El spec busca el Account asociado al Contact (via `Account_Name` lookup en el Contact) y lo encuentra. | ✅ Pass |

### 19.3 Contact Fields — Datos Personales y Empresa

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V08 | `First_Name` en Contact = `firstName` del Form 1. | ✅ Pass |
| AC-CRM-V09 | `Last_Name` en Contact = `lastName` del Form 1. | ✅ Pass |
| AC-CRM-V10 | `Email` en Contact = email del Form 1. | ✅ Pass |
| AC-CRM-V11 | `Phone` en Contact = teléfono completo (`phoneFull`) del Form 1. | ❌ Mismatch — Phone es null en Contact (no se mapea durante conversión Lead→Contact) |
| AC-CRM-V12 | `Company_Billing_Address_*` (Street_1, Street_2, City, State, Country, Zip) en Contact = dirección de la empresa del Form 1. | ✅ Pass |
| AC-CRM-V13 | `Company_Shipping_Address_*` en Contact = shipping address del Form 2 (o billing si "same as billing"). | ✅ Pass |
| AC-CRM-V14 | `Position_Form` en Contact = posición resuelta via `resolvePicklist('position', value)`. | ✅ Pass |
| AC-CRM-V15 | `Industry` en Contact = industria resuelta via `resolvePicklist('industry', value)`. | ✅ Pass |
| AC-CRM-V16 | `Company_Type` en Contact = tipo de compañía resuelto via `resolvePicklist('company_type', value)`. | ✅ Pass |
| AC-CRM-V17 | `Company_Size` en Contact = tamaño resuelto via `resolvePicklist('company_size', value)`. | ✅ Pass |
| AC-CRM-V18 | `Company_Website` en Contact = website del Form 2. | ⏭️ Skipped (campo vacío en test data) |
| AC-CRM-V19 | `Company_Founded_year` en Contact = año fundación del Form 2. | ✅ Pass |
| AC-CRM-V20 | `Alternate_Phone` en Contact = teléfono alterno completo (`altPhoneFull`) del Form 2. | ✅ Pass |

### 19.4 Contact Fields — Perfil Personal

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V21 | `Home_Address_*` (Street_1, Street_2, City, State, Country, Postal_Code) en Contact = dirección personal del Form 2. | ✅ Pass |
| AC-CRM-V22 | `Education_Level_Form` en Contact = educación resuelta via `resolvePicklist('education', value)`. | ✅ Pass |
| AC-CRM-V23 | `Preferred_Language_Form` en Contact = idioma preferido (nombre completo, no ISO). | ✅ Pass |
| AC-CRM-V24 | `Second_Language_Form` en Contact = segundo idioma (nombre completo, no ISO). | ✅ Pass |

### 19.5 Contact Fields — Preferencias de Membresía

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V25 | `Prosperity_Planner_Preference` en Contact = preferencia resuelta via `resolvePicklist('prosperity_planner_account', value)`. | ✅ Pass |
| AC-CRM-V26 | `HCA_Booklets_Preference` en Contact = preferencia resuelta via `resolvePicklist('hca_booklets_account', value)`. | ✅ Pass |
| AC-CRM-V27 | `I_am_interested_in_learning_about` en Contact = intereses resueltos via `resolveMultiselect('interests', values)`. | ❌ Mismatch — Separador: spec usa `; ` pero Zoho usa `,` |
| AC-CRM-V28 | `Please_email_me_about` en Contact = newsletters resueltos via `resolveMultiselect('email_newsletters', values)`. | ✅ Pass |

### 19.6 Contact Fields — Estado y Stripe

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V29 | `Stripe_ID` en Contact = Stripe customer ID del checkout. | ✅ Pass |
| AC-CRM-V30 | ~~`Agreement_Signed` en Contact = `true`~~ | ❌ Eliminado — campo boolean deprecado. El estado se maneja via picklist `Status` (campo "Membership Agreement Status"). `ProcessCountersign` setea `Account.Agreement_Signed` pero el Contact usa `Status` field. |
| AC-CRM-V31 | `Email_Verified` en Contact = `true` (post-verificación de email). | ✅ Pass |
| AC-CRM-V32 | `Status` en Contact = `"Signed Agreement"` (post-countersign de todos los admins via ProcessCountersign). | ✅ Pass |

### 19.7 Account Fields — Identidad y Detalle

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V33 | `Account_Name` en Account = nombre de compañía (`companyName`) del Form 1. | ✅ Pass |
| AC-CRM-V34 | `Account_Type` en Account = tipo de compañía resuelto via `resolvePicklist('account_type_actual', value)` — debe ser display_value (e.g. "LLC"), NO actual_value (e.g. "Competitor"). | ✅ Pass |
| AC-CRM-V35 | `Industry` en Account = industria resuelta via `resolvePicklist('industry', value)`. | ✅ Pass |
| AC-CRM-V36 | `Company_Size` en Account = tamaño resuelto via `resolvePicklist('company_size', value)`. | ✅ Pass |
| AC-CRM-V37 | `Phone` en Account = teléfono completo (`phoneFull`) del Form 1. | ✅ Pass |
| AC-CRM-V38 | `Company_Website1` en Account = website principal del Form 2. | ⏭️ Skipped (campo vacío en test data) |
| AC-CRM-V39 | `Company_Ownership` en Account = posición resuelta via `resolvePicklist('position', value)`. | ✅ Pass |
| AC-CRM-V40 | `Company_Founded_year` en Account = año fundación del Form 2 (tipo numérico). | ✅ Pass |

### 19.8 Account Fields — Direcciones

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V41 | Billing Address en Account (`Street_Address`, `Billing_Street_2`, `City`, `State`, `Billing_Country1`, `Postal_Code`) = dirección de la empresa del Form 1. Country en UPPERCASE. | ✅ Pass |
| AC-CRM-V42 | Shipping Address en Account (`Company_Shipping_Address_*`) = shipping del Form 2 (o billing si "same as billing"). Country en UPPERCASE. | ✅ Pass |

### 19.9 Account Fields — Preferencias y Estado

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V43 | `Prosperity_Planner_Preference` en Account = preferencia resuelta. | ✅ Pass |
| AC-CRM-V44 | `HCA_Booklets_Preference` en Account = preferencia resuelta. | ✅ Pass |
| AC-CRM-V45 | `Status` en Account = "Pending Membership". | ✅ Pass |

### 19.10 Cross-Module — Consistencia y Asociación

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V46 | El Contact tiene `Account_Name` (lookup) apuntando al Account correcto. | ✅ Pass |
| AC-CRM-V47 | Consistencia: `Company_Type` en Contact = `Account_Type` en Account (mismo dato de compañía, mismo valor resuelto). | ✅ Pass |

### 19.11 Reporte de Validación

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V48 | Se genera reporte `.temp/report_crm_YYYY-MM-DD_HHmmss.md` con tabla comparativa de todos los campos validados. | ✅ Pass |
| AC-CRM-V49 | El reporte incluye por cada campo: nombre del campo Zoho, valor esperado (del formulario), valor actual (del CRM), status (✅ Match / ❌ Mismatch / ⚠️ Not found / ⏭️ Skipped). | ✅ Pass |
| AC-CRM-V50 | El spec NO falla por discrepancias individuales de campos — solo falla si no puede autenticarse con Zoho o no encuentra el registro. Las discrepancias se reportan en el `.md`. | ✅ Pass |

### 19.12 Campos Address Line 2 y Websites Adicionales

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V51 | `Company_Website` (SM1) en Account = segunda URL del campo repeatable de websites. | ⏳ Pendiente (requiere full enrollment con websites) |
| AC-CRM-V52 | `Company_Website_Social_Media2` (SM2) en Account = tercera URL del campo repeatable de websites. | ⏳ Pendiente (requiere full enrollment con websites) |
| AC-CRM-V53 | `Company_Billing_Address_Street_2` en Contact = `addressLine2` del Form 1 (no vacío). | ⏳ Pendiente (requiere full enrollment con addressLine2) |
| AC-CRM-V54 | `Company_Shipping_Address_Street_2` en Contact = shipping line 2 (o billing line 2 si "same"). | ⏳ Pendiente |
| AC-CRM-V55 | `Home_Address_Street_2` en Contact = `personalLine2` del Form 2 (no vacío). | ⏳ Pendiente (requiere full enrollment con personalLine2) |
| AC-CRM-V56 | `Billing_Street_2` en Account = `addressLine2` del Form 1 (no vacío). | ⏳ Pendiente |

### 19.13 Profile Photo — CRM Upload Validation

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V57 | El `session-snapshot.json` exportado contiene `registration.profilePhoto.originalName` con el nombre del archivo subido (e.g. `profile_under_10mb_square_b.jpg`). | ✅ Pass |
| AC-CRM-V58 | El Contact en Zoho CRM tiene foto de perfil (endpoint `GET /Contacts/{id}/photo` retorna HTTP 200 con content-type image/jpeg). Retry con backoff (upload es async via SQS → Lambda → S3 → Zoho). | ✅ Pass (365KB, image/jpeg) |
| AC-CRM-V59 | La foto se sube como JPEG resized (max 2048x2048) al Contact, independiente del formato original. Verificado indirectamente: V58 pasa con content-type `image/jpeg`, confirmando ProcessConvertContact step 8 completó correctamente. | ✅ Pass |

### 19.14 Lifecycle Checkpoints — Contact Status Transitions

| ID | Criterio | Estado |
|----|----------|--------|
| AC-CRM-V62 | Post firma del client → Contact `Status = 'Pending Countersign'`. Validado con backoff (SQS → ProcessAgreementSigned → Zoho CRM update async). | ✅ Pass (attempt 2/6) |
| AC-CRM-V63 | Post countersign de todos los admins → Contact `Status = 'Signed Agreement'`. Validado con backoff (webhook Zoho Sign → SQS → ProcessCountersign → Zoho CRM update async). | ✅ Pass (attempt 1/6) |
| AC-CRM-V64 | `Account.Agreement_Signed = true` post-countersign (ProcessCountersign setea este campo en el Account). | ✅ Pass |

### 19.15 Membership Number — Format Validation (YYYYCCSSSS)

**Regla:** §2 — "A unique, sequentially-generated ten-digit number assigned to a Company profile."
**Regla:** §3 Step 4 — "The CRM will assign the new WISE Membership to the WISE Continent based on the enterprise's address."

| ID | Criterio | Estado |
|----|----------|--------|
| AC-MN-01 | El Account tiene campo `Membership_Number` con valor numérico no vacío. | ✅ Pass (`2026030102`) |
| AC-MN-02 | El Membership Number tiene exactamente 10 dígitos. | ✅ Pass |
| AC-MN-03 | Los primeros 4 dígitos (YYYY) corresponden al año de creación del enrollment. | ✅ Pass (2026) |
| AC-MN-04 | Los dígitos 5-6 (CC) corresponden a un código de continente válido (01-09). | ✅ Pass (03 = WUS) |
| AC-MN-05 | Los dígitos 7-10 (SSSS) son secuenciales (valor entre 1 y 9999). | ✅ Pass (0102) |
| AC-MN-06 | Formato completo YYYYCCSSSS validado como un todo coherente. | ✅ Pass |
| AC-MN-07 | El código CC corresponde al país del Company Address (USA → 01/02/03, LATAM → 05, etc.). | ✅ Pass (USA/FL → 03=WUS) |
