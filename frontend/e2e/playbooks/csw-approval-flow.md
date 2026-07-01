# Playbook: CSW Full Approval Flow (3 Levels with Rejection)

Source: Manual analysis of CSWForm.tsx, CSWList.tsx, CSWView.tsx + backend approval chain

## Pre-conditions
- Backend running on port 9050
- Frontend running on port 5173
- E2E Test Developer exists in División 4 (Infraestructura)
- Approval chain for Div 4: Moises (L1) → Manuel (L2) → Laura (L3)
- All users have password: Pass2014!

## Sequence — Phase 1: Developer Creates Request

### Step 1: Login as Developer
- **URL:** `/signin`
- **Credentials:** greatly-hide@emxeecta.mailosaur.net / Pass2014!
- **Verify:** Redirect to dashboard

### Step 2: Navigate to My Requests
- **URL:** `/csw/my-requests`
- **Verify:** Page loads with "Mis Solicitudes CSW" title

### Step 3: Click "Crear Solicitud"
- **Selector:** `[data-test-key="create-button"]`
- **Action:** click
- **Verify:** Form loads at `/csw/new`

### Step 4: Fill Category
- **Selector:** `[data-test-key="category-select"]`
- **Action:** click + search "Permiso" + select
- **Verify:** Category shows "Permiso" selected

### Step 5: Fill Situation
- **Selector:** `[data-test-key="situation-textarea"]` (textarea name="situation")
- **Action:** fill
- **Value:** (test data CSW_PERMISO.situation)
- **Verify:** Word count updates

### Step 6: Fill Information
- **Selector:** `[data-test-key="information-textarea"]` (textarea name="information")
- **Action:** fill
- **Value:** (test data CSW_PERMISO.information)

### Step 7: Fill Solution
- **Selector:** `[data-test-key="solution-textarea"]` (textarea name="solution")
- **Action:** fill
- **Value:** (test data CSW_PERMISO.solution)

### Step 8: Submit
- **Selector:** `[data-test-key="submit-button"]`
- **Action:** click
- **Verify:** Redirect to `/csw/my-requests`, CSW in list with status "Pendiente"

---

## Sequence — Phase 2: Moises Approves Level 1

### Step 9: Login as Moises
- **Credentials:** moises@unlimitech.cloud / Pass2014!

### Step 10: Navigate to Pending
- **URL:** `/csw/pending`
- **Verify:** CSW appears in pending list

### Step 11: Open CSW
- **Action:** Click "Ver detalles" on the CSW row
- **Verify:** View page loads with approval chain visible

### Step 12: Approve Level 1
- **Selector:** Comments textarea + Approve button
- **Action:** Fill comment + click Approve
- **Value:** (APPROVAL_MOISES.comments)
- **Verify:** Level 1 shows "Aprobado", progress 1/3

---

## Sequence — Phase 3: Manuel Rejects Level 2

### Step 13-15: Login as Manuel → Open pending CSW → Reject
- **Credentials:** admin@unlimitech.cloud / Pass2014!
- **Action:** Fill mandatory comment + click Reject
- **Value:** (REJECTION_MANUEL.comments)
- **Verify:** Status changes to "Rechazada"

---

## Sequence — Phase 4: Developer Edits and Resubmits

### Step 16: Login as Developer, verify rejected
- **Verify:** CSW shows "Rechazada" in my-requests

### Step 17: Click Edit
- **Verify:** Form loads with rejection banner (red, shows Manuel's reason)

### Step 18: Modify and Resubmit
- **Action:** Click "Actualizar Solicitud"
- **Verify:** Status back to "Pendiente", approval chain reset to 0/3

---

## Sequence — Phase 5-7: Full Approval (Moises → Manuel → Laura)

### Steps 19-26: Sequential approval at each level
- Each approver: login → navigate to pending → open → approve with comment
- **Verify after Laura approves:** Status = "Aprobada", progress 3/3

---

## Post-conditions
- CSW is fully approved (status: approved)
- History shows: created → submitted → level 1 approved → level 2 rejected → edited → resubmitted → level 1 approved → level 2 approved → level 3 approved
- All comments are recorded in the approval chain

---

## Confirmed Patterns

### SearchableSelect
- Click the container → type text in the search input → click matching option
- Debounce 300ms on search

### Approval Chain Reset
- When a rejected CSW is edited and resubmitted, ALL levels reset to "pending"
- currentLevel goes back to 1
- Previous approvals are cleared

### Mandatory Comments on Reject
- Server validates: reject without comments returns 400
- Frontend should show error if comments are empty on reject

### Session Management
- Each user login clears cookies first (context.clearCookies())
- Navigate to /signin, fill, submit, wait for redirect
- Then navigate to the target page
