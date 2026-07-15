/**
 * Library Editor Dual — E2E Tests
 *
 * Covers: AC-36 to AC-40 (Editor visual/markdown toggle, content persistence)
 * User: Manuel (admin)
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

e2e.describe.serial('Library Editor Dual — Visual/Markdown Toggle', () => {

  e2e('login as admin', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  e2e('navigate to new document form', async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library/documents/new`);
    await page.waitForSelector('[data-test-context="document-form-page"]', { timeout: 15_000 });
    // Select article type to show editor
    await page.selectOption('[data-test-key="type-select"]', 'article');
  });

  e2e('AC-36: editor visual shows toolbar (loaded)', async () => {
    const page = getPage();
    // Wait for Quill to load (lazy)
    await page.waitForSelector('[data-test-context="visual-editor"]', { timeout: 15_000 });
    // Toolbar should be present
    await expect(page.locator('.ql-toolbar')).toBeVisible();
    // Bold, italic, list buttons should exist
    await expect(page.locator('.ql-bold')).toBeVisible();
    await expect(page.locator('.ql-italic')).toBeVisible();
  });

  e2e('AC-37: switch toggle changes to markdown mode', async () => {
    const page = getPage();
    // Click markdown label to switch
    await page.locator('[data-test-key="markdown-label"]').click();
    await page.waitForTimeout(500);
    // Visual editor should be hidden
    await expect(page.locator('[data-test-context="visual-editor"]')).not.toBeVisible();
    // Markdown editor should be visible
    await expect(page.locator('[data-test-context="markdown-editor"]')).toBeVisible();
  });

  e2e('AC-38: markdown mode shows textarea + preview side by side', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-key="markdown-textarea"]')).toBeVisible();
    await expect(page.locator('[data-test-key="markdown-preview"]')).toBeVisible();
  });

  e2e('AC-38b: typing in textarea updates preview', async () => {
    const page = getPage();
    await page.fill('[data-test-key="markdown-textarea"]', '# Título de Prueba\n\nPárrafo de ejemplo.');
    await page.waitForTimeout(300);
    const preview = page.locator('[data-test-key="markdown-preview"]');
    await expect(preview).toContainText('Título de Prueba');
    await expect(preview).toContainText('Párrafo de ejemplo');
  });

  e2e('AC-37b: switch back to visual mode', async () => {
    const page = getPage();
    await page.locator('[data-test-key="visual-label"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-test-context="visual-editor"]')).toBeVisible();
    await expect(page.locator('[data-test-context="markdown-editor"]')).not.toBeVisible();
  });

  e2e('AC-39: content saves as Markdown (create + verify API)', async () => {
    const page = getPage();
    // Fill required fields
    await page.fill('[data-test-key="title-input"]', 'Editor Test Doc');

    // Switch to markdown and write
    await page.locator('[data-test-key="markdown-label"]').click();
    await page.waitForSelector('[data-test-key="markdown-textarea"]', { timeout: 5_000 });
    await page.fill('[data-test-key="markdown-textarea"]', '# Markdown Content\n\n**Bold text** and _italic_.');

    // Intercept the API call to verify markdown is sent
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('/library/documents') && req.method() === 'POST'),
      page.click('[data-test-key="save-draft-btn"]'),
    ]);

    const body = JSON.parse(request.postData() || '{}');
    expect(body.content).toContain('# Markdown Content');
    expect(body.content).toContain('**Bold text**');

    await page.waitForURL(/\/library\/manage/, { timeout: 10_000 });
  });

  e2e('AC-40: editing existing doc loads content in editor', async () => {
    const page = getPage();
    // Navigate to edit the doc we just created
    await page.goto(`${BASE_URL}/library/documents/edit/editor-test-doc`);
    await page.waitForSelector('[data-test-key="title-input"]', { timeout: 10_000 });
    await expect(page.locator('[data-test-key="title-input"]')).toHaveValue('Editor Test Doc');

    // Switch to markdown to see the content
    await page.locator('[data-test-key="markdown-label"]').click();
    await page.waitForTimeout(1000);
    const textarea = page.locator('[data-test-key="markdown-textarea"]');
    await expect(textarea).toContainText('Markdown Content');
  });

  // Cleanup
  e2e('cleanup: delete test document via API', async () => {
    const page = getPage();
    // Go back to manage and delete
    await page.goto(`${BASE_URL}/library/manage`);
    await page.waitForSelector('[data-test-context="library-manage-page"]', { timeout: 15_000 });
    const card = page.locator('[data-test-key="doc-editor-test-doc"]');
    if (await card.isVisible()) {
      await card.hover();
      page.on('dialog', d => d.accept());
      await card.locator('[data-test-key="delete-btn"]').click();
      await page.waitForTimeout(1000);
    }
  });
});
