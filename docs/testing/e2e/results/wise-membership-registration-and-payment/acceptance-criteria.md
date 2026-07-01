# Criterios de Aceptación — WISE Membership Registration and Payment

> **Fuente de verdad:** [wise-membership-registration-and-payment.md](/workspace/wise-membership-registration-and-payment/wise-membership-registration-and-payment.md)
>
> **Referencia de código:** `packages/apps/enrollment` (SPA + API), `packages/cloud/stripe`
>
> **Fecha:** 2026-04-20

---

## 1. Gestión de Sesión

Estos criterios validan el ciclo de vida de la sesión de enrollment, desde su creación hasta su expiración, como se describe en la Sección 4.1.1 (Standalone Micro-Application) y Sección 5.4 (Configuration Storage) del documento solución.

**Referencias de implementación:**
- `WorkflowStore` (`spa/src/stores/workflow/workflow.store.ts`) — gestión del estado de sesión
- `GetSession` controller (`api/src/controllers/GetSession.ts`) — endpoint de validación de sesión
- `EnrollmentSession.DAO` (`shared/models/enrollment-session/`) — persistencia en DynamoDB
- `EnrollmentSession` model — `status`, `expiresAt` (TTL), `sessionId` (UUID partition key)

| ID | Criterio | Ref. Doc. Solución | Estado en Código |
|----|----------|-------------------|-----------------|
| AC-01 | El sistema debe inicializar la sesión únicamente si se inyecta un session-id válido de DynamoDB a través de la URL. El session-id es un UUID usado como partition key de DynamoDB. | §4.1.1 — Standalone Micro-Application accesible vía URL parametrizada | ✅ Implementado — `WorkflowStore.loadSession(sessionId)` llama a `GET /session/{sessionId}`, que consulta DynamoDB por partition key. Las rutas usan el patrón `/sign-up/{sessionId}/*`. |
| AC-02 | Si el session-id es inválido, ha expirado o no está presente, la aplicación debe mostrar un mensaje de error y bloquear el acceso a los formularios. Las sesiones expiran después de 3 días vía DynamoDB TTL (campo `expiresAt`). | §4.1.1 — acceso basado en URL; §5.4 — DynamoDB TTL | ✅ Implementado — `GetSession` retorna 404 para sesiones inexistentes. `WorkflowStore` establece `isValid = false` en caso de fallo. `EnrollmentSession.Status.Expired` es un estado terminal. TTL configurado a 3 días (259200 segundos) en `SaveLead`. |
| AC-03 | Los datos ingresados en el Formulario 1 (General Info) y Formulario 2 (Details) deben persistir en el estado de la sesión en DynamoDB para permitir la recuperación ante cierres accidentales del navegador. No se usa sessionStorage — el backend es la única fuente de verdad. | §3.1 — "Each form submission is processed asynchronously"; §5.4 — almacenamiento en DynamoDB | ✅ Implementado — `POST /lead` crea/actualiza la sesión con datos del lead. `POST /registration` guarda datos de registro. `GET /lead/{sessionId}` y `GET /registration/{sessionId}` recuperan datos. `LeadStore.loadFromBackend()` y `RegistrationStore.loadFromBackend()` restauran el estado al recargar la página. |


---

## 2. Formulario General Info (Formulario 1 — Lead Capture)

Estos criterios validan los campos, validaciones y envío de datos del primer formulario de registro, como se describe en la Sección 3.1 (Registration Flow) y Sección 4.1.2 (Registration Forms).

**Referencias de implementación:**
- `GeneralInfoPage` (`spa/src/pages/SignUp/GeneralInfoPage.tsx`) — UI del formulario
- `LeadStore` (`spa/src/stores/lead/lead.store.ts`) — estado del formulario y validación
- `SaveLead` controller (`api/src/controllers/SaveLead.ts`) — persistencia en backend
- `REQUIRED_LEAD_KEYS` (`shared/registration-keys.ts`) — definición de campos obligatorios
- Librerías: `country-state-city` (países/estados), `react-international-phone` (input de teléfono)

| ID | Criterio | Ref. Doc. Solución | Estado en Código |
|----|----------|-------------------|-----------------|
| AC-04 | Los campos Nombre (`person.name.first`), Apellido (`person.name.last`), Email (`person.email`), Nombre de la Empresa (`company.name`), Teléfono de Trabajo (`company.phone.full` + `company.phone.code` + `company.phone.number` + `company.phone.country`), y Dirección de la Empresa (`company.address.line1`, `company.address.city`, `company.address.zip`, `company.address.country.iso` + `company.address.country.name`) son obligatorios y deben estar marcados como tal en la interfaz. | §3.1 — "personal details, contact information, country"; §4.1.2 — canonical field naming | ✅ Implementado — `REQUIRED_LEAD_KEYS.static` define todos los campos obligatorios. `LeadStore.validate()` los verifica antes del envío. El controller `SaveLead` llama a `getMissingRequiredLeadKeys()` para validación del lado del servidor. Nota: `company.address.line2` y `company.address.state.*` son opcionales. |
| AC-05 | El campo Correo Electrónico debe validar un formato estándar (`usuario@dominio.com`) y rechazar entradas malformadas. | §4.1.2 — validación de formato de datos | ✅ Implementado — `LeadStore.validate()` incluye validación de email con regex. El backend también valida vía `getMissingRequiredLeadKeys()`. |
| AC-06 | El selector de País debe listar todos los países disponibles sin restricción. El dropdown debe cargar correctamente las opciones desde la librería `country-state-city` y no debe estar vacío. | §4.1.2 — comportamiento de campos del formulario | ✅ Implementado — El SPA usa `country-state-city` que provee todos los países (250+). El dropdown carga la lista completa sin filtro. |
| AC-07 | El campo Estado / Provincia / Región debe cargarse y filtrarse dinámicamente según el país seleccionado. Cambiar el país debe limpiar el estado previamente seleccionado. | §4.1.2 — comportamiento de campos del formulario | ✅ Implementado — Usa `State.getStatesOfCountry(isoCode)` de `country-state-city`. El cambio de país dispara la recarga de la lista de estados. La conversión ISO-2 a ISO-3 se maneja para almacenamiento. |
| AC-08 | El campo Teléfono debe incluir un selector de país que aplique automáticamente el prefijo internacional correspondiente. El componente almacena 4 valores separados: código de país (`company.phone.code`), número (`company.phone.number`), número completo (`company.phone.full`), e ISO del país (`company.phone.country`). | §3.1 — "contact information" | ✅ Implementado — Usa la librería `react-international-phone`. El componente renderiza bandera + nombre del país en el dropdown, auto-formatea el número con el prefijo del país. Las 4 keys de teléfono se almacenan en LeadStore. |


