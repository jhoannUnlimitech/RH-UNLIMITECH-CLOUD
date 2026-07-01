# Criterios de Aceptación — Profile Photo Upload

> **Propósito:** Validar la funcionalidad de subida de foto de perfil en Form 2 (Details),
> incluyendo validación frontend, endpoint API, upload a S3, y configuración del bucket.
>
> **Fecha:** 2026-06-05
> **Branch:** `solution/sdk-upgrade`
> **Bucket:** `hcamsws--appenroll-devqa-bucketprofileimagesbucket-xdshfwwk`
> **Endpoint:** `POST /upload/:sessionId/profile-image`
> **Object Key Format:** `uploads/{year}/{month}/{sessionId}/profile-image/{timestamp}_{sanitizedFilename}`
> **Formatos permitidos:** `image/jpeg`, `image/png`
> **Tamaño máximo:** 10 MB
> **TTL del bucket:** 3 días (lifecycle rule `auto-delete-uploads`)

---

## 1. UI / E2E — Happy Path

**Spec:** `specs/happy-path/profile-photo-upload.spec.ts` — 8 tests ✅

| ID | Criterio | Estado | Evidencia |
|----|----------|--------|-----------|
| AC-PU-01 | Campo de subir foto visible en Form 2, section "Contact Image" | ✅ | `[data-test-key="profile-photo-input"]` visible |
| AC-PU-02 | Input tiene `accept="image/jpeg,image/png"` (solo JPEG y PNG) | ✅ | `getAttribute('accept')` verificado |
| AC-PU-03 | Input NO tiene atributo `multiple` (solo 1 archivo) | ✅ | `getAttribute('multiple')` === null |
| AC-PU-04 | Subir JPEG válido (780KB) → preview visible con thumbnail | ✅ | `setInputFiles` → `profile-photo-preview` con `<img>` |
| AC-PU-05 | Preview muestra nombre + tamaño en MB | ✅ | Texto visible en preview div |
| AC-PU-06 | Botón "Remove" visible después de upload | ✅ | `[data-test-key="profile-photo-remove"]` visible |
| AC-PU-09 | Submit formulario CON foto → navega a /plan | ✅ | Click submit → `waitForURL(/plan/)` |
| AC-PU-45 | Preview usa blob URL local (no S3 URL — seguridad) | ✅ | `img.src.startsWith('blob:')` |

---

## 2. UI / E2E — Validation

**Spec:** `specs/validation/profile-photo-validation.spec.ts` — 15 tests ✅

| ID | Criterio | Estado | Evidencia |
|----|----------|--------|-----------|
| AC-PU-07 | Click "Remove" → preview desaparece, input reset a "Choose File" | ✅ | Click → preview not visible, input attached |
| AC-PU-08 | Re-upload después de remove → nueva preview con imagen diferente | ✅ | `setInputFiles(imageB)` → nueva preview |
| AC-PU-10 | Submit formulario SIN foto → /plan (campo es opcional) | ✅ | Fill form sin foto + submit → URL /plan |
| AC-PU-11 | Estado "Uploading..." visible durante upload (red lenta) | ✅ | CDP network throttle → label "Uploading" visible |
| AC-PU-12 | Archivo > 10MB (`profile_over_12mb_square.jpg`, 13.9MB) → error visible | ✅ | Error: "File size must not exceed 10 MB" |
| AC-PU-13 | Archivo WebP (`not-validate-imagen-profile.webp`) → error tipo inválido | ✅ | Error: "Only JPG and PNG files are allowed" |
| AC-PU-14 | Archivo exactamente 10MB (`profile_10mb_square.jpg`) → aceptado (boundary) | ✅ | Preview visible, sin error (10MB ≤ 10MB) |
| AC-PU-15 | Después de error, upload archivo válido → error desaparece | ✅ | Error → valid file → error hidden + preview visible |
| AC-PU-16 | Error desaparece al seleccionar archivo válido | ✅ | Same as AC-PU-15 |
| AC-PU-17 | Mensajes de error en inglés (i18n EN) correctos | ✅ | `toContainText('File size must not exceed 10 MB')` + `'Only JPG and PNG files are allowed'` |

---

## 3. API — Endpoint POST /upload/:sessionId/profile-image

**Spec:** `specs/validation/profile-photo-api-validation.spec.ts`

