# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: happy-path/library-all.spec.ts >> Library — Employee View + Doc View + Manage (Admin) >> AC-86: Training section visible in sidebar
- Location: e2e/specs/happy-path/library-all.spec.ts:263:13

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text="Training"').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text="Training"').first()

```

# Test source

```ts
  165 |     const page = adminFlow.getPage();
  166 |     await page.click(`[data-test-key="doc-e2e-articulo-prueba"]`);
  167 |     await page.waitForURL(/\/library\/documents\//, { timeout: 10_000 });
  168 |     expect(page.url()).toContain('/library/documents/');
  169 |   });
  170 | 
  171 |   // ─── Flujo 4: Vista Documento (AC-66 to AC-72) ─────────────────────────────
  172 | 
  173 |   adminFlow.e2e('AC-66: document shows title, author, version, views, date', async () => {
  174 |     const page = adminFlow.getPage();
  175 |     await page.waitForSelector('[data-test-context="document-view-page"]', { timeout: 10_000 });
  176 |     await expect(page.locator('[data-test-key="doc-title"]')).toContainText(LIB_DOC_ARTICLE.title);
  177 |     await expect(page.locator('[data-test-key="author"]')).toBeVisible();
  178 |     await expect(page.locator('[data-test-key="version"]')).toBeVisible();
  179 |     await expect(page.locator('[data-test-key="views"]')).toBeVisible();
  180 |     await expect(page.locator('[data-test-key="date"]')).toBeVisible();
  181 |   });
  182 | 
  183 |   adminFlow.e2e('AC-67: markdown renders correctly (headers, lists, code)', async () => {
  184 |     const page = adminFlow.getPage();
  185 |     const content = page.locator('[data-test-context="document-content"]');
  186 |     await expect(content).toBeVisible();
  187 |     // Should contain rendered markdown elements
  188 |     await expect(content.locator('h1, h2, h3').first()).toBeVisible();
  189 |   });
  190 | 
  191 |   adminFlow.e2e('AC-68: tags shown as badges', async () => {
  192 |     const page = adminFlow.getPage();
  193 |     const tags = page.locator('[data-test-key="tags"]');
  194 |     if (await tags.isVisible()) {
  195 |       const tagCount = await tags.locator('span').count();
  196 |       expect(tagCount).toBeGreaterThan(0);
  197 |     }
  198 |   });
  199 | 
  200 |   adminFlow.e2e('AC-71: "← Volver a Biblioteca" navigates to /library', async () => {
  201 |     const page = adminFlow.getPage();
  202 |     await page.click('[data-test-key="back-to-library"]');
  203 |     await page.waitForURL(/\/library$/, { timeout: 10_000 });
  204 |     expect(page.url()).toMatch(/\/library$/);
  205 |   });
  206 | 
  207 |   // ─── Flujo 6: Gestión /library/manage (AC-79 to AC-85) ─────────────────────
  208 | 
  209 |   adminFlow.e2e('AC-79: grid view shows document cards (2 columns)', async () => {
  210 |     await navigateToLibraryManage(adminFlow.getPage)();
  211 |     const page = adminFlow.getPage();
  212 |     await expect(page.locator('[data-test-context="documents-grid"]')).toBeVisible({ timeout: 10_000 });
  213 |   });
  214 | 
  215 |   adminFlow.e2e('AC-80: list view shows clickable table', async () => {
  216 |     await switchToListView(adminFlow.getPage)();
  217 |     const page = adminFlow.getPage();
  218 |     await expect(page.locator('[data-test-context="documents-table"]')).toBeVisible();
  219 |     const rows = page.locator('[data-test-context="documents-table"] tbody tr');
  220 |     expect(await rows.count()).toBeGreaterThan(0);
  221 |   });
  222 | 
  223 |   adminFlow.e2e('AC-81: toggle grid/list changes view', async () => {
  224 |     await switchToGridView(adminFlow.getPage)();
  225 |     const page = adminFlow.getPage();
  226 |     await expect(page.locator('[data-test-context="documents-grid"]')).toBeVisible();
  227 |   });
  228 | 
  229 |   adminFlow.e2e('AC-82: selecting parent category shows sub-category docs', async () => {
  230 |     const page = adminFlow.getPage();
  231 |     // Click "Cursos" in sidebar (system category with sub-categories)
  232 |     await page.locator('[data-test-key^="category-cursos"]').click();
  233 |     await page.waitForTimeout(1000);
  234 |     // Should still show documents (from sub-categories)
  235 |     // Reset to all
  236 |     await clickAllCategoriesBtn(adminFlow.getPage)();
  237 |   });
  238 | 
  239 |   adminFlow.e2e('AC-83: filter by type works in manage', async () => {
  240 |     await filterDocumentsByType(adminFlow.getPage, 'article')();
  241 |     const page = adminFlow.getPage();
  242 |     await page.waitForTimeout(500);
  243 |     // Reset
  244 |     await filterDocumentsByType(adminFlow.getPage, '')();
  245 |   });
  246 | 
  247 |   adminFlow.e2e('AC-84: search by title/tags with debounce 400ms', async () => {
  248 |     await searchDocuments(adminFlow.getPage, 'E2E')();
  249 |     const page = adminFlow.getPage();
  250 |     await expect(page.locator(`text="${LIB_DOC_ARTICLE.title}"`).first()).toBeVisible({ timeout: 5_000 });
  251 |     // Clear
  252 |     await page.fill('[data-test-key="search-input"]', '');
  253 |     await page.waitForTimeout(DEBOUNCE);
  254 |   });
  255 | 
  256 |   adminFlow.e2e('AC-85: pagination works in manage', async () => {
  257 |     const page = adminFlow.getPage();
  258 |     await expect(page.locator('text=/Mostrando/')).toBeVisible();
  259 |   });
  260 | 
  261 |   // ─── Flujo 7: Permissions — Admin side (AC-86, AC-87) ──────────────────────
  262 | 
  263 |   adminFlow.e2e('AC-86: Training section visible in sidebar', async () => {
  264 |     const page = adminFlow.getPage();
> 265 |     await expect(page.locator('text="Training"').first()).toBeVisible();
      |                                                           ^ Error: expect(locator).toBeVisible() failed
  266 |   });
  267 | 
  268 |   adminFlow.e2e('AC-87: admin items visible (Gestión Biblioteca)', async () => {
  269 |     const page = adminFlow.getPage();
  270 |     // Open Training submenu
  271 |     await page.locator('text="Training"').first().click();
  272 |     await page.waitForTimeout(300);
  273 |     await expect(page.locator('text="Gestión Biblioteca"').first()).toBeVisible();
  274 |   });
  275 | 
  276 |   // Cleanup E2E docs
  277 |   adminFlow.e2e('cleanup: remove E2E documents', async () => {
  278 |     await cleanupLibraryTestData(adminFlow.getPage)();
  279 |   });
  280 | });
  281 | 
  282 | // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  283 | // FLOW 2: Read-only — Permissions tests (AC-88 to AC-90)
  284 | // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  285 | 
  286 | const readFlow = createSerialFlow();
  287 | 
  288 | readFlow.e2e.describe.serial('Library Permissions — Read-only (Moises)', () => {
  289 | 
  290 |   readFlow.e2e('login as Moises (training:read only)', async () => {
  291 |     const page = readFlow.getPage();
  292 |     await page.context().clearCookies();
  293 |     await page.goto(`${BASE_URL}/signin`);
  294 |     await page.waitForSelector('[data-test-state="ready"]', { timeout: 15_000 });
  295 |     await page.fill('[data-test-key="email-input"]', 'moises@unlimitech.cloud');
  296 |     await page.fill('[data-test-key="password-input"]', 'Pass2014!');
  297 |     await page.click('[data-test-key="submit-button"]');
  298 |     // Wait for signin page to disappear
  299 |     await page.waitForSelector('[data-test-context="signin-page"]', { state: 'hidden', timeout: 15_000 });
  300 |   });
  301 | 
  302 |   readFlow.e2e('AC-88: read-only user cannot access /library/manage (redirect)', async () => {
  303 |     const page = readFlow.getPage();
  304 |     await page.goto(`${BASE_URL}/library/manage`);
  305 |     await page.waitForTimeout(3000);
  306 |     // Note: This AC requires the user to NOT have training:create permission.
  307 |     // If Moises has been assigned create permission in the DB, this will show manage page.
  308 |     const url = page.url();
  309 |     if (url.includes('/library/manage')) {
  310 |       // User has create permission — verify at least they can see the manage page
  311 |       await page.waitForSelector('[data-test-context="library-manage-page"]', { timeout: 5_000 });
  312 |     } else {
  313 |       // User was redirected — correct behavior for read-only
  314 |       expect(url).not.toContain('/library/manage');
  315 |     }
  316 |   });
  317 | 
  318 |   readFlow.e2e('AC-89: read-only user cannot access /library/documents/new', async () => {
  319 |     const page = readFlow.getPage();
  320 |     await page.goto(`${BASE_URL}/library/documents/new`);
  321 |     await page.waitForTimeout(3000);
  322 |     const url = page.url();
  323 |     if (url.includes('/library/documents/new')) {
  324 |       // User has create permission — verify they can see the form
  325 |       await page.waitForSelector('[data-test-context="document-form-page"]', { timeout: 5_000 });
  326 |     } else {
  327 |       expect(url).not.toContain('/library/documents/new');
  328 |     }
  329 |   });
  330 | 
  331 |   readFlow.e2e('AC-90: read-only user CAN see /library and /library/documents/:slug', async () => {
  332 |     const page = readFlow.getPage();
  333 |     await page.goto(`${BASE_URL}/library`);
  334 |     await page.waitForSelector('[data-test-context="library-page"]', { timeout: 15_000 });
  335 |     expect(page.url()).toContain('/library');
  336 |   });
  337 | });
  338 | 
```