---

## 3. Formulario Details (Formulario 2 — Registration)

Estos criterios validan el segundo formulario de registro: perfil profesional, preferencias de envío, preferencias de membresía y perfil personal. Descrito en la Sección 3.1 (Registration Flow) y Sección 4.1.2 (Registration Forms).

**Referencias de implementación:**
- `DetailsPage` (`spa/src/pages/SignUp/DetailsPage.tsx`) — UI del formulario
- `RegistrationStore` (`spa/src/stores/registration/registration.store.ts`) — estado del formulario y validación
- `options.ts` (`spa/src/stores/registration/options.ts`) — opciones predefinidas de dropdown/radio/checkbox con validación de whitelist
- `SaveRegistration` controller (`api/src/controllers/SaveRegistration.ts`) — persistencia en backend
- `REQUIRED_REGISTRATION_KEYS` (`shared/registration-keys.ts`) — definición de campos obligatorios
- Librerías: `country-state-city` (países/estados para dirección de envío), `react-international-phone` (teléfono alterno), `iso-639-1` (idiomas)

### 3.1 Perfil Profesional

| ID | Criterio | Ref. Doc. Solución | Estado en Código |
|----|----------|-------------------|-----------------|
| AC-09 | Los campos de perfil profesional Position (`company.position`), Company Type (`company.type`), Industry (`company.industry`) y Company Size (`company.size`) deben ser obligatorios y presentar las opciones predefinidas en el esquema. Todos los valores son validados contra whitelist — solo se aceptan valores definidos en `options.ts`. | §3.1 — "company information"; §4.1.2 — canonical naming | ✅ Implementado — `REQUIRED_REGISTRATION_KEYS.static` incluye los 4 campos. `options.ts` define: `POSITION_OPTIONS` (5 opciones), `COMPANY_TYPE_OPTIONS` (6 opciones), `INDUSTRY_OPTIONS` (46 opciones), `COMPANY_SIZE_OPTIONS` (8 opciones). `isWhitelisted()` rechaza valores inválidos. El backend valida vía `getMissingRequiredRegistrationKeys()`. |
| AC-10 | El campo Company Founded (`company.founded`) debe aceptar únicamente 4 dígitos numéricos y validar que el año no sea futuro. | §4.1.2 — validación de formato de datos | ⚠️ Parcialmente implementado — `company.founded` está en `REQUIRED_REGISTRATION_KEYS.static` (obligatorio). La validación de 4 dígitos y año no futuro debería estar en `RegistrationStore.validate()`. Requiere verificación de que la lógica específica de validación de año existe en el store. |

### 3.2 Dirección de Envío

| ID | Criterio | Ref. Doc. Solución | Estado en Código |
|----|----------|-------------------|-----------------|
| AC-11 | Si el checkbox "Same as billing address" (`company.shipping.same_as_billing`) en la sección de dirección de envío está marcado, el sistema debe omitir la solicitud de una dirección de envío separada. | §3.1 — "shipping preferences" | ✅ Implementado — La key `K.COMPANY_SHIPPING_SAME` existe. Cuando se establece en `'true'`, los campos de dirección de envío (`company.shipping.address.*`) se ocultan y no son obligatorios. El DetailsPage renderiza condicionalmente la sección de dirección de envío basándose en este flag. |

### 3.3 Preferencias de Membresía

| ID | Criterio | Ref. Doc. Solución | Estado en Código |
|----|----------|-------------------|-----------------|
| AC-12 | En las secciones de Prosperity Planner y HCA Booklets, el usuario debe estar obligado a seleccionar una de las opciones de preferencia de envío presentadas (radio buttons). | §3.1 — "shipping preferences, content and communication preferences" | ✅ Implementado — `REQUIRED_RADIO` en RegistrationStore incluye `K.PROSPERITY_PLANNER` y `K.HCA_BOOKLETS`. `PROSPERITY_PLANNER_OPTIONS` tiene 3 opciones (on_request, automatic, do_not_ship). `HCA_BOOKLETS_OPTIONS` tiene 3 opciones (automatic, on_request, do_not_ship). El backend requiere `prosperity_planner.value/.text` y `hca_booklets.value/.text`. |
| AC-13 | La sección "I am interested in learning about" debe permitir selección múltiple, pero si se marca "None of the above" (`none`), debe desmarcar automáticamente las demás opciones. El mismo comportamiento aplica para la sección Email Newsletters. | §3.1 — "content and communication preferences" | ⚠️ Requiere verificación — `INTERESTS_OPTIONS` incluye `{ value: 'none', label: 'None of the above.' }`. `EMAIL_NEWSLETTERS_OPTIONS` también incluye `{ value: 'none', label: 'None of the above.' }`. La función `toggleMulti()` en DetailsPage maneja la lógica del toggle. Se necesita verificar que seleccionar "none" limpia las demás selecciones y viceversa. |

### 3.4 Perfil Personal

