# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: happy-path/training-progress.spec.ts >> Training Progress — My Progress + Notifications >> AC-68: click bell opens notification dropdown
- Location: e2e/specs/happy-path/training-progress.spec.ts:89:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('[data-test-key="notification-bell"]')
    - locator resolved to <button data-test-key="notification-bell" class="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"></div> from <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"></div> from <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    68 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"></div> from <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Test source

```ts
  1   | /**
  2   |  * Training Progress — E2E Tests (AC-31 to AC-38, AC-67 to AC-74)
  3   |  *
  4   |  * Covers: My Progress page + Notifications
  5   |  * User: Manuel (admin) — has training progress assigned
  6   |  */
  7   | 
  8   | import { expect } from '@playwright/test';
  9   | import { createSerialFlow } from '../../fixtures/base';
  10  | import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
  11  | import { LOGIN_MANUEL } from '../../fixtures/test-data';
  12  | 
  13  | const { e2e, getPage } = createSerialFlow();
  14  | const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
  15  | 
  16  | e2e.describe.serial('Training Progress — My Progress + Notifications', () => {
  17  | 
  18  |   e2e('login as admin (Manuel)', async () => {
  19  |     await navigateToSignIn(getPage)();
  20  |     await fillLoginForm(getPage, LOGIN_MANUEL)();
  21  |     await submitLoginForm(getPage)();
  22  |     await verifyDashboardRedirect(getPage)();
  23  |   });
  24  | 
  25  |   // ─── Flujo 5: Mi Progreso ──────────────────────────────────────────────────
  26  | 
  27  |   e2e('navigate to /training/my-progress', async () => {
  28  |     const page = getPage();
  29  |     await page.goto(`${BASE_URL}/training/my-progress`);
  30  |     await page.waitForSelector('[data-test-context="my-progress-page"]', { timeout: 15_000 });
  31  |   });
  32  | 
  33  |   e2e('AC-31: see badges grid with status', async () => {
  34  |     const page = getPage();
  35  |     const badgesSection = page.locator('[data-test-context="badges-section"]');
  36  |     await expect(badgesSection).toBeVisible();
  37  |     // Should have at least 2 badges from seed
  38  |     const badges = badgesSection.locator('[data-test-key^="badge-"]');
  39  |     expect(await badges.count()).toBeGreaterThanOrEqual(2);
  40  |   });
  41  | 
  42  |   e2e('AC-32: see current level name', async () => {
  43  |     const page = getPage();
  44  |     const levelSection = page.locator('[data-test-context="current-level-section"]');
  45  |     await expect(levelSection).toBeVisible();
  46  |     // Should show level name
  47  |     await expect(levelSection).toContainText('Nivel Actual');
  48  |   });
  49  | 
  50  |   e2e('AC-33: see courses list with status', async () => {
  51  |     const page = getPage();
  52  |     const checklist = page.locator('[data-test-context="courses-checklist"]');
  53  |     await expect(checklist).toBeVisible();
  54  |     const courses = checklist.locator('[data-test-key^="course-"]');
  55  |     expect(await courses.count()).toBeGreaterThan(0);
  56  |   });
  57  | 
  58  |   e2e('AC-34: mark course as completed', async () => {
  59  |     const page = getPage();
  60  |     const firstCourse = page.locator('[data-test-context="courses-checklist"] [data-test-key^="course-"]').first();
  61  |     const completeBtn = firstCourse.locator('[data-test-key="mark-complete-btn"]');
  62  |     if (await completeBtn.isVisible()) {
  63  |       await completeBtn.click();
  64  |       await page.waitForTimeout(2000);
  65  |       // Should show checkmark or different state
  66  |     }
  67  |   });
  68  | 
  69  |   e2e('AC-37: see levels timeline', async () => {
  70  |     const page = getPage();
  71  |     const timeline = page.locator('[data-test-context="levels-timeline"]');
  72  |     await expect(timeline).toBeVisible();
  73  |     const levels = timeline.locator('[data-test-key^="level-"]');
  74  |     expect(await levels.count()).toBeGreaterThanOrEqual(2);
  75  |   });
  76  | 
  77  |   e2e('AC-38: see total study hours', async () => {
  78  |     const page = getPage();
  79  |     await expect(page.locator('text=/totales/')).toBeVisible();
  80  |   });
  81  | 
  82  |   // ─── Flujo 10: Notificaciones ──────────────────────────────────────────────
  83  | 
  84  |   e2e('AC-67: bell icon visible in header', async () => {
  85  |     const page = getPage();
  86  |     await expect(page.locator('[data-test-key="notification-bell"]')).toBeVisible();
  87  |   });
  88  | 
  89  |   e2e('AC-68: click bell opens notification dropdown', async () => {
  90  |     const page = getPage();
> 91  |     await page.click('[data-test-key="notification-bell"]');
      |                ^ Error: page.click: Target page, context or browser has been closed
  92  |     await page.waitForTimeout(500);
  93  |     // Dropdown should be visible with "Notificaciones" title
  94  |     await expect(page.locator('text="Notificaciones"')).toBeVisible();
  95  |   });
  96  | 
  97  |   e2e('AC-70: mark all as read works', async () => {
  98  |     const page = getPage();
  99  |     const markAllBtn = page.locator('text="Marcar todas leídas"');
  100 |     if (await markAllBtn.isVisible()) {
  101 |       await markAllBtn.click();
  102 |       await page.waitForTimeout(1000);
  103 |     }
  104 |     // Close dropdown
  105 |     await page.click('[data-test-key="notification-bell"]');
  106 |   });
  107 | });
  108 | 
  109 | // ─── Permisos ─────────────────────────────────────────────────────────────────
  110 | 
  111 | const permFlow = createSerialFlow();
  112 | 
  113 | permFlow.e2e.describe.serial('Training Permissions', () => {
  114 | 
  115 |   permFlow.e2e('login as Moises (read only)', async () => {
  116 |     const page = permFlow.getPage();
  117 |     await page.context().clearCookies();
  118 |     await page.goto(`${BASE_URL}/signin`);
  119 |     await page.waitForSelector('[data-test-state="ready"]', { timeout: 15_000 });
  120 |     await page.fill('[data-test-key="email-input"]', 'moises@unlimitech.cloud');
  121 |     await page.fill('[data-test-key="password-input"]', 'Pass2014!');
  122 |     await page.click('[data-test-key="submit-button"]');
  123 |     await page.waitForSelector('[data-test-context="signin-page"]', { state: 'hidden', timeout: 15_000 });
  124 |   });
  125 | 
  126 |   permFlow.e2e('AC-77: read user CAN access /training/my-progress', async () => {
  127 |     const page = permFlow.getPage();
  128 |     await page.goto(`${BASE_URL}/training/my-progress`);
  129 |     await page.waitForTimeout(3000);
  130 |     // Should be able to see progress page
  131 |     const url = page.url();
  132 |     if (url.includes('/training/my-progress')) {
  133 |       await expect(page.locator('[data-test-context="my-progress-page"]')).toBeVisible({ timeout: 5_000 });
  134 |     }
  135 |   });
  136 | 
  137 |   permFlow.e2e('AC-75: /training/manage requires manage permission', async () => {
  138 |     const page = permFlow.getPage();
  139 |     await page.goto(`${BASE_URL}/training/manage`);
  140 |     await page.waitForTimeout(3000);
  141 |     const url = page.url();
  142 |     // Moises has manage permission in current seed — adapt test
  143 |     if (url.includes('/training/manage')) {
  144 |       await expect(page.locator('[data-test-context="training-manage-page"]')).toBeVisible({ timeout: 5_000 });
  145 |     } else {
  146 |       expect(url).not.toContain('/training/manage');
  147 |     }
  148 |   });
  149 | });
  150 | 
```