| ID | Criterio | Estado | Evidencia |
|----|----------|--------|-----------|
| AC-PU-18 | Body válido `{ filename, contentType: "image/jpeg" }` → 200 + response shape | ✅ | `uploadUrl`, `objectKey`, `expiresIn`, `maxSizeBytes` presentes |
| AC-PU-19 | Body válido `{ contentType: "image/png" }` → 200 | ✅ | Status 200, uploadUrl truthy |
| AC-PU-20 | `contentType: "image/webp"` → 400 `INVALID_CONTENT_TYPE` | ✅ | Status 400, code field |
| AC-PU-21 | `contentType: "application/pdf"` → 400 `INVALID_CONTENT_TYPE` | ✅ | Status 400 |
| AC-PU-22 | Missing `filename` → 400 `INVALID_BODY` | ✅ | Body sin filename → 400 |
| AC-PU-23 | Missing `contentType` → 400 `INVALID_BODY` | ✅ | Body sin contentType → 400 |
| AC-PU-24 | Empty body `{}` → 400 `INVALID_BODY` | ✅ | Body vacío → 400 |
| AC-PU-25 | SessionId inexistente → 403 (API Gateway) o 404 (Lambda) | ✅ | UUID inventado → 403 |
| AC-PU-26 | `objectKey` formato: `uploads/{year}/{month}/{sessionId}/profile-image/{ts}_{name}` | ✅ | Regex match confirmado |
| AC-PU-27 | `expiresIn` = 300 (5 minutos) | ✅ | `response.expiresIn === 300` |
| AC-PU-28 | `maxSizeBytes` = 10485760 (10 MB) | ✅ | `response.maxSizeBytes === 10*1024*1024` |
| AC-PU-29 | PUT a `uploadUrl` con JPEG válido → S3 acepta (200/204) | ✅ | PUT binary → 200, `head-object` confirma |
| AC-PU-30 | Filename con chars especiales → sanitizado (reemplazados por `_`) | ✅ | `my photo (1) [final].jpg` → `my_photo__1___final_.jpg` |
| AC-PU-44 | `objectKey` incluye sessionId (aislamiento por sesión) | ✅ | `objectKey.contains(sessionId)` |

---

## 4. Infraestructura — S3 Bucket Configuration

**Spec:** `specs/validation/profile-photo-api-validation.spec.ts` (Section 1) — AWS CLI

| ID | Criterio | Estado | Evidencia |
|----|----------|--------|-----------|
| AC-PU-31 | Bucket `Bucket@ProfileImages` existe y está deployed | ✅ | `aws s3api head-bucket` → no error |
| AC-PU-32 | CORS: AllowedOrigins `["*"]`, AllowedMethods `["PUT", "GET"]` | ✅ | `get-bucket-cors` confirmado |
| AC-PU-33 | CORS: AllowedHeaders incluye `Content-Type` y `Content-Length` | ✅ | Ambos presentes en la config |
| AC-PU-34 | Lifecycle: objetos en `uploads/` se auto-eliminan a los 3 días | ✅ | Rule `auto-delete-uploads`: Status=Enabled, Prefix=`uploads/`, Days=3 |
| AC-PU-35 | Bucket bloquea todo acceso público (Block All) | ✅ | Todas las opciones en `true` |
| AC-PU-36 | Objetos almacenados con estructura correcta `uploads/{year}/{month}/{sessionId}/...` | ✅ | `aws s3 ls --recursive` → todas las keys coinciden con el patrón |

---

## 5. Infraestructura — Lambda Configuration

**Verificado via:** AWS CLI (`lambda get-function-configuration`, `iam get-role-policy`)

| ID | Criterio | Estado | Evidencia |
|----|----------|--------|-----------|
| AC-PU-37 | Lambda env `S3_BUCKET_PROFILE_IMAGES` = nombre del bucket | ✅ | `hcamsws--appenroll-devqa-bucketprofileimagesbucket-xdshfwwk` |
| AC-PU-38 | Lambda env `DDB_TABLE_ENROLLMENT_SESSIONS` = ARN de la tabla | ✅ | `arn:aws:dynamodb:us-east-1:031497423138:table/HCAMSWS--AppEnroll-DevQA-TableEnrollmentSessionsTable-ukmvnbeo` |
| AC-PU-39 | Lambda timeout = 10 seconds | ✅ | `Timeout: 10` |
| AC-PU-40 | IAM: `dynamodb:GetItem` + `dynamodb:Query` en tabla + indexes | ✅ | Inline policy verificada |
| AC-PU-40b | IAM: `s3:PutObject` SOLO en `uploads/*` (mínimo privilegio) | ✅ | Resource: `arn:aws:s3:::...bucket.../uploads/*` |

---

## 6. Seguridad

| ID | Criterio | Estado | Evidencia |
|----|----------|--------|-----------|
| AC-PU-41 | Frontend valida tipo ANTES de llamar al backend (no network request) | ✅ | Código: `validateFile` retorna error sin llamar API |
| AC-PU-42 | Frontend valida tamaño ANTES de llamar al backend | ✅ | `file.size > MAX_SIZE_BYTES` → error local, no fetch |
| AC-PU-43 | Presigned URL: solo permite PUT al key específico (IAM: `s3:PutObject` en `uploads/*`) | ✅ | Verificado en `factories/functions.api.ts:446` |
| AC-PU-44 | Object key incluye sessionId (aislamiento por sesión) | ✅ | Pattern: `uploads/.../sessionId/profile-image/...` |
| AC-PU-45 | Preview usa blob URL local (`blob:...`), NO URL de S3 | ✅ | `URL.createObjectURL(file)` en el componente |

---

## 6. Integración — Registration Form Factory

El upload de foto se integra como Step 23 en `fillRegistrationForm()`:

```
Step 22: Personal State Select (cascading)
Step 23: Profile Photo Upload (optional — si data.profilePhotoPath está definido)
Step 24: Birth Year
Step 25: Education Select
Step 26: Preferred Language Select
Step 27: Secondary Language Select (optional)
```

