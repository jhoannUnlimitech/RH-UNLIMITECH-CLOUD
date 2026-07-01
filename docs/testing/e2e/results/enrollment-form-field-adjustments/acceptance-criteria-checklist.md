# Criterios de Aceptación — Enrollment Form Field Adjustments

> **Branch:** `bugfix/enrollment-form-field-adjustments`
> **Tickets:** #874, #875, #877, #878, #879, #880, #881, #883, #884, #885, #886, #887, #888, #889, #890, #894
> **Fecha:** 2026-06-16
> **Última ejecución:** 2026-06-17 (57/57 pass)

---

## Ticket #874 — Phone Type selector (ADJ-01)

**Solicitud:** Cambiar "Company Phone" a "Phone" y agregar selector de Type (default Cell/Mobile, opciones: Company, Home)

**CRM Mapping:** Cell/Mobile → `Mobile`, Company → `Phone`, Home → `Home_Phone` (en Lead y Contact)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-874-01 | Label del campo teléfono en Form 1 es "Phone" (EN), no "Company Phone" | E2E: verify label text | ✅ Pass |
| AC-874-02 | Selector de Type visible junto al campo Phone en Form 1 | E2E: verify element visible | ✅ Pass |
| AC-874-03 | Selector de Type tiene 3 opciones: "Cell / Mobile", "Company", "Home" | E2E: verify option count + texts | ✅ Pass |
| AC-874-04 | Selector de Type default = "Cell / Mobile" (primera opción seleccionada) | E2E: verify selected value | ✅ Pass |
| AC-874-05 | Se puede seleccionar "Cell / Mobile" | E2E: selectOption + verify | ✅ Pass |
| AC-874-06 | Se puede seleccionar "Company" | E2E: selectOption + verify | ✅ Pass |
| AC-874-07 | Se puede seleccionar "Home" | E2E: selectOption + verify | ✅ Pass |
| AC-874-08 | Phone Type es required — form no envía sin seleccionar | E2E: submit sin type → no navega | ✅ Pass |
| AC-874-09 | CRM: Type "Cell / Mobile" → Contact.Mobile = phone number | CRM API: verified Contact.Mobile = "+12937437645" | ✅ Pass |
| AC-874-10 | CRM: Type "Company" → Lead.Phone = phone number | Code-verified: same switch statement (resolvePhoneFields) | ✅ Pass |
| AC-874-11 | CRM: Type "Home" → Lead.Home_Phone = phone number | Code-verified: same switch statement (resolvePhoneFields) | ✅ Pass |

---

## Ticket #875 — Company Position update (ADJ-02)

**Solicitud:** Cambiar "Company Contractor" a "Contractor/Consultant" y agregar hint "Select your legal relationship to the Company."

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-875-01 | Dropdown de Position tiene opción "Company Contractor/Consultant" (no "Company Contractor") | E2E: verify option text | ✅ Pass |
| AC-875-02 | Campo Position tiene hint visible "Select your legal relationship to the Company." | E2E: verify hint text | ✅ Pass |
| AC-875-03 | Se puede seleccionar "Contractor/Consultant" y el formulario se envía correctamente | E2E: selectOption + submit | ✅ Pass |
| AC-875-04 | CRM: Position → Contact.Position_Form maps correctly | CRM API: verified Position_Form = "Company Owner" for company_owner | ✅ Pass |

---

## Ticket #877 — Industry "Other" conditional field (ADJ-15)

**Solicitud:** Cuando "Other" se selecciona en Industry, agregar un segundo campo REQUIRED.

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-877-01 | "Other" es la última opción del dropdown Industry | E2E: verify last option text | ✅ Pass |
| AC-877-02 | Seleccionar "Other" → aparece campo de texto para especificar | E2E: selectOption + verify Details visible | ✅ Pass |
| AC-877-03 | Campo "Other" details es Required (tiene indicador) | E2E: verify "(Required)" text present | ✅ Pass |
| AC-877-04 | Se puede llenar el campo y submit exitosamente | E2E: fill + submit | 🔲 Pendiente (full flow) |
| AC-877-05 | Seleccionar industria diferente a "Other" → campo details desaparece | E2E: selectOption non-other + verify hidden | ✅ Pass |

---

## Ticket #878 — Company Size: "0 Employees" + hint (ADJ-04)

**Solicitud:** Agregar "0 Employees" al top de la lista y cambiar hint a "Select the number of full-time employees working for the Company (Not including the Company owner)."

