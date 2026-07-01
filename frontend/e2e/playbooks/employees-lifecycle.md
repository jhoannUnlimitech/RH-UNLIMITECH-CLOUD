# Playbook: Employees Lifecycle (CRUD + Login + Force Password)

Source: Manual analysis of EmployeesList.tsx, EmployeeFormModal.tsx, ViewEmployeeModal.tsx

## Pre-conditions
- Backend running on port 9050
- Frontend running on port 5173
- Admin user (Moises or Manuel) with employees:create/update/delete permissions
- Division 4 (Infraestructura) exists

## Sequence — Create Employee

### Step 1: Login as admin (Moises)
- **Credentials:** moises@unlimitech.cloud / Pass2014!
- **Verify:** Redirect to dashboard

### Step 2: Navigate to /employees
- **Verify:** Page loads with "Empleados" title, table visible

### Step 3: Click "Crear Empleado"
- **Selector:** `[data-test-key="create-employee-button"]`
- **Verify:** Modal opens with title "Crear Empleado"

### Step 4: Fill form
- **Name:** `[data-test-key="name-input"]` → "QA Test Employee"
- **Email:** `[data-test-key="email-input"]` → "qa-employee-{ts}@emxeecta.mailosaur.net"
- **Password:** Click `[data-test-key="generate-password-button"]` OR fill manually "TestPass2024!"
- **Phone:** `[data-test-key="phone-input"]` → "+573109876543"
- **National ID:** `[data-test-key="national-id-input"]` → "1234567890"
- **Nationality:** `[data-test-key="nationality-select"]` → search "Colombia" → select
- **Birth Date:** `[data-test-key="birth-date-input"]` → "1990-05-15"
- **Hat:** `[data-test-key="hat-select"]` → search "DEVELOPER" → select
- **Division:** `[data-test-key="division-select"]` → search "Infraestructura" → select
- **Force Password:** `[data-test-key="force-password-checkbox"]` → verify checked (default)

### Step 5: Submit
- **Selector:** `[data-test-key="modal-submit-button"]`
- **Verify:** Modal closes, toast "Empleado creado exitosamente"

### Step 6: Search and verify in table
- **Selector:** `[data-test-key="search-input"]` → fill "QA Test Employee"
- **Verify:** Row appears with name, email, hat, division, status "Activo"

---

## Sequence — View Employee

### Step 7: Click "Ver"
- **Selector:** Row `[data-test-key="view-button"]`
- **Verify:** View modal opens with all data matching step 4

### Step 8: Verify data in view modal
- Name: "QA Test Employee"
- Email: matches created email
- Phone: "+573109876543"
- Hat: "DEVELOPER"
- Division: "Infraestructura"
- National ID: "1234567890"
- Nationality: "Colombia"
- Status: "Activo"

### Step 9: Close view modal
- **Selector:** `[data-test-key="view-close-button"]`

---

## Sequence — Edit Employee

### Step 10: Click "Editar"
- **Selector:** Row `[data-test-key="edit-button"]`
- **Verify:** Edit modal opens with data pre-filled

### Step 11: Modify phone
- **Selector:** `[data-test-key="phone-input"]` → clear → fill "+573001112222"
- **Submit:** `[data-test-key="modal-submit-button"]`
- **Verify:** Modal closes, toast "actualizado"

### Step 12: Verify change in table/view
- Search again → open view → phone shows "+573001112222"

---

## Sequence — Suspend Employee

### Step 13: Click "Suspender"
- **Selector:** Row `[data-test-key="suspend-button"]`
- **Verify:** Status badge changes to "Inactivo" (red)

### Step 14: Verify suspended user cannot login
- Clear session → navigate to /signin
- Fill email/password of suspended employee
- **Verify:** Error message (account inactive or invalid credentials)

### Step 15: Reactivate
- Login as admin again
- Navigate to /employees, search employee
- Click "Activar" button
- **Verify:** Status back to "Activo"

---

## Sequence — Login Created Employee

### Step 16: Login with created employee
- **Credentials:** qa-employee-{ts}@emxeecta.mailosaur.net / TestPass2024!
- **Verify:** Redirects to `/change-password` (forcePasswordChange=true)

### Step 17: Change password
- Fill current: "TestPass2024!"
- Fill new: "NewSecurePass2024!"
- Fill confirm: "NewSecurePass2024!"
- Submit
- **Verify:** Redirects to dashboard `/`

### Step 18: Verify profile
- Navigate to /profile
- **Verify:** Name "QA Test Employee", Division "Infraestructura"

---

## Sequence — Delete Employee

### Step 19: Login as admin
- Navigate to /employees, search "QA Test Employee"

### Step 20: Click "Eliminar"
- **Selector:** Row `[data-test-key="delete-button"]`
- **Verify:** Confirmation modal with employee name

### Step 21: Confirm
- **Selector:** `[data-test-key="delete-confirm-button"]`
- **Verify:** Employee disappears from table, toast "eliminado"

---

## Confirmed Patterns

### SearchableSelect for Hat/Division/Nationality
- Click container → type in search input → click matching option
- Same pattern as CSW category select

### Toggle Status (Suspend/Activate)
- Single button that changes label based on current status
- May trigger a confirm dialog or immediate action

### Force Password Change Flow
- Employee created with forcePasswordChange=true (default)
- On first login → ProtectedRoute redirects to /change-password
- After successful change → forcePasswordChange=false → dashboard access

### Soft Delete
- DELETE endpoint soft-deletes (deleted=true)
- Employee disappears from normal list queries
- Cannot delete own account (backend validates)