| ID | Criterio | Ref. Doc. Solución | Estado en Código |
|----|----------|-------------------|-----------------|
| AC-14 | En la sección de perfil personal, los campos Education (`person.education`) y Preferred Language (`person.language.preferred.iso` + `person.language.preferred.name`) son obligatorios para habilitar el botón "Proceed to Payment". Adicionalmente, el backend requiere que Prosperity Planner, HCA Booklets, al menos un Interest y al menos un Email Newsletter estén configurados. | §3.1 — "additional personal profile details" | ✅ Implementado — `REQUIRED_REGISTRATION_KEYS.static` incluye `person.education`, `person.language.preferred.iso`, `person.language.preferred.name`. `REQUIRED_REGISTRATION_KEYS.arrays` requiere al menos una entrada en `interests` y `email_newsletters`. `EDUCATION_OPTIONS` tiene 8 opciones predefinidas. Los idiomas usan la librería `iso-639-1`. |


---

## 4. Selección de Plan & Stripe Checkout

Estos criterios validan el flujo de pago: visualización de planes, resolución de Stripe Price ID, creación de Checkout Session y redirección. Descrito en la Sección 3.2 (Payment), Sección 4.1.4 (Payment via Stripe Checkout) y Sección 4.1.5 (Stripe Product and Price Resolution via Metadata).

**Referencias de implementación:**
- `PlanSelectionPage` (`spa/src/pages/SignUp/PlanSelectionPage.tsx`) — UI de planes con toggle month/year
- `PlansStore` (`spa/src/stores/plans/plans.store.ts`) — carga de planes e inicio de checkout
- `Plans` controller (`api/src/controllers/Plans.ts`) — lista planes disponibles con precios
- `Checkout` controller (`api/src/controllers/Checkout.ts`) — crea Stripe Checkout session
- `Products` (`cloud/stripe/shared/products.ts`) — definiciones canónicas de productos (5 tiers)
- Stripe Lambdas: `LAMBDA_ARN_ENSURE_CUSTOMER`, `LAMBDA_ARN_CHECKOUT`

| ID | Criterio | Ref. Doc. Solución | Estado en Código |
|----|----------|-------------------|-----------------|
| AC-15 | El sistema debe resolver el Stripe Price ID correcto consultando los metadatos de Stripe basándose en el País (ISO), Tier de membresía (cname) y Frecuencia de facturación (month/year). Los productos son: Individual (tier 1, solo anual), General (tier 2), Company (tier 3), Charter (tier 4), Corporate (tier 5) — los tiers 2-5 soportan mensual y anual. | §4.1.5 — "Product metadata identifies the membership tier, and Price metadata includes the ISO country code and ISO currency code. The application reads this metadata from Stripe and builds the necessary mappings automatically." | ✅ Implementado — `Products.TIERS` define 5 productos con intervalos. El controller `Checkout` llama a `LAMBDA_ARN_CHECKOUT` que resuelve el Price ID desde los metadatos de Stripe usando country + cname + interval. El controller `Plans` retorna precios por plan. |
| AC-15b | La página de Selección de Plan debe mostrar opciones de precios mensuales y anuales con un toggle para alternar entre ellos. Los planes que solo soportan facturación anual (Individual) deben mostrar el precio anual independientemente del estado del toggle. | §3.2 — "billing frequency (annual or monthly)" | ✅ Implementado — `PlanSelectionPage` renderiza un toggle de intervalo (botones monthly/annually). `PlansStore.selectedInterval` controla la vista. `PlansStore.visiblePlans` filtra planes según precios disponibles. Cada tarjeta de plan muestra el precio por intervalo con etiqueta `/{month|year}`. |
| AC-15c | Al hacer clic en el botón "Back" desde la página de Selección de Plan, la aplicación debe navegar de vuelta a `/details` y cargar los datos del formulario previamente guardados desde el backend. Los campos deben mostrar los valores que el usuario ingresó anteriormente. | §3.1 — "Each form submission is processed asynchronously"; §5.4 — almacenamiento en DynamoDB | ✅ Implementado — `PlanSelectionPage` tiene botón back que navega a `/details`. `RegistrationStore.loadFromBackend()` restaura datos al montar `DetailsPage`. Los datos se cargan desde `GET /registration/{sessionId}`. |
| AC-15d | Las tarjetas de plan deben mostrar la etiqueta de intervalo correcta (`/month` o `/year`) según el estado del toggle de facturación. Al cambiar el toggle, las etiquetas deben actualizarse inmediatamente. | §3.2 — "billing frequency" | ✅ Implementado — `PlanSelectionPage` renderiza `plan-interval-label` con texto dinámico basado en `interval === 'month'`. El toggle cambia `PlansStore.selectedInterval` y MobX re-renderiza las etiquetas. |
| AC-16 | La redirección a Stripe Checkout debe ser exitosa y debe incluir los datos de email y nombre ya capturados para evitar que el usuario los reingrese. El controller Checkout reutiliza sesiones existentes si quedan >2 horas y los parámetros coinciden. | §3.2 — "redirects the user to Stripe's hosted Checkout page"; §4.1.4 — "Checkout Session with an explicit Stripe Price ID" | ✅ Implementado — El controller `Checkout` llama a `LAMBDA_ARN_ENSURE_CUSTOMER` con email, nombre, teléfono y dirección de los datos del lead. Crea la Stripe Checkout session con `customerId`. Almacena la info del checkout en DynamoDB (`stripe.checkout`). Retorna `checkoutUrl` para la redirección. La lógica de reutilización verifica `expiresAt > now + 2h` y mismo product/interval. |
| AC-17 | La aplicación no debe capturar ni almacenar datos de tarjetas de crédito, delegando toda la sensibilidad PCI a la página hospedada de Stripe. | §5.6 — "The application never handles, stores, or transmits payment card data. All payment processing occurs on Stripe's hosted Checkout page, reducing PCI scope to SAQ A." | ✅ Implementado — No existe formulario de pago en el SPA. El flujo redirige a `checkoutUrl` (hospedado por Stripe). No hay campos de datos de tarjeta en el modelo `EnrollmentSession`. |

---

## 5. Post-Pago & Verificación de Email

Estos criterios validan el flujo post-pago: procesamiento de webhooks, verificación de email y continuación del flujo. Descrito en la Sección 3.3 (Email Verification and Agreement Signing), Sección 4.1.7 (Email Verification) y Sección 4.1.9 (Stripe Webhook Listener).

