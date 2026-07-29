# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: happy-path/training-manage.spec.ts >> Training Manage — Badges/Levels/Courses UI (AC-01 to AC-16) >> login as admin (Manuel)
- Location: e2e/specs/happy-path/training-manage.spec.ts:55:3

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  locator('[data-test-context="signin-page"]')
Expected: hidden
Received: visible
Timeout:  15000ms

Call log:
  - Expect "toBeHidden" with timeout 15000ms
  - waiting for locator('[data-test-context="signin-page"]')
    34 × locator resolved to <div class="flex flex-col flex-1" data-test-context="signin-page">…</div>
       - unexpected value "visible"

```

```yaml
- heading "Iniciar Sesión" [level=1]
- paragraph: Ingresa tu email y contraseña para acceder al sistema
- text: Error al iniciar sesión
- button:
  - img
- text: Email *
- textbox "admin@rh.com": admin@unlimitech.cloud
- text: Contraseña *
- textbox "Ingresa tu contraseña": Pass2014!
- img
- checkbox
- text: Mantener sesión iniciada
- link "¿Olvidaste tu contraseña?":
  - /url: /reset-password
- button "Iniciar Sesión"
```

# Test source

```ts
  1   | /**
  2   |  * Login Factory — Interaction logic for the Sign In page.
  3   |  *
  4   |  * Provides reusable factories for:
  5   |  * - Navigating to the login page
  6   |  * - Filling the login form
  7   |  * - Submitting the form
  8   |  * - Verifying successful login (redirect to dashboard)
  9   |  * - Verifying error states
  10  |  */
  11  | 
  12  | import { expect, type Page } from '@playwright/test';
  13  | import { pom } from '../pom/signin.pom';
  14  | import type { LoginData, InvalidLoginData } from '../fixtures/test-data';
  15  | 
  16  | // ─── Selectors (derived from POM — evaluated once at module load) ───────────
  17  | 
  18  | const sel = {
  19  |   signinPage:       pom.signin_page.$(),
  20  |   pageTitle:        pom.signin_page._.page_title.$(),
  21  |   formReady:        pom.signin_page._.login_form.ready.$(),
  22  |   formLoading:      pom.signin_page._.login_form.loading.$(),
  23  |   emailInput:       pom.signin_page._.login_form._.login_inputs._.email_input.$(),
  24  |   passwordInput:    pom.signin_page._.login_form._.login_inputs._.password_input.$(),
  25  |   showPasswordToggle: pom.signin_page._.login_form._.login_inputs._.show_password_toggle.$(),
  26  |   forgotPasswordLink: pom.signin_page._.login_form._.login_inputs._.forgot_password_link.$(),
  27  |   submitButton:     pom.signin_page._.login_form._.login_inputs._.submit_button.$(),
  28  |   submitReady:      pom.signin_page._.login_form._.login_inputs._.submit_button.ready.$(),
  29  |   submitLoading:    pom.signin_page._.login_form._.login_inputs._.submit_button.loading.$(),
  30  |   errorMessage:     pom.signin_page._.login_form._.error_message.$(),
  31  |   errorVisible:     pom.signin_page._.login_form._.error_message.visible.$(),
  32  | };
  33  | 
  34  | // ─── Navigation ─────────────────────────────────────────────────────────────
  35  | 
  36  | /**
  37  |  * Navigates to the Sign In page and waits for the form to be ready.
  38  |  */
  39  | export function navigateToSignIn(getPage: () => Page, baseURL?: string) {
  40  |   return async () => {
  41  |     const page = getPage();
  42  |     const url = baseURL || process.env.BASE_URL || 'http://localhost:5173';
  43  | 
  44  |     // Clear cookies to ensure no existing session
  45  |     await page.context().clearCookies();
  46  | 
  47  |     // Navigate to signin page
  48  |     await page.goto(`${url}/signin`);
  49  |     await page.waitForSelector(sel.formReady, { timeout: 15_000 });
  50  |   };
  51  | }
  52  | 
  53  | // ─── Fill Form ──────────────────────────────────────────────────────────────
  54  | 
  55  | /**
  56  |  * Fills the login form with the provided credentials.
  57  |  * Does NOT submit — use submitLoginForm for that.
  58  |  */
  59  | export function fillLoginForm(getPage: () => Page, data: LoginData) {
  60  |   return async () => {
  61  |     const page = getPage();
  62  | 
  63  |     // Wait for form ready
  64  |     await page.waitForSelector(sel.formReady, { timeout: 10_000 });
  65  | 
  66  |     // Fill email
  67  |     const emailInput = page.locator(sel.emailInput);
  68  |     await emailInput.fill(data.email);
  69  |     await expect(emailInput).toHaveValue(data.email);
  70  | 
  71  |     // Fill password
  72  |     const passwordInput = page.locator(sel.passwordInput);
  73  |     await passwordInput.fill(data.password);
  74  |     await expect(passwordInput).toHaveValue(data.password);
  75  |   };
  76  | }
  77  | 
  78  | // ─── Submit Form ────────────────────────────────────────────────────────────
  79  | 
  80  | /**
  81  |  * Clicks the submit button and waits for navigation to dashboard (success).
  82  |  */
  83  | export function submitLoginForm(getPage: () => Page) {
  84  |   return async () => {
  85  |     const page = getPage();
  86  | 
  87  |     const submitBtn = page.locator(sel.submitButton);
  88  |     await expect(submitBtn).toBeEnabled();
  89  |     await submitBtn.click();
  90  | 
  91  |     // Wait for signin page context to disappear (SPA navigated away)
> 92  |     await expect(page.locator(sel.signinPage)).toBeHidden({ timeout: 15_000 });
      |                                                ^ Error: expect(locator).toBeHidden() failed
  93  |   };
  94  | }
  95  | 
  96  | /**
  97  |  * Clicks the submit button expecting an error (invalid credentials).
  98  |  * Verifies the error message appears.
  99  |  */
  100 | export function submitLoginFormExpectingError(getPage: () => Page, data: InvalidLoginData) {
  101 |   return async () => {
  102 |     const page = getPage();
  103 | 
  104 |     const submitBtn = page.locator(sel.submitButton);
  105 |     await expect(submitBtn).toBeEnabled();
  106 |     await submitBtn.click();
  107 | 
  108 |     // Wait for loading state to appear and resolve
  109 |     await page.waitForSelector(sel.formReady, { timeout: 10_000 });
  110 | 
  111 |     // Verify error message appears
  112 |     const errorMsg = page.locator(sel.errorVisible);
  113 |     await expect(errorMsg).toBeVisible({ timeout: 10_000 });
  114 |     await expect(errorMsg).toContainText(data.expectedError);
  115 |   };
  116 | }
  117 | 
  118 | // ─── Verify States ──────────────────────────────────────────────────────────
  119 | 
  120 | /**
  121 |  * Verifies the login page is displayed correctly (initial state).
  122 |  */
  123 | export function verifyLoginPageInitialState(getPage: () => Page) {
  124 |   return async () => {
  125 |     const page = getPage();
  126 | 
  127 |     // Page title visible
  128 |     const title = page.locator(sel.pageTitle);
  129 |     await expect(title).toBeVisible();
  130 |     await expect(title).toContainText('Iniciar Sesión');
  131 | 
  132 |     // Form is ready
  133 |     await expect(page.locator(sel.formReady)).toBeVisible();
  134 | 
  135 |     // Inputs are visible and empty
  136 |     const emailInput = page.locator(sel.emailInput);
  137 |     await expect(emailInput).toBeVisible();
  138 |     await expect(emailInput).toHaveValue('');
  139 | 
  140 |     const passwordInput = page.locator(sel.passwordInput);
  141 |     await expect(passwordInput).toBeVisible();
  142 |     await expect(passwordInput).toHaveValue('');
  143 | 
  144 |     // Submit button ready
  145 |     const submitBtn = page.locator(sel.submitReady);
  146 |     await expect(submitBtn).toBeVisible();
  147 |     await expect(submitBtn).toBeEnabled();
  148 | 
  149 |     // Error message should NOT be visible
  150 |     await expect(page.locator(sel.errorMessage)).not.toBeVisible();
  151 | 
  152 |     // Show password toggle visible
  153 |     await expect(page.locator(sel.showPasswordToggle)).toBeVisible();
  154 | 
  155 |     // Forgot password link visible
  156 |     await expect(page.locator(sel.forgotPasswordLink)).toBeVisible();
  157 |   };
  158 | }
  159 | 
  160 | /**
  161 |  * Verifies that the user landed on the dashboard after successful login.
  162 |  */
  163 | export function verifyDashboardRedirect(getPage: () => Page) {
  164 |   return async () => {
  165 |     const page = getPage();
  166 |     // After successful login, the signin form is gone and we're on the dashboard
  167 |     // Verify the login form is NOT present (we navigated away)
  168 |     await expect(page.locator(sel.signinPage)).not.toBeVisible({ timeout: 5_000 });
  169 |     // Verify URL no longer contains /signin
  170 |     expect(page.url()).not.toContain('/signin');
  171 |   };
  172 | }
  173 | 
  174 | /**
  175 |  * Verifies the show/hide password toggle works correctly.
  176 |  */
  177 | export function verifyPasswordToggle(getPage: () => Page) {
  178 |   return async () => {
  179 |     const page = getPage();
  180 | 
  181 |     const passwordInput = page.locator(sel.passwordInput);
  182 |     const toggle = page.locator(sel.showPasswordToggle);
  183 | 
  184 |     // Initially password is hidden
  185 |     await expect(passwordInput).toHaveAttribute('type', 'password');
  186 | 
  187 |     // Click toggle → password visible
  188 |     await toggle.click();
  189 |     await expect(passwordInput).toHaveAttribute('type', 'text');
  190 | 
  191 |     // Click toggle again → password hidden
  192 |     await toggle.click();
```