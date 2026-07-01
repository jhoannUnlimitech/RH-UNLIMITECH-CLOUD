# Playbook: Login Flow

Source: Manual analysis of SignInForm.tsx component

## Pre-conditions
- Frontend running on `http://localhost:5173`
- Backend running on `http://localhost:9050`
- At least one valid user exists (admin@unlimitech.cloud / Pass2014!)
- Browser at the login page (`/signin`)
- No active session (unauthenticated)

## Sequence — Happy Path

### Step 1: Navigate to Login
- **URL:** `/signin`
- **Verify:** Form is visible with `data-test-state="ready"`

### Step 2: Verify Initial State
- **Selector:** `[data-test-context="login-form"][data-test-state="ready"]`
- **Verify:**
  - Page title "Iniciar Sesión" visible
  - Email input empty and enabled
  - Password input empty and enabled
  - Submit button enabled with `data-test-state="ready"`
  - No error message visible
  - Show password toggle visible
  - Forgot password link visible

### Step 3: Fill Email
- **Selector:** `[data-test-key="email-input"]`
- **Action:** fill
- **Value:** `admin@unlimitech.cloud`
- **Verify:** Input has value "admin@unlimitech.cloud"

### Step 4: Fill Password
- **Selector:** `[data-test-key="password-input"]`
- **Action:** fill
- **Value:** `Pass2014!`
- **Verify:** Input has value "Pass2014!"

### Step 5: Submit Form
- **Selector:** `[data-test-key="submit-button"]`
- **Action:** click
- **Verify:** Button transitions to `data-test-state="loading"`, form shows loading state

### Step 6: Verify Redirect
- **Verify:** URL changes to `/` (dashboard)
- **Note:** Timeout 15s for API response + redirect

## Post-conditions
- User is authenticated
- Dashboard page is displayed
- Session token stored (cookie/localStorage)

---

## Sequence — Invalid Credentials

### Step 1: Navigate to Login
- Same as happy path step 1

### Step 2: Fill Email
- **Selector:** `[data-test-key="email-input"]`
- **Action:** fill
- **Value:** `admin@unlimitech.cloud`

### Step 3: Fill Wrong Password
- **Selector:** `[data-test-key="password-input"]`
- **Action:** fill
- **Value:** `WrongPassword123!`

### Step 4: Submit Form
- **Selector:** `[data-test-key="submit-button"]`
- **Action:** click
- **Verify:** Form enters loading state

### Step 5: Verify Error
- **Selector:** `[data-test-key="error-message"][data-test-state="visible"]`
- **Verify:** Error message visible containing "Credenciales inválidas"
- **Verify:** Form returns to `data-test-state="ready"`
- **Verify:** URL remains `/signin` (no redirect)

## Post-conditions
- User remains unauthenticated
- Form is interactive again (can retry)
- Error message is visible

---

## Sequence — Password Toggle

### Step 1: Navigate and fill password
- Same as happy path steps 1-4

### Step 2: Verify initial password type
- **Selector:** `[data-test-key="password-input"]`
- **Verify:** `type="password"` (hidden)

### Step 3: Toggle show password
- **Selector:** `[data-test-key="show-password-toggle"]`
- **Action:** click
- **Verify:** Input `type` changes to `"text"` (visible)

### Step 4: Toggle hide password
- **Selector:** `[data-test-key="show-password-toggle"]`
- **Action:** click
- **Verify:** Input `type` changes back to `"password"` (hidden)

---

## Confirmed Patterns

### Form State Transitions
- `ready` → (click submit) → `loading` → (API response) → `ready` (with or without error)

### Error Display
- Error banner appears with `data-test-state="visible"` only when `authStore.error` is truthy
- Error can be dismissed (clearError button) or disappears on successful retry

### Input Validation
- HTML5 `required` attribute prevents empty submission (browser-native validation)
- Email input has `type="email"` for format validation