**Nota DOM:** El developer movió `company-size-select` fuera de `industry-size-section` — ahora es un key directo de `registration-form`. POM actualizado.

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-878-01 | Dropdown Company Size tiene "0 Employees" como primera opción seleccionable | E2E: verify first option | ✅ Pass |
| AC-878-02 | Hint del campo Company Size es "Select the number of full-time employees working for the Company (Not including the Company owner)." | E2E: verify hint text | ✅ Pass |
| AC-878-03 | Se puede seleccionar "0 Employees" y el formulario se envía correctamente | E2E: selectOption + submit | ✅ Pass |
| AC-878-04 | CRM: "0 Employees" → Account.Company_Size = "0 Employees" | CRM mapping confirmed in zoho-crm.ts | ✅ Pass |

---

## Ticket #879 — Company Website fields (ADJ-11)

**Solicitud:** Cambiar subtext, pre-populate "https://", agregar checkbox "no website". (Punto 1 — width — rechazado por el cliente.)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-879-01 | Subtext = "Enter your Company website or social media sites so we can better serve you." | E2E: verify text | ✅ Pass |
| AC-879-02 | Texto anterior "Enter the main website for your Company." NO presente | E2E: verify NOT present | ✅ Pass |
| AC-879-03 | Primer campo URL tiene placeholder "https://" | E2E: verify placeholder attr | ✅ Pass |
| AC-879-04 | Campos adicionales (Add URL) también tienen placeholder "https://" | E2E: click Add + verify | 🔲 Pendiente |
| AC-879-05 | Checkbox "My Company does not have a Website or Social media account." visible | E2E: verify visible | ✅ Pass |
| AC-879-06 | Checkbox texto correcto | E2E: verify text | ✅ Pass |
| AC-879-07 | Al marcar checkbox → campo website se oculta | E2E: check + verify hidden | ✅ Pass |
| AC-879-08 | Al desmarcar checkbox → campo website vuelve a ser visible | E2E: uncheck + verify visible | ✅ Pass |
| AC-879-09 | Form se puede enviar con checkbox marcado (sin URL) | E2E: check + submit → no error | 🔲 Pendiente (full flow) |
| AC-879-10 | Width del campo NO cambió (full-width — rechazado por cliente) | Visual: field is 100% width | ✅ Pass |

---

## Ticket #880 — Company Founded single column (ADJ-05)

**Solicitud:** Hacer el campo Company Founded más pequeño (una sola columna)

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-880-01 | Campo Company Founded NO ocupa el ancho completo del formulario | E2E: bounding box width = 50% del container | ✅ Pass |
| AC-880-02 | Campo Company Founded es funcional (acepta año y se envía) | E2E: fill + submit | ✅ Pass |

---

## Ticket #881 — Additional Phone con Type (ADJ-06, ADJ-06b)

**Solicitud:** 1) Renombrar "Alternate Phone" → "Additional Phone". 2) Agregar selector Type (default Cell/Mobile). 3) No enviar a CRM si no tiene dígitos.

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-881-01 | Label del campo en Form 2 es "Additional Phone" (no "Alternate Phone") | E2E: verify label text | ✅ Pass |
| AC-881-02 | Selector de Type visible junto al campo Additional Phone en Form 2 | E2E: verify element visible | ✅ Pass |
| AC-881-03 | Selector de Type tiene 3 opciones: "Cell / Mobile", "Company", "Home" | E2E: verify options | ✅ Pass |
| AC-881-04 | Selector de Type default = "Cell / Mobile" | E2E: verify selected value | ✅ Pass |
| AC-881-05 | Additional Phone es opcional (Form 2 envía sin llenarlo) | E2E: submit sin llenar → no error | ✅ Pass |

---

## Ticket #883 — Prosperity Planner & HCA Booklets wording/layout (ADJ-13)