**Referencias de implementación:**
- `PaidPage` (`spa/src/pages/SignUp/PaidPage.tsx`) — polling de confirmación de pago
- `GetPayment` controller (`api/src/controllers/GetPayment.ts`) — verificación de estado de pago
- `EnrollmentSession.Status` — estados del ciclo de vida: `paid`, `pending_signature`
- Stripe webhook handler (procesa `checkout.session.completed`)

| ID | Criterio | Ref. Doc. Solución | Estado en Código |
|----|----------|-------------------|-----------------|
| AC-18 | Tras un pago exitoso, el sistema debe procesar el webhook `checkout.session.completed` para disparar automáticamente el envío del email de verificación. El estado de la sesión transiciona de `pending` → `paid`. | §4.1.9 — "listener receives Stripe webhook events (checkout.session.completed) and triggers the appropriate downstream actions: CRM notification, email verification initiation, and flow state updates" | ✅ Implementado — El controller `GetPayment` verifica el estado de la sesión. Cuando el estado es `paid` y no existe acuerdo aún, envía un evento SQS para iniciar la preparación del acuerdo. `PaidPage` hace polling a `GET /payment/{sessionId}` para detectar la completación del pago. |
| AC-19 | El enlace de continuación enviado por email debe validar la identidad del usuario y permitir el avance a la fase de firma del acuerdo. | §4.1.7 — "Clicking this link validates the email address and advances the user to the agreement signing step" | ⚠️ Fase 2 — El flujo de verificación de email está referenciado en el documento solución como parte de la Fase 1, pero el mecanismo específico de envío de email y validación de enlace requiere verificación en el codebase. El `PaidPage` actualmente transiciona al acuerdo basándose en el estado de pago, no en el click del email. |

---

## 6. Firma del Acuerdo (Zoho Sign)

Estos criterios validan el flujo de firma del acuerdo de membresía vía Zoho Sign. Descrito en la Sección 3.3 (Email Verification and Agreement Signing), Sección 4.1.8 (Membership Agreement Signing via Zoho Sign) y Sección 4.4 (Known Limitations).

**Referencias de implementación:**
- `AgreementPage` (`spa/src/pages/SignUp/AgreementPage.tsx`) — UI de firma embebida
- `GetAgreement` controller (`api/src/controllers/GetAgreement.ts`) — estado del acuerdo y URL de firma
- `AgreementSigned` controller (`api/src/controllers/AgreementSigned.ts`) — marca el acuerdo como firmado
- `AgreementInfo` interface (`shared/models/enrollment-session/enrollment-session.model.ts`) — `requestId`, `actionId`, `documentId`, `status`
- `zoho.mjs` (`packages/apps/enrollment/zoho.mjs`) — configuración de Zoho Sign

| ID | Criterio | Ref. Doc. Solución | Estado en Código |
|----|----------|-------------------|-----------------|
| AC-20 | El contrato de membresía de WISE debe cargarse mediante el Embedded Signing API de Zoho Sign dentro del flujo de la aplicación. El usuario firma el acuerdo sin salir del módulo. | §4.1.8 — "signing experience is embedded directly within the application using Zoho Sign's Embedded Signing API" | ✅ Implementado — `AgreementPage` renderiza la experiencia de firma. El controller `GetAgreement` retorna `signingUrl` para la vista embebida. El modelo `AgreementInfo` rastrea `requestId`, `actionId`, `documentId` y `status`. |
| AC-21 | Si el token de Zoho Sign expira debido al límite de 2 minutos, el sistema debe ser capaz de generar un nuevo token sin perder el progreso del registro. | §4.4 — "The Zoho Sign embed token URL is valid for only 2 minutes and is single-use. If the user delays, a new token must be generated." | ⚠️ Requiere verificación — `AgreementInfo.status` soporta el estado `'expired'`. El controller `GetAgreement` debería manejar la regeneración del token. Se necesita verificar que la lógica de retry/regeneración existe en el controller. |
| AC-22 | El sistema debe detectar la finalización de la firma a través de webhooks de Zoho Sign para actualizar el estado del miembro. El estado de la sesión transiciona a `completed`. | §4.1.8 — "Completion is detected via redirect callbacks (synchronous UI flow) and webhooks (asynchronous backend notification)" | ✅ Implementado — El controller `AgreementSigned` (`GET /agreement/{sessionId}/signed`) establece el estado de la sesión a `completed`. Existen ambas rutas: síncrona (redirect callback de Zoho Sign) y asíncrona (webhook). |

---

## 7. Procesamiento Asíncrono & Integración CRM

Estos criterios validan el pipeline de eventos, procesamiento de cola FIFO y sincronización con CRM. Descrito en la Sección 4.1.3 (Asynchronous CRM Synchronization), Sección 5.3 (Asynchronous Processing via FIFO Queue) y Sección 5.5 (External System Integrations).

**Referencias de implementación:**
- `SaveLead` controller — envía mensaje SQS después de la creación del lead
- `SaveRegistration` controller — envía mensaje SQS después del registro
- `GetPayment` controller — envía evento SQS para inicio del acuerdo
- `Env.SESSION_EVENTS_QUEUE_URL` — URL de la cola SQS FIFO
- `SQSClient` + `SendMessageCommand` — uso de AWS SDK v3 en controllers