Dataset `REG_USA_V4` incluye `profilePhotoPath` → todos los flujos full-enrollment suben foto automáticamente.

---

## 7. CRM — Profile Photo Sync (Pendiente implementación backend)

> **Estado:** 📋 Pendiente desarrollo. El desarrollador debe implementar la sincronización
> de la foto desde S3 al CRM (Zoho Contact photo endpoint). Actualmente la imagen se sube
> a S3 pero NO se sincroniza al CRM.

**Validación:** `audit-crm.spec.ts` — Se añadirá verificación via API de Zoho CRM

| ID | Criterio | Estado | Método de validación |
|----|----------|--------|---------------------|
| AC-PU-46 | Después del CRM sync, la foto existe en Zoho Contact (GET /Contacts/{id}/photo → 200) | 📋 Pendiente backend | API: `GET /Contacts/{contactId}/photo` → 200 + binary image |
| AC-PU-47 | Si `profilePhoto` es null/undefined en la sesión, CRM sync no falla (skip graceful) | 📋 Pendiente backend | Formulario sin foto → CRM sync completa sin error |
| AC-PU-48 | Después de sync exitoso, objeto eliminado de S3 (`head-object` → 404 NoSuchKey) | 📋 Pendiente backend | `aws s3api head-object --key {objectKey}` → 404 post-sync |
| AC-PU-49 | Si CRM sync falla, objeto persiste en S3 (safety net — lifecycle lo elimina a los 3 días) | 📋 Pendiente backend | Simular fallo CRM → verificar objeto sigue en S3 |
| AC-PU-50 | La foto en Zoho CRM tiene el content-type correcto (image/jpeg o image/png) | 📋 Pendiente backend | Verificar response headers del GET photo |

> **Cómo se validará en audit-crm:**
> ```typescript
> // En el audit CRM, después de verificar Contact fields:
> // 1. GET /Contacts/{contactId}/photo
> // 2. Si snapshot.registration.profilePhoto !== null → expect 200 + binary
> // 3. Si snapshot.registration.profilePhoto === null → expect 204 or no photo
> ```

> **Zoho API para foto de Contact:**
> ```
> GET https://www.zohoapis.com/crm/v5/Contacts/{contact_id}/photo
> → 200 + binary image (si tiene foto)
> → 204 (si no tiene foto)
> ```

---

## Resumen

| Categoría | Total | ✅ Pass | 📋 Pendiente |
|-----------|-------|---------|--------------|
| UI Happy Path | 8 | 8 | 0 |
| UI Validation | 10 | 10 | 0 |
| API Endpoint | 14 | 14 | 0 |
| S3 Bucket Infra | 6 | 6 | 0 |
| Lambda Infra | 5 | 5 | 0 |
| Seguridad | 5 | 5 | 0 |
| CRM Photo Sync | 5 | 0 | 5 |
| **TOTAL** | **53** | **48** | **5 (backend)** |

---

## Imágenes de prueba

| Archivo | Tamaño | Tipo | Propósito |
|---------|--------|------|-----------|
| `profile_under_10mb_square_b.jpg` | 780 KB | JPEG | Happy path (rápido) |
| `profile_under_10mb_square_a.jpg` | 2.4 MB | JPEG | Re-upload / segundo archivo |
| `profile_10mb_square.jpg` | 10 MB | JPEG | Boundary (exactamente en el límite) |
| `profile_over_12mb_square.jpg` | 13.9 MB | JPEG | Over limit → error |
| `not-validate-imagen-profile.webp` | 423 KB | WebP | Tipo inválido → error |

Ubicación: `packages/apps/enrollment/modules/spa/examples/profile-images/`

---

## Test Execution Summary

| Spec | Tests | Tiempo | Estado |
|------|-------|--------|--------|
| `profile-photo-upload.spec.ts` | 8 | ~1.0m | ✅ |
| `profile-photo-validation.spec.ts` | 15 | ~1.9m | ✅ |
| `profile-photo-api-validation.spec.ts` | 16 | ~10s | ✅ |
| **TOTAL** | **39** | **~3.0m** | **✅** |

---

## Notas

- **Fecha de última ejecución:** 2026-06-05
- **Branch:** `solution/sdk-upgrade`
- **Formatos reales:** `image/jpeg` + `image/png` (NO webp — difiere del documento original)
- **TTL real:** 3 días (NO 24h — el código del bucket dice 3 días)
- **No hay Content-Length condition en el presigned URL** — la validación de tamaño es solo frontend. El backend genera el presigned URL sin restricción de tamaño en la firma. Esto es un gap de seguridad menor (un actor malicioso podría bypassear el frontend y subir >10MB directamente al presigned URL).
- **El campo es opcional** — el formulario se puede enviar sin foto (`profilePhoto?: ProfilePhotoData | null`)
- **Chrome MCP upload crashea** — el MCP de Chrome no puede hacer `upload_file` con archivos >500KB sin crashear el tab. Los tests usan Playwright `setInputFiles()` que es estable.