**Solicitud:** Actualizar wording y opciones de radio buttons según diseño. Ambas secciones: hint "Indicate your current shipping preferences for this membership benefit (can be changed later):", 2 radio options (Ship upon request / Ship automatically), nota disclaimer en HCA.

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-883-01 | Título = "WISE® Prosperity Planner (Required)" | E2E: AC-B2-30/32 (cubierto Batch 2) | ✅ Pass |
| AC-883-02 | Hint Prosperity = "Indicate your current shipping preferences for this membership benefit (can be changed later):" | E2E: verify full hint text via i18n | ✅ Pass |
| AC-883-03 | Prosperity radios: solo "Ship upon request" + "Ship automatically" | E2E: AC-B2-36/37/38/39 (cubierto Batch 2) | ✅ Pass |
| AC-883-04 | Título = "HCA® Management System Article Booklets (Required)" | E2E: AC-B2-34 (cubierto Batch 2) | ✅ Pass |
| AC-883-05 | Hint HCA = mismo texto completo que Prosperity | E2E: verify full hint text via i18n | ✅ Pass |
| AC-883-06 | HCA radios: solo "Ship upon request" + "Ship automatically" | E2E: AC-B2-36/37/39 (cubierto Batch 2) | ✅ Pass |
| AC-883-07 | HCA nota: "*Some items may not be available in all languages and regions." | E2E: verify text in form | ✅ Pass |
| AC-883-08 | Orden visual: Prosperity Planner ANTES de HCA Booklets | E2E: bounding box Y comparison | ✅ Pass |
| AC-883-09 | "Do not ship" option removida de ambas secciones | E2E: AC-B2-38 (cubierto Batch 2) | ✅ Pass |

---

## Ticket #884/ADJ-09 — "I am interested in learning about" options

**Cambios realizados:**
1. `mastertech_software` → "HCA Management System implementation and consulting services from Mastertech."
2. NEW: `personnel_potential` → "Personnel Potential Analysis employee testing software from Mastertech."
3. `hca_printed` → "Publications available from HCA Press."
4. NEW: `hca_degrees` → "Degree programs offered by the Hubbard College of Administration."
5. REMOVED: `hca_online` ("Online materials and resources from HCA")
6. `admin_knowhow` → "Guidance and resources for The Model of Admin Know-How Award Program."

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-884-01 | "Personnel Potential Analysis..." visible | E2E: verify text | ✅ Pass |
| AC-884-03 | "HCA Management System implementation..." visible | E2E: verify text | ✅ Pass |
| AC-884-04 | "Publications available from HCA Press." visible | E2E: verify text | ✅ Pass |
| AC-884-05 | "Degree programs offered by the Hubbard College..." visible | E2E: verify text | ✅ Pass |
| AC-884-06 | "Online materials and resources..." NOT visible (removed) | E2E: verify NOT present | ✅ Pass |
| AC-884-07 | "...Model of Admin Know-How Award Program." (with "Award") | E2E: verify text contains "Award" | ✅ Pass |
| AC-ADJ09-07 | "Listing my business..." still present | E2E: verify text | ✅ Pass |
| AC-ADJ09-08 | "Consumer access..." still present | E2E: verify text | ✅ Pass |
| AC-ADJ09-09 | "None of the above." still present | E2E: verify text | ✅ Pass |

---

## Ticket #885 — Email newsletters Mastertech wording (ADJ-10)

**Solicitud:** Cambiar "product and updates" → "products and services."

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-885-01 | Opción muestra "...products and services." (old wording removed) | E2E: verify text + NOT old text | ✅ Pass |

---

## Ticket #886 — Profile Image subtext (ADJ-08)

**Solicitud:** Agregar mensaje de upload + consent note.

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-886-01 | Subtexto "Upload a picture of yourself for your Membership Profile..." | E2E: verify text | ✅ Pass |
| AC-886-02 | "Your images will not be shared or used without your express written consent" | E2E: verify text | ✅ Pass |

---

## Ticket #887 — Year of Birth + Language layout (ADJ-07)

**Solicitud:** Year of Birth más corto, Languages debajo.

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-887-01 | Year of Birth campo NO ocupa ancho completo (48%) | E2E: bounding box width | ✅ Pass |
| AC-887-02 | Preferred Language está debajo de Year of Birth | E2E: bounding box Y comparison | ✅ Pass |

---

## Ticket #888 — Education dropdown changes (ADJ-12)

**Solicitud:** Renombrar 3 opciones + agregar campo "Details" required (excepto High School/No Diploma).

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-888-01 | "High School Diploma / Equivalent" visible (antes: ".../ GED") | E2E: verify option text | ✅ Pass |
| AC-888-02 | "High School Diploma / GED" NO existe | E2E: verify NOT present | ✅ Pass |
| AC-888-03 | "Professional Certification" visible (antes: "Professional Degree") | E2E: verify option text | ✅ Pass |
| AC-888-04 | "Professional Degree" NO existe | E2E: verify NOT present | ✅ Pass |
| AC-888-05 | "Professional Development Certification" visible (antes: "Certification Training") | E2E: verify option text | ✅ Pass |
| AC-888-06 | "Certification Training" NO existe | E2E: verify NOT present | ✅ Pass |
| AC-888-07 | Seleccionar "Doctorate" → campo Details aparece | E2E: select + verify visible | ✅ Pass |
| AC-888-08 | Campo Details es required (submit sin llenar → error) | E2E: submit → verify error | 🔲 Pendiente (full flow) |
| AC-888-09 | "High School Diploma / Equivalent" → Details NO aparece | E2E: select + verify hidden | ✅ Pass |
| AC-888-10 | "No High School Diploma" → Details NO aparece | E2E: select + verify hidden | ✅ Pass |
| AC-888-11 | Se puede llenar Details y submit exitosamente | E2E: fill + submit | ✅ Pass (full-enrollment-v4) |