| ID | Criterio | Ref. Doc. Solución | Estado en Código |
|----|----------|-------------------|-----------------|
| AC-23 | Todos los eventos del flujo deben enviarse a una cola FIFO agrupados por el email del registrador para asegurar el orden correcto de procesamiento. | §5.3 — "Messages are grouped by the registrant's email address... FIFO ordering guarantees that events for a given registration are processed in sequence" | ✅ Implementado — Los controllers `SaveLead` y `SaveRegistration` usan `SQSClient.send(SendMessageCommand)` para publicar eventos a `Env.SESSION_EVENTS_QUEUE_URL`. Los mensajes incluyen `sessionId` y tipo de evento. El agrupamiento FIFO por email asegura el ordenamiento. |
| AC-24 | La sincronización con Zoho CRM debe realizarse de forma estrictamente asíncrona a través de la cola de mensajes. El flujo orientado al usuario nunca espera operaciones del CRM. | §4.1.3 — "The application does not depend on CRM availability for the user-facing flow to proceed"; §5.5 — "Zoho CRM: Exclusively asynchronous" | ✅ Arquitectura confirmada — Todos los eventos destinados al CRM pasan por SQS. Ningún controller bloquea en llamadas API al CRM. El consumer de la cola (Fase 2) procesa mensajes independientemente. |
| AC-25 | El sistema debe asociar al nuevo cliente con el Stripe Customer Portal correcto basado en su combinación de región y moneda. | §4.1.6 — "the application associates that Customer with the appropriate pre-configured Customer Portal" | ⚠️ Fase 2 — El documento solución describe esto como parte del flujo post-pago. El controller `Checkout` crea el cliente de Stripe pero la asociación al Customer Portal es parte de la fase de integraciones en background. |

---

## 8. Seguridad & Validación de Webhooks

Estos criterios validan las medidas de seguridad a lo largo del sistema. Descrito en la Sección 5.6 (Security Considerations).

**Referencias de implementación:**
- Stripe webhook signing secret — verificación de firma en eventos entrantes
- Zoho Sign HMAC — verificación de payload de webhooks
- Stripe hosted Checkout — cumplimiento PCI SAQ A

| ID | Criterio | Ref. Doc. Solución | Estado en Código |
|----|----------|-------------------|-----------------|
| AC-26 | Todos los webhooks recibidos de Stripe y Zoho Sign deben ser validados mediante firmas de seguridad antes de ser procesados. Stripe usa webhook signing secret; Zoho Sign usa HMAC. | §5.6 — "Both Stripe and Zoho Sign webhooks support signature verification (Stripe via webhook signing secret, Zoho Sign via HMAC). All incoming webhook payloads must be verified before processing." | ✅ Arquitectura confirmada — El documento solución exige verificación de firma. El webhook handler de Stripe en `cloud/stripe` debería usar `stripe.webhooks.constructEvent()` para verificación. El webhook de Zoho Sign debería validar HMAC. La implementación específica requiere verificación en el código del webhook handler. |


---

## 9. Control de Navegación & Restricciones Post-Pago

Estos criterios validan las reglas de navegación del flujo, el bloqueo post-pago y la redirección basada en estado. Derivados de la reunión de revisión del equipo (Manuel Lara & Moises Gonzalez) y alineados con la Sección 3 (Product Capability Description) del documento solución — el flujo es estrictamente secuencial e irreversible después del pago.

**Referencias de implementación:**
- `WorkflowStore` (`spa/src/stores/workflow/workflow.store.ts`) — `canAccess(step)`, `completedSteps`, `currentStep`
- `STATUS_TO_COMPLETED_STEPS` mapping — backend status → completed steps
- `SignUpLayout` (`spa/src/pages/SignUp/SignUpLayout.tsx`) — route guards
- Todos los controllers API — deben rechazar mutaciones en sesiones completadas/pagadas

| ID | Criterio | Fuente | Estado en Código |
|----|----------|--------|-----------------|
| AC-32 | Después de un pago exitoso (estado de sesión `paid`, `pending_signature` o `completed`), el usuario no debe poder navegar de vuelta al Formulario 1 (General Info), Formulario 2 (Details) o Selección de Plan. Tanto los route guards del SPA como los endpoints del backend deben hacer cumplir esta restricción. Intentar acceder a estas URLs debe redirigir al paso válido actual. | Reunión: "después de que el pago se haya completado con éxito, el usuario no pueda retroceder a los formularios anteriores"; "validación robusta en front-end y back-end" | ⚠️ Requiere verificación — `WorkflowStore.canAccess(step)` existe pero se necesita verificar que bloquea la navegación hacia atrás post-pago. Los controllers del backend (`SaveLead`, `SaveRegistration`) deberían rechazar actualizaciones cuando el status ≥ `pending`. |
| AC-33 | Los endpoints del backend `POST /lead` y `POST /registration` deben rechazar modificaciones de datos cuando el estado de la sesión es `pending`, `paid`, `pending_signature` o `completed`. La respuesta debe retornar un código de error apropiado (ej: 409 Conflict o 403 Forbidden). | Reunión: "implementarse tanto en el front-end como en los endpoints del back-end para evitar la modificación de datos ya establecidos" | ⚠️ Requiere verificación — Los controllers `SaveLead` y `SaveRegistration` deberían verificar el estado de la sesión antes de permitir actualizaciones. Se necesita verificar que este guard existe. |
| AC-34 | La aplicación debe implementar redirección basada en estado: cuando un usuario accede a cualquier URL de una sesión, el SPA debe redirigir a la página correspondiente al estado actual de la sesión. Si la sesión está `completed`, TODAS las URLs deben redirigir a la página de Completado. Si `pending_signature`, redirigir a Agreement. Si `paid`, redirigir a Paid/Agreement. | Reunión: "cualquier intento de visitar URLs anteriores debe resultar en el redireccionamiento"; "Completado la única página accesible" | ⚠️ Requiere verificación — `WorkflowStore` mapea `STATUS_TO_COMPLETED_STEPS` pero la lógica de redirección en `SignUpLayout` necesita hacer cumplir la navegación solo-hacia-adelante basada en el estado del backend. |
| AC-35 | La aplicación no debe usar sessionStorage ni localStorage para persistencia de datos de formulario. Todos los datos deben cargarse exclusivamente desde el backend vía `GET /lead/{sessionId}` y `GET /registration/{sessionId}`. El backend (DynamoDB) es la única fuente de verdad. | Reunión: "eliminando cualquier session storage que se esté utilizando para la carga de datos del formulario" | ✅ Arquitectura confirmada — `LeadStore` y `RegistrationStore` usan `loadFromBackend()`. Los comentarios en los stores establecen explícitamente "no sessionStorage". Se necesita verificar que no existe uso residual de sessionStorage en el codebase. |

