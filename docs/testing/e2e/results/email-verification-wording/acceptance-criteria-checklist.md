# Criterios de Aceptación — Email Verification Wording (#893)

> **Branch:** `bugfix/email-verification-wording`
> **Ticket:** #893
> **Fecha:** 2026-06-17
> **Última ejecución:** 2026-06-17 (17/17 pass, 1.0m)

---

## Descripción del Ticket

El texto del email de verificación ("Verify your email address") no coincidía con el Rules Document (página 79). El email debe contener:
- Greeting personalizado con el nombre del usuario
- CTA "Please click the button below to verify your email address."
- Botón VERIFY funcional
- Aviso de dominio @membership.wise.org
- 3 tips de seguridad
- Contacto support@membership.wise.org
- Sign-off "Best regards, WISE Membership Support"

---

## Criterios de Aceptación

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-893-01 | Email greeting: "Dear [FirstName]," (personalizado) | E2E: Mailosaur HTML body | ✅ Pass |
| AC-893-02 | CTA: "Please click the button below to verify your email address." | E2E: Mailosaur HTML body | ✅ Pass |
| AC-893-03 | Botón VERIFY presente con link funcional `/verify?token=` | E2E: Mailosaur text+html links | ✅ Pass |
| AC-893-04 | Dominio: "future emails will be sent from the @membership.wise.org domain" | E2E: Mailosaur HTML body | ✅ Pass |
| AC-893-05 | Security tip 1: "add our email address to your contacts or safe sender list" | E2E: Mailosaur HTML body | ✅ Pass |
| AC-893-06 | Security tip 2: "verify that messages from us come from the @membership.wise.org domain" | E2E: Mailosaur HTML body | ✅ Pass |
| AC-893-07 | Security tip 3: "cautious of emails from similar-looking domains or addresses" | E2E: Mailosaur HTML body | ✅ Pass |
| AC-893-08 | Contacto: "support@membership.wise.org" | E2E: Mailosaur HTML body | ✅ Pass |
| AC-893-09 | Sign-off: "Best regards, WISE Membership Support" | E2E: Mailosaur HTML body | ✅ Pass |
| AC-893-10 | Versión texto del email contiene todas las frases clave | E2E: Mailosaur text body | ✅ Pass |

---

## Flujo del Test

```
Form 1 (fill + submit) → Form 2 (fill + submit) → Plan Selection (select General Annual) →
→ Thank You page → Mailosaur API intercepta email → Validar body content (10 ACs)
```

**Tiempo total:** ~1 minuto (Form 1: 12s, Form 2: 19s, Plan: 8s, Email wait: 4-7s, Validaciones: <1s)

---

## Spec Automatizado

| Spec | Tests | Status |
|------|-------|--------|
| `email-verification-wording.spec.ts` | 17 | ✅ All pass |

---

## Template Verificado

Archivo: `infra/functions/EmailDispatch.ts` → `EmailType.EmailVerify`

El template incluye:
- HTML version con layout (header, CTA button, security tips list, contact link)
- Text version plain-text (fallback para clientes sin HTML)
- Personalización con `msg.firstName` (fallback a "Member")
- Link de verificación con token único

---

## Notas Técnicas

- El email es interceptado via **Mailosaur API** (no browser navigation)
- Los links en la versión HTML pueden estar wrapped por **Elastic Email tracking** — el test busca primero en `text.links` (no wrapped) y luego en `html.links`
- El `firstName` es validado contra el valor del dataset (`LEAD_USA_V4.firstName`)
- El factory usa **shared state** (module-level variable) para capturar el email una vez y validar en múltiples tests