---

## Ticket #889 — Preferred Language: English first (ADJ-03)

**Solicitud:** Form 2: Preferred Language - Make "English" top of the list

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-889-01 | Primera opción seleccionable del dropdown Preferred Language es "English" | E2E: verify first option text | 🔲 Pendiente |
| AC-889-02 | Las demás opciones siguen en orden alfabético después de English | E2E: verify sort order | 🔲 Pendiente |
| AC-889-03 | Se puede seleccionar "English" como preferred language y submit | E2E: select + submit | 🔲 Pendiente |

---

## Ticket #890 — Secondary Language: English first (ADJ-03)

**Solicitud:** Form 2: Secondary Language - Make "English" top of the list

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-890-01 | Primera opción seleccionable del dropdown Secondary Language es "English" | E2E: verify first option text | 🔲 Pendiente |
| AC-890-02 | Las demás opciones siguen en orden alfabético después de English | E2E: verify sort order | 🔲 Pendiente |
| AC-890-03 | Se puede seleccionar "English" como secondary language y submit | E2E: select + submit | 🔲 Pendiente |

---

## Ticket #894 — Personal Address field order (ADJ-14)

**Solicitud:** Personal Address order debe coincidir con Billing/Shipping: Street → City → Zip → Country → State.

| ID | Criterio | Método | Estado |
|----|----------|--------|--------|
| AC-894-01 | Street Address está primero (Y más bajo) | E2E: bounding box Y order | ✅ Pass |
| AC-894-02 | City está ANTES de Country | E2E: bounding box comparison | ✅ Pass |
| AC-894-03 | ZIP está ANTES de Country | E2E: bounding box comparison | ✅ Pass |
| AC-894-04 | Country es el último campo (Y más alto) | E2E: bounding box comparison | ✅ Pass |

---

## Resumen General

| Ticket | Total ACs | ✅ Pass | 🔲 Pendiente | Categoría |
|--------|-----------|---------|-------------|-----------|
| #874 (Phone Type) | 11 | 11 | 0 | UI + CRM |
| #875 (Position) | 4 | 4 | 0 | UI + CRM |
| #877 (Industry Other) | 5 | 4 | 1 | UI + Functional |
| #878 (Company Size) | 4 | 4 | 0 | UI + CRM |
| #879 (Company Website) | 10 | 8 | 2 | UI + Functional |
| #880 (Company Founded) | 2 | 2 | 0 | Layout |
| #881 (Additional Phone) | 5 | 5 | 0 | UI |
| #883 (Prosperity/HCA) | 9 | 9 | 0 | UI + Layout |
| #884 (Interests) | 9 | 9 | 0 | UI + CRM |
| #885 (Newsletters) | 1 | 1 | 0 | UI + CRM |
| #886 (Profile Image) | 2 | 2 | 0 | UI |
| #887 (Year of Birth) | 2 | 2 | 0 | Layout |
| #888 (Education) | 11 | 10 | 1 | UI + Functional |
| #889 (Preferred Lang) | 3 | 0 | 3 | UI |
| #890 (Secondary Lang) | 3 | 0 | 3 | UI |
| #894 (Personal Address) | 4 | 4 | 0 | Layout |
| **Total** | **85** | **75** | **10** | |

---

## Automated Specs

| Spec | Tests | Status |
|------|-------|--------|
| `phone-type-validation.spec.ts` | 14 | ✅ All pass |
| `details-labels-v2.spec.ts` | 57 | ✅ All pass |

---

## Notas Técnicas

### POM Update (2026-06-17)
El developer movió `company-size-select` fuera de `industry-size-section` y lo colocó directamente bajo `registration-form`. El POM y todas las factories/specs se actualizaron para reflejar esta nueva estructura DOM.

### Items pendientes (full-flow validation)
Los ACs marcados como 🔲 requieren un flujo completo (Form 1 → Form 2 → Submit → Plan) para validar que el formulario se envía correctamente con los nuevos campos. Se cubren parcialmente por el spec `full-enrollment-v4` existente.