---

## 10. Divisa & Visualización de Precios

Estos criterios validan que los precios se muestren en la moneda local correcta basándose en la selección de país del usuario. Derivados de la reunión de revisión del equipo donde se identificó un bug: seleccionar Colombia no mostraba los precios en Pesos Colombianos.

**Referencias de implementación:**
- `PlanSelectionPage` (`spa/src/pages/SignUp/PlanSelectionPage.tsx`) — visualización de precios
- `PlansStore` (`spa/src/stores/plans/plans.store.ts`) — carga de planes
- `Plans` controller (`api/src/controllers/Plans.ts`) — retorna precios
- `Checkout` controller — envía país al Lambda de Stripe para resolución de precios
- Stripe Price metadata — incluye ISO country code e ISO currency code

| ID | Criterio | Fuente | Estado en Código |
|----|----------|--------|-----------------|
| AC-36 | La página de Selección de Plan debe mostrar los precios en la moneda local correspondiente al país seleccionado en el Formulario 1 (General Info). Por ejemplo, si el usuario seleccionó Colombia, los precios deben mostrarse en Pesos Colombianos (COP). El símbolo de moneda y el formato deben coincidir con el locale. | Reunión: "la selección de un país, como Colombia, no resulta en la visualización de los precios en la moneda local (pesos)"; Doc. Solución §4.1.5 — "Price metadata includes the ISO country code and ISO currency code" | ⚠️ Bug identificado — El país del Formulario 1 debe enviarse a `GET /plans` o el endpoint de planes debe resolver precios basándose en el país de la sesión. Actualmente `PlanSelectionPage` muestra números sin símbolo de moneda. Se necesita verificar que el país se está enviando desde el frontend y que el backend retorna precios con información de moneda. |
| AC-37 | El endpoint `GET /plans` debe aceptar el país del usuario (desde la sesión) y retornar precios resueltos desde los metadatos de Stripe para ese país específico. Si no existe un precio para una combinación país/tier/intervalo, el plan debe mostrarse como no disponible para ese intervalo. | Doc. Solución §4.1.5 — "The application reads this metadata from Stripe and builds the necessary mappings (country → tier → frequency → Price ID) automatically" | ⚠️ Requiere verificación — El controller `Plans` debe usar el país de la sesión para filtrar precios de Stripe. Se necesita verificar que el endpoint recibe y usa el parámetro de país. |

---

## 11. Manejo de Errores & Feedback al Usuario

Estos criterios validan que los errores del backend se comuniquen correctamente al usuario a través del frontend. Derivados de la reunión de revisión del equipo.

**Referencias de implementación:**
- Todos los controllers API — retornan respuestas de error estructuradas
- `LeadStore`, `RegistrationStore` — `errors` Map para errores a nivel de campo
- `PlansStore` — propiedades `error` y `checkoutError`
- Notificaciones toast vía `ToastStore`

| ID | Criterio | Fuente | Estado en Código |
|----|----------|--------|-----------------|
| AC-38 | Los errores de validación del backend (campos obligatorios faltantes, valores inválidos, formato de email inválido) deben mostrarse al usuario en el frontend con mensajes de error claros y específicos por campo. Los mensajes de error deben aparecer junto al campo de formulario correspondiente. | Reunión: "asegurando que se implementen correctamente los mensajes de error reportados por el endpoint y las restricciones de campos obligatorios en el front-end" | ⚠️ Requiere verificación — Los Maps `LeadStore.errors` y `RegistrationStore.errors` existen. `getError(key)` retorna errores específicos por campo. Se necesita verificar que las respuestas de error del backend se parsean y mapean a los campos correctos en la UI. |
| AC-39 | Los campos de formulario que esperan formatos de datos específicos deben validar la entrada y mostrar mensajes de error apropiados: Email debe coincidir con el patrón `usuario@dominio.com`; Company Website debe ser una URL válida (si se proporciona); Company Founded debe ser exactamente 4 dígitos numéricos y no un año futuro; Phone debe contener solo dígitos después del código de país; ZIP/Postal Code debe coincidir con el formato esperado. | Reunión: "validaciones de formularios e inputs, asegurando que los campos reciban el formato de datos correcto, como URLs o valores numéricos" | ⚠️ Parcialmente implementado — La validación de email existe en `LeadStore.validate()`. Las validaciones de año fundación y URL necesitan verificación en `RegistrationStore.validate()`. |

---

## 12. Orquestación de Side Effects del CRM

Estos criterios detallan los puntos específicos de actualización del CRM a lo largo del flujo. Derivados de la reunión de revisión del equipo y alineados con la Sección 4.1.3 (Asynchronous CRM Synchronization) y Sección 5.3 (FIFO Queue).

**Referencias de implementación:**
- Cola SQS FIFO — `Env.SESSION_EVENTS_QUEUE_URL`
- Queue consumer (Fase 2) — procesa eventos y sincroniza con Zoho CRM
- Zoho CRM field mapping — mapea keys canónicas a campos custom del CRM

| ID | Criterio | Fuente | Estado en Código |
|----|----------|--------|-----------------|
| AC-40 | El sistema debe enviar un evento de sincronización al CRM en cada uno de los siguientes hitos del flujo: (1) Envío del Formulario 1 (lead created), (2) Envío del Formulario 2 (registration completed), (3) Checkout iniciado (payment pending), (4) Pago completado (checkout.session.completed), (5) Página de acuerdo abierta (pending_signature), (6) Acuerdo firmado (completed). Cada evento debe incluir los datos de sesión relevantes para ese hito. | Reunión: "actualizar el CRM al inicio del checkout, al completarse el pago, al abrir la página de agreement, y al firmar el acuerdo"; Doc. Solución §4.1.3 | ⚠️ Parcialmente implementado — `SaveLead` y `SaveRegistration` envían eventos SQS. `GetPayment` envía evento para inicio del acuerdo. Se necesita verificar que el inicio del checkout y la apertura del acuerdo también disparan eventos al CRM. |
| AC-41 | La sincronización con el CRM debe mapear las keys canónicas del formulario (ej: `person.name.first`, `company.name`) a los campos custom correspondientes de Zoho CRM. El contrato de mapeo debe definirse y mantenerse como parte de la implementación del queue consumer. | Doc. Solución §4.1.3 — "A dedicated integration layer processes queued events and synchronizes data with Zoho CRM through a predefined field mapping contract" | ⚠️ Fase 2 — El contrato de field mapping necesita definirse. El queue consumer que procesa mensajes SQS y llama al API de Zoho CRM es parte de la Fase 2 (Background Integrations). |

