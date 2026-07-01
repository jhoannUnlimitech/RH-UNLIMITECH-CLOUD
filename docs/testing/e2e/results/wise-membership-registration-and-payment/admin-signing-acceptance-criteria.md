# Admin Agreement Signing — Acceptance Criteria

Criterios de aceptación para la firma del administrador del acuerdo WISE Membership.
Este flujo ocurre DESPUÉS de que el cliente firma el documento (multiple signers template).

Source: Jam 7c9dfe53-49cc-47ff-a9f5-cd793f4add5d

## Pre-condiciones

- El cliente completó enrollment (lead + registration + plan + email verification + firma del cliente + pago)
- El template de Zoho Sign tiene múltiples firmantes (cliente + admin)
- El admin recibe un email en `admin-wise@isyifpzu.mailosaur.net` solicitando su firma

## Criterios de Aceptación

| AC | Descripción | Validación | Estado |
|----|-------------|------------|--------|
| AC-AS01 | Email de firma admin llega a Mailosaur | Buscar email con subject "requests you to sign WISE Membership Agreement" en `admin-wise@isyifpzu.mailosaur.net` | ✅ |
| AC-AS02 | Email contiene link a Zoho Sign | URL contiene `sign.zoho.com/zsguest` con `action_type=SIGN` | ✅ |
| AC-AS03 | Click "Proceed to document" navega a review page | URL cambia a `sign.zoho.com/zsstateless#/review/` | ✅ |
| AC-AS04 | Review page muestra Document info | Nombre del documento, sender, organización visibles | ✅ |
| AC-AS05 | Disclosure modal "Agree" avanza al documento | Click en link "Electronic Record and Signature Disclosure" → modal → click "Agree" | ✅ |
| AC-AS06 | Signature fields son clickeables | Click en `.field-edit-box:has-text("Signature")` abre modal de firma | ✅ |
| AC-AS07 | Firma se aplica correctamente | Click "Ok" en modal aplica la firma "WISE Admin" | ✅ |
| AC-AS08 | Todos los campos de firma se completan | Loop firma todos los campos hasta que no quedan más | ✅ |
| AC-AS09 | Click "Finish" completa la firma | Documento transiciona a estado completado | ✅ |
| AC-AS10 | Redirect final a `/iframe-signed` | URL cambia a la ruta de signed con mensaje de confirmación | ✅ |
| AC-AS11 | Email de completion llega | Email con subject "Document WISE Membership Agreement 1 has been completed" llega a `admin-wise@isyifpzu.mailosaur.net` | ✅ |

## Flujo

```
1. Enrollment completa (cliente firma + paga)
2. Admin recibe email → "requests you to sign WISE Membership Agreement"
3. Click link en email → Zoho Sign guest page
4. Click "Proceed to document" → Review page (Document info)
5. Click "Proceed to document" (segunda vez) → Consent page
6. Check consent + Click "Agree & Continue" → Documento con campos de firma
7. Click signature field → Modal de firma
8. Click "OK" → Firma aplicada
9. Click "Finish" → Documento completado
10. Confirmación: "You have signed this document"
11. Email de completion llega: "Document ... has been completed"
```

## Selectores clave (Zoho Sign — tercero)

Per steering test-annotations 10.5, Zoho Sign es tercero — selectores raw en factory:

| Elemento | Selector | Notas |
|----------|----------|-------|
| Proceed to document (guest page) | `button#signin-cancel` | Primera página de Zoho |
| Proceed to document (review page) | `button` con texto "Proceed to document" | Segunda página |
| Agree & Continue | `button.zs-btn.zs-btn-primary` | Después del consent checkbox |
| Signature field | `div.zs-signature-field` | Campo clickeable en el documento |
| OK (modal firma) | `button.btn.btn-primary` | Dentro del modal de firma |
| Finish | `button#Finish` | Completa la firma |

## Dependencias

- Mailosaur API key + server ID (`.env.qa`)
- Bridge data de enrollment (`.temp/bridge-output.json`)
- Admin email: `admin-wise@isyifpzu.mailosaur.net`
