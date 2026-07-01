# Criterios de Aceptación — Review Test QA Live

> **Branch:** `bugfix/review-test-qa-live`
> **Fecha:** 2026-06-30
> **Entorno:** `https://main.d13onxq0u1znrv.amplifyapp.com/`
> **Preferred Language:** Russian (dropdown Form 2)
> **Ejecución:** Manual vía browser + validación API (Mailosaur + Zoho CRM)
> **Contact:** Jhoann Amaranto (`ride-headed@emxeecta.mailosaur.net`)

---

## Criterios de Aceptación

| ID | Grupo | Criterio | Estado |
|----|-------|----------|:---:|
| AC-LV-01 | Navegación | La app carga en Amplify y crea sesión correctamente | ✅ Pass |
| AC-LV-02 | Form 1 | General Info se llena y envía correctamente | ✅ Pass |
| AC-LV-03 | Form 2 | Details se llena correctamente (Preferred Language = Russian) | ✅ Pass |
| AC-LV-04 | Plan | Plan Selection funciona y permite continuar | ✅ Pass |
| AC-LV-05 | Email Verify | Email de verificación llega y el link funciona | ✅ Pass |
| AC-LV-06 | Agreement | Firma del acuerdo funciona (Zoho Sign — template `ru`) | ✅ Pass |
| AC-LV-07 | Admin Sign | Admins reciben email de firma (admin1 + admin2) | ✅ Pass |
| AC-LV-08 | Checkout | Pago con Stripe funciona (tarjeta test) | ✅ Pass |
| AC-LV-09 | Emails recibidos | Se reciben 3 emails del sistema + 2 Zoho Sign (5 total) | ✅ Pass |
| AC-LV-10 | Emails estructura | Emails cumplen Rules (From, Subject, body, firstName) | ✅ Pass |
| AC-LV-11 | CRM Contact | Contact creado con Preferred_Language = Russian | ✅ Pass |
| AC-LV-12 | CRM Account | Account con Stripe_ID + Expiration_Date | ✅ Pass |
| AC-LV-13 | CRM Payment | Payment registrado (Description, Customer_Id, Period) | ✅ Pass |
| AC-LV-14 | CRM Invoice | Invoice registrado (Subject, Status=Approved, Total=500) | ✅ Pass |

---

## Resumen: 14/14 Pass ✅

---

## Evidencia detallada

### Emails recibidos (Mailosaur — después de 22:10 UTC)

| # | Hora | Destinatario | Subject | From |
|---|---|---|---|---|
| 1 | 22:11:14 | ride-headed (member) | Verify your email — WISE Membership | WISE Membership <noreply@membership.wise.org> |
| 2 | 22:11:44 | testwisecountersign1 (admin1) | ...requests you to sign WISE Membership Agreement - ru | notifications@zohosign.com |
| 3 | 22:11:48 | testwisecountersign2 (admin2) | ...requests you to sign WISE Membership Agreement - ru | notifications@zohosign.com |
| 4 | 22:11:50 | ride-headed (member) | WISE Membership Agreement Signed! | WISE Membership <noreply@membership.wise.org> |
| 5 | 22:13:37 | ride-headed (member) | Thank you for your WISE Membership payment | WISE Membership <noreply@membership.wise.org> |

**Observación AC-LV-09:**
- Se reciben **3 emails del sistema** al member: Verify + Agreement Signed + Welcome/Payment ✅
- Se reciben **2 emails de Zoho Sign** a los admins ✅
- El receipt (View Receipt + Stripe link) viene incluido en el Welcome email ✅
- El D4 (Payment Transaction como email separado) solo aplica a renewals, no al primer enrollment — correcto por diseño

### Contenido de emails — Rules compliance

| Email | Dear firstName | Body | CTA button | Fallback link | Sign-off |
|---|:---:|:---:|:---:|:---:|:---:|
| Verify | ✅ "Dear Jhoann" | ✅ Verificación + tips + domain | ✅ VERIFY | ✅ url visible | ✅ Best regards, WISE |
| Agreement Signed | ✅ "Dear Jhoann" | ✅ "Thank you for signing..." | ✅ Continue to Payment | ✅ url visible | ✅ Best regards, WISE |
| Welcome/Payment | ✅ "Dear Jhoann" | ✅ "five (5) business days" | ✅ View Receipt (Stripe) | ✅ url visible | ✅ Best regards, WISE |

**firstName personalizado:** ✅ Los 3 emails dicen "Dear Jhoann" (NO "Dear Member") — el bug de firstName está corregido en este entorno.

### CRM — Contact

| Campo | Valor |
|---|---|
| Name | Jhoann Amaranto |
| Email | ride-headed@emxeecta.mailosaur.net |
| Status | Pending Countersign |
| **Preferred_Language_Form** | **Russian** ✅ |
| Second_Language_Form | English |
| Account_Name | Ea incididunt ullamc |

### CRM — Account

| Campo | Valor |
|---|---|
| Account_Name | Ea incididunt ullamc |
| **Stripe_ID** | **cus_UnlQD85BAkB3Jy** ✅ |
| **Expiration_Date** | **2027-06-30** ✅ (annual: +365 días) |
| Phone | +11234235235 |

### CRM — Payment

| Campo | Valor |
|---|---|
| Description | General Membership · Annual · Ea incididunt ullamc |
| Customer_Id | cus_UnlQD85BAkB3Jy |
| Subscription_Id | sub_1To9uHRKKa3Cg9QiKitbjxln |
| Period_Start | 2026-06-30 |
| Period_End | 2027-06-30 |

### CRM — Invoice

| Campo | Valor |
|---|---|
| Subject | General Membership · Annual · Ea incididunt ullamc |
| Status | Approved |
| Grand_Total | 500 |

---

## Notas

1. **Zoho Sign template:** Se usó template con sufijo `-ru` (el sistema resolvió por `preferredLanguageISO = 'ru'`). Esto indica que existe un template ruso para el agreement, no fue fallback a English.

2. **Contact.Status = "Pending Countersign":** Correcto para el momento de validación — el webhook de countersign de los admins es asíncrono y puede tardar minutos. El status eventualmente cambiará a "Signed Agreement" cuando los admins completen la firma.

3. **D4 (Payment Receipt email):** No se recibió como email separado. Posible causa: el `EmailType.PaymentTransaction` en el código está marcado como "for renewals, not enrollment" — el primer pago del enrollment envía el receipt como parte del Welcome email (botón View Receipt), no como email separado. Esto es coherente con la implementación en `solution/enrollment-email-notifications`.

4. **firstName corregido:** Los 3 emails muestran "Dear Jhoann" — el bug de `ProcessAgreementSigned.ts` y `ProcessPayment.ts` que mostraba "Dear Member" está **resuelto** en este entorno live.