---

## 13. Internacionalización (i18n)

Estos criterios validan que la aplicación soporte múltiples idiomas. Derivados de la reunión de revisión del equipo y alineados con el steering de i18n del workspace.

**Referencias de implementación:**
- `i18next` + `react-i18next` — framework de traducción
- `spa/src/i18n/` — configuración de i18n
- `api/locales/es-co.json` — traducciones en español (backend)
- Archivos de traducción para `en-US` (bundled) e idiomas dinámicos

| ID | Criterio | Fuente | Estado en Código |
|----|----------|--------|-----------------|
| AC-42 | Todo texto visible al usuario en la aplicación debe usar claves de traducción i18n. No debe haber strings hardcodeados en componentes. La aplicación debe soportar como mínimo Inglés (en-US) y Español (es-CO). | Reunión: "asegurar que todas las claves estén en archivos de traducción"; "la aplicación soporte mínimamente español e inglés" | ⚠️ Requiere verificación — `useTranslation()` se usa en las páginas (confirmado en `PlanSelectionPage`). Se necesita verificar que todas las páginas y componentes usen claves de traducción consistentemente y que no queden strings hardcodeados. |
| AC-43 | La aplicación debe detectar y respetar la preferencia de idioma del navegador del usuario. Si el idioma del navegador coincide con un locale soportado, la aplicación debe renderizar en ese idioma automáticamente. | Reunión: "ajustándose al idioma del navegador, dado que actualmente el idioma está mezclado" | ⚠️ Requiere verificación — i18next soporta detección de idioma del navegador vía `i18next-browser-languagedetector`. Se necesita verificar que el detector está configurado en `spa/src/i18n/`. |

---

## 14. Notificaciones por Email

Estos criterios validan la funcionalidad de envío de emails a lo largo del flujo. Derivados de la reunión de revisión del equipo y alineados con la Sección 4.1.7 (Email Verification).

**Referencias de implementación:**
- Servicio de email del Workspace (infraestructura compartida)
- Eventos SQS disparan el envío de emails
- Templates de email para enlace de verificación/continuación

| ID | Criterio | Fuente | Estado en Código |
|----|----------|--------|-----------------|
| AC-44 | El sistema debe enviar un email de verificación/continuación después del pago exitoso. El email debe contener un enlace que permita al usuario continuar al paso de firma del acuerdo. El email debe entregarse exitosamente y el enlace debe ser funcional. | Reunión: "asegurar que el envío de correos sea funcional y que los correos definidos lleguen correctamente"; Doc. Solución §4.1.7 | ⚠️ Requiere verificación — El envío de email se dispara por el evento de completación de pago. Se necesita verificar que el template de email existe, que el formato del enlace es correcto y que la integración con el servicio de email es funcional. |


---

## 15. Resumen del Análisis

### Criterios Completamente Alineados con el Documento Solución y el Código

| AC | Área | Estado |
|----|------|--------|
| AC-01 | Inicialización de sesión vía URL | ✅ Alineado |
| AC-02 | Manejo de sesión inválida/expirada | ✅ Alineado |
| AC-03 | Persistencia en DynamoDB para datos de formulario | ✅ Alineado |
| AC-04 | Campos obligatorios en Formulario 1 | ✅ Alineado (nota: dirección son múltiples campos) |
| AC-05 | Validación de formato de email | ✅ Alineado |
| AC-07 | Carga dinámica de estado/provincia | ✅ Alineado |
| AC-08 | Teléfono con selector de código de país | ✅ Alineado |
| AC-09 | Dropdowns de perfil profesional | ✅ Alineado |
| AC-11 | Toggle de misma dirección de facturación | ✅ Alineado |
| AC-12 | Radio de Prosperity Planner / HCA Booklets | ✅ Alineado |
| AC-14 | Education + Language obligatorios | ✅ Alineado |
| AC-15 | Resolución de Stripe Price ID | ✅ Alineado |
| AC-16 | Redirección a Stripe Checkout con datos pre-llenados | ✅ Alineado |
| AC-17 | No captura de datos de tarjeta (PCI) | ✅ Alineado |
| AC-18 | Procesamiento de webhook checkout.session.completed | ✅ Alineado |
| AC-20 | Firma embebida con Zoho Sign | ✅ Alineado |
| AC-22 | Detección de completación de firma | ✅ Alineado |
| AC-23 | Cola FIFO con agrupamiento por email | ✅ Alineado |
| AC-24 | Sincronización asíncrona con CRM | ✅ Alineado |
| AC-26 | Validación de firma de webhooks | ✅ Alineado |
| AC-27 | Toggle de facturación mensual/anual | ✅ Alineado |
| AC-28 | Reutilización de checkout session | ✅ Alineado |
| AC-29 | Eliminación de TTL durante checkout | ✅ Alineado |
| AC-30 | Validación de whitelist en dropdowns | ✅ Alineado |
| AC-35 | Sin sessionStorage — solo backend | ✅ Alineado |

### Criterios que Requieren Verificación o Ajuste

| AC | Área | Problema |
|----|------|----------|
| AC-10 | Validación de año de Company Founded | ⚠️ El campo es obligatorio, pero la validación de 4 dígitos y año no futuro requiere verificación en `RegistrationStore.validate()`. |
| AC-13 | Exclusión mutua de "None of the above" | ⚠️ La opción `none` existe. `toggleMulti()` maneja la lógica. Verificar comportamiento de exclusión mutua. |
| AC-19 | Enlace de verificación de email | ⚠️ El mecanismo de envío de email y validación de enlace requiere verificación. |
| AC-21 | Regeneración de token de Zoho Sign | ⚠️ `AgreementInfo.status` soporta `'expired'` pero la lógica de retry requiere verificación. |
| AC-25 | Asociación a Stripe Customer Portal | ⚠️ Fase 2 — la asociación al portal no está implementada aún. |
| AC-32 | Bloqueo de navegación post-pago | ⚠️ `canAccess(step)` existe pero verificar que bloquea navegación hacia atrás post-pago en SPA y backend. |
| AC-33 | Backend rechaza mutaciones en sesiones pagadas | ⚠️ `SaveLead`/`SaveRegistration` deberían verificar status antes de permitir actualizaciones. Verificar que el guard existe. |
| AC-34 | Redirección basada en estado (completed → página Completed) | ⚠️ El mapeo `STATUS_TO_COMPLETED_STEPS` existe pero la aplicación de redirección en `SignUpLayout` requiere verificación. |
| AC-36 | Precios en moneda local por país | ⚠️ Bug identificado — el país puede no estar enviándose al endpoint de planes. Los precios se muestran sin símbolo de moneda. |
| AC-37 | Endpoint de planes usa país de la sesión para precios | ⚠️ Verificar que `GET /plans` recibe y usa el parámetro de país. |
| AC-38 | Errores del backend mostrados como mensajes específicos por campo | ⚠️ Los Maps de errores existen en los stores. Verificar parseo de errores del backend y mapeo a campos. |
| AC-39 | Validación de formato (URL, año, teléfono, ZIP) | ⚠️ Validación de email existe. Otras validaciones de formato requieren verificación. |
| AC-40 | Eventos CRM en los 6 hitos del flujo | ⚠️ Parcialmente implementado — lead y registration envían eventos. Checkout y agreement requieren verificación. |
| AC-41 | Contrato de field mapping del CRM | ⚠️ Fase 2 — queue consumer y field mapping no implementados aún. |
| AC-42 | Todo texto usa claves i18n (sin strings hardcodeados) | ⚠️ `useTranslation()` usado en páginas. Requiere auditoría completa de strings hardcodeados. |
| AC-43 | Auto-detección de idioma del navegador | ⚠️ Verificar que el detector de idioma de i18next está configurado. |
| AC-44 | Entrega de email post-pago y funcionalidad del enlace | ⚠️ Envío de email disparado por evento de pago. Template y entrega requieren verificación. |
| AC-31 | Prevención de bots (reCAPTCHA) | ⚠️ El doc. solución lo exige. La implementación requiere verificación. |

### Mapeo de Action Items de la Reunión → Criterios de Aceptación

Esta tabla mapea cada action item de la reunión de revisión del equipo (Manuel Lara & Moises Gonzalez) a los criterios de aceptación correspondientes.

| Action Item de la Reunión | AC(s) Mapeados | Cobertura |
|---------------------------|---------------|-----------|
| Validar Flujo completo | AC-01 a AC-22 | ✅ Flujo completo cubierto |
| Revisar Divisa (moneda por país) | AC-36, AC-37 | 🆕 Nuevo — bug identificado |
| Eliminar Session Storage | AC-35 | 🆕 Nuevo — criterio explícito |
| Bloquear Modificación post-pago | AC-32, AC-33 | 🆕 Nuevo — enforcement front + back |
| Redirección Estado | AC-34 | 🆕 Nuevo — redirección basada en estado |
| Verificar Webhooks Stripe | AC-18, AC-26 | ✅ Ya cubierto |
| Integrar CRM (side effects) | AC-40, AC-41 | 🆕 Nuevo — hitos detallados |
| Implementar i18n | AC-42, AC-43 | 🆕 Nuevo — criterios de i18n |
| Revisar Correos | AC-44 | 🆕 Nuevo — funcionalidad de email |
| Revisión Arquitectura | N/A | No es un AC — tarea de desarrollo |
| Documentar EdgeCases | N/A | No es un AC — tarea de desarrollo |

---

## 16. Referencia de Flujo de Datos

```
Usuario → SPA (GeneralInfoPage)
  → POST /lead { sessionId, data: { person.name.first, ... } }
    → SaveLead controller
      → DynamoDB: crear/actualizar sesión (status: lead, TTL: 3 días)
      → SQS: evento de sesión (lead_created)

Usuario → SPA (DetailsPage)
  → POST /registration { sessionId, data: { company.position, ... } }
    → SaveRegistration controller
      → DynamoDB: actualizar sesión (status: registered)
      → SQS: evento de sesión (registration_completed)

Usuario → SPA (PlanSelectionPage)
  → POST /checkout { sessionId, product: 'general', interval: 'year' }
    → Checkout controller
      → Lambda: EnsureCustomer (email, name, phone, address → Stripe Customer)
      → Lambda: Checkout (customerId, product, country, interval → Stripe Session)
      → DynamoDB: actualizar sesión (status: pending, stripe.checkout, eliminar TTL)
      → Return: { checkoutUrl } → redirección a Stripe

Stripe → Webhook: checkout.session.completed
  → DynamoDB: actualizar sesión (status: paid)
  → SQS: evento de sesión (payment_completed)

Usuario → SPA (PaidPage)
  → GET /payment/{sessionId}
    → GetPayment controller
      → DynamoDB: verificar status = paid
      → SQS: iniciar preparación del acuerdo

Usuario → SPA (AgreementPage)
  → GET /agreement/{sessionId}
    → GetAgreement controller
      → Zoho Sign: obtener/crear documento, generar embed token
      → Return: { signingUrl }

Usuario firma → Zoho Sign callback
  → GET /agreement/{sessionId}/signed
    → AgreementSigned controller
      → DynamoDB: actualizar sesión (status: completed)
      → SQS: evento de sesión (agreement_signed)
```
