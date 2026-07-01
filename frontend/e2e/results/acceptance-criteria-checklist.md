# Acceptance Criteria — Login E2E Tests

## AC-01: Login Page Initial State
- [x] Page title "Iniciar Sesión" is visible
- [x] Email input is visible, empty, and enabled
- [x] Password input is visible, empty, and enabled
- [x] Submit button is visible, enabled, with `data-test-state="ready"`
- [x] No error message is displayed
- [x] Show/hide password toggle is visible
- [x] Forgot password link is visible

## AC-02: Successful Login (Happy Path)
- [x] User can fill email field with valid email
- [x] User can fill password field with valid password
- [x] Clicking submit triggers authentication
- [x] On success, user is redirected to dashboard (`/`)
- [x] Sign-in page is no longer visible after redirect

## AC-03: Failed Login (Invalid Credentials)
- [x] User fills email and incorrect password
- [x] Error message appears with `data-test-state="visible"`
- [x] Error message contains "Credenciales inválidas"
- [x] Form returns to `ready` state

## AC-04: Failed Login (Non-existent User)
- [x] User fills non-existent email and any password
- [x] Error message appears with "Credenciales inválidas"
- [x] Form returns to `ready` state

## AC-05: Password Visibility Toggle
- [x] Password input starts with `type="password"`
- [x] Clicking toggle changes to `type="text"`
- [x] Clicking again changes back to `type="password"`

## AC-06: Data-Test Annotations Present
- [x] All contexts, keys, and states implemented per POM

---

## Status

| AC | Tests | Result |
|----|-------|--------|
| AC-01 | `verifyLoginPageInitialState` | ✅ Pass |
| AC-02 | `fillLoginForm` + `submitLoginForm` + `verifyDashboardRedirect` | ✅ Pass |
| AC-03 | `submitLoginFormExpectingError` (wrong password) | ✅ Pass |
| AC-04 | `submitLoginFormExpectingError` (nonexistent user) | ✅ Pass |
| AC-05 | `verifyPasswordToggle` | ✅ Pass |
| AC-06 | Selector engine unit tests (27 pass) | ✅ Pass |

**Total: 15 E2E + 10 Validation + 27 Unit = 52 tests ✅**
