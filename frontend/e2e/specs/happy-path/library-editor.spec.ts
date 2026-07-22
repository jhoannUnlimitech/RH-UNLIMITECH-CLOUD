/**
 * Library Editor Dual — E2E Tests (AC-73 to AC-78)
 *
 * Covers: Visual editor toolbar, toggle visual↔markdown,
 * textarea+preview side by side, real-time preview, content saved as MD.
 *
 * User: Manuel (admin)
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import { navigateToNewDocument, cleanupLibraryTestData } from '../../factories/library.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

e2e.describe.serial('Library Editor Dual — Visual/Markdown (AC-73 to AC-78)', () => {

  e2e('login as admin', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  e2e('pre-cleanup', async () => {
    await cleanupLibraryTestData(getPage)();
  });

  e2e('navigate to new document and select article type', async () => {
    await navigateToNewDocument(getPage)();
    const page = getPage();
    await page.selectOption('[data-test-key="type-select"]', 'article');
    await page.waitForTimeout(500);
  });

  // ─── AC-73: Visual editor toolbar ──────────────────────────────────────────

  e2e('AC-73: visual editor shows toolbar (bold, italic, lists, code)', async () => {
    const page = getPage();
    // Wait for Quill to lazy-load
    await page.waitForSelector('[data-test-context="visual-editor"]', { timeout: 15_000 });
    // Toolbar buttons should be present
    await expect(page.locator('.ql-toolbar')).toBeVisible();
    await expect(page.locator('.ql-bold')).toBeVisible();
    await expect(page.locator('.ql-italic')).toBeVisible();
    await expect(page.locator('.ql-list').first()).toBeVisible();
  });

  // ─── AC-74: Toggle switch ──────────────────────────────────────────────────

  e2e('AC-74: switch toggle changes to markdown mode', async () => {
    const page = getPage();
    // El Switch está dentro de un label entre los dos spans (visual-label y markdown-label)
    // Click en el switch label (el div con la bola que se mueve)
    const switchToggle = page.locator('[data-test-context="editor-mode-toggle"] label');
    await switchToggle.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-test-context="visual-editor"]')).not.toBeVisible();
    await expect(page.locator('[data-test-context="markdown-editor"]')).toBeVisible();
  });

  // ─── AC-75: Textarea + Preview side by side ────────────────────────────────

  e2e('AC-75: markdown mode shows textarea + preview', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-key="markdown-textarea"]')).toBeVisible();
    await expect(page.locator('[data-test-key="markdown-preview"]')).toBeVisible();
  });

  // ─── AC-76: Real-time preview ──────────────────────────────────────────────

  e2e('AC-76: preview updates in real time when typing', async () => {
    const page = getPage();
    await page.fill('[data-test-key="markdown-textarea"]', '# Título de Prueba\n\n**Texto bold** y _italics_.\n\n- Lista item 1\n- Lista item 2');
    await page.waitForTimeout(500);
    const preview = page.locator('[data-test-key="markdown-preview"]');
    await expect(preview).toContainText('Título de Prueba');
    await expect(preview).toContainText('Texto bold');
    await expect(preview).toContainText('Lista item 1');
  });

  // ─── AC-77: Switch back to visual ──────────────────────────────────────────

  e2e('AC-77: switch back to visual mode works', async () => {
    const page = getPage();
    // Click switch again to toggle back to visual
    const switchToggle = page.locator('[data-test-context="editor-mode-toggle"] label');
    await switchToggle.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-test-context="visual-editor"]')).toBeVisible();
    await expect(page.locator('[data-test-context="markdown-editor"]')).not.toBeVisible();
  });

  // ─── AC-78: Content saved as Markdown ──────────────────────────────────────

  e2e('AC-78: content saves as Markdown (verify API payload)', async () => {
    const page = getPage();
    // Fill required fields
    await page.fill('[data-test-key="title-input"]', 'E2E Editor MD Test');

    // Select a category (required)
    await page.waitForTimeout(1500); // wait for categories to load
    await page.selectOption('[data-test-key="category-select"]', { index: 1 });

    // Switch to markdown and write
    await page.locator('[data-test-context="editor-mode-toggle"] label').click();
    await page.waitForSelector('[data-test-key="markdown-textarea"]', { timeout: 5_000 });
    await page.fill('[data-test-key="markdown-textarea"]', '# Markdown Saved\n\n**Bold** content for verification.');

    // Intercept API call to verify markdown is sent
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('/library/documents') && req.method() === 'POST', { timeout: 15_000 }),
      (async () => {
        const btn = page.locator('[data-test-key="save-draft-btn"]');
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
      })(),
    ]);

    const body = JSON.parse(request.postData() || '{}');
    expect(body.content).toContain('# Markdown Saved');
    expect(body.content).toContain('**Bold**');

    await page.waitForURL(/\/library\/manage/, { timeout: 15_000 });
  });

  // ─── AC-43 (also): Editing loads content in editor ─────────────────────────

  e2e('editing existing doc loads content in markdown editor', async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library/documents/edit/e2e-editor-md-test`);
    await page.waitForSelector('[data-test-key="title-input"]', { timeout: 10_000 });
    await expect(page.locator('[data-test-key="title-input"]')).toHaveValue('E2E Editor MD Test');
    // Switch to markdown to see content
    await page.locator('[data-test-context="editor-mode-toggle"] label').click();
    await page.waitForTimeout(1000);
    const textarea = page.locator('[data-test-key="markdown-textarea"]');
    await expect(textarea).toContainText('Markdown Saved');
  });

  // Cleanup
  e2e('cleanup: delete test document', async () => {
    await cleanupLibraryTestData(getPage)();
  });
});
