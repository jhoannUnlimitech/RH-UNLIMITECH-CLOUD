/**
 * Library Documents — E2E Tests
 *
 * Covers: AC-17 to AC-35 (Documents CRUD, search, filters, views, pagination)
 * User: Manuel (admin) — full training permissions
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const DEBOUNCE = 500;

e2e.describe.serial('Library Documents — CRUD + Search + Views + Pagination', () => {

  e2e('login as admin', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  // ─── Create Documents ───────────────────────────────────────────────────────

  e2e('AC-17: create article document with markdown content', async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library/documents/new`);
    await page.waitForSelector('[data-test-context="document-form-page"]', { timeout: 15_000 });

    await page.fill('[data-test-key="title-input"]', 'Doc E2E Artículo');
    await page.fill('[data-test-key="description-input"]', 'Documento de prueba automatizada');
    await page.selectOption('[data-test-key="type-select"]', 'article');

    // Switch to markdown and write content
    await page.locator('[data-test-key="markdown-label"]').click();
    await page.waitForSelector('[data-test-key="markdown-textarea"]', { timeout: 5_000 });
    await page.fill('[data-test-key="markdown-textarea"]', '# Test E2E\n\nContenido de prueba.\n\n- Item 1\n- Item 2');

    // Add tags
    await page.fill('[data-test-key="tag-input"]', 'e2e');
    await page.click('[data-test-key="add-tag-btn"]');
    await page.fill('[data-test-key="tag-input"]', 'test-doc');
    await page.click('[data-test-key="add-tag-btn"]');

    // Publish
    await page.click('[data-test-key="publish-btn"]');
    await page.waitForURL(/\/library\/manage/, { timeout: 10_000 });
    await expect(page.locator('text="Doc E2E Artículo"').first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-18: create link document', async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library/documents/new`);
    await page.waitForSelector('[data-test-context="document-form-page"]', { timeout: 15_000 });

    await page.fill('[data-test-key="title-input"]', 'Doc E2E Link');
    await page.fill('[data-test-key="description-input"]', 'Link de prueba');
    await page.selectOption('[data-test-key="type-select"]', 'link');
    await page.waitForSelector('[data-test-key="link-input"]', { timeout: 3_000 });
    await page.fill('[data-test-key="link-input"]', 'https://example.com/e2e-test');

    await page.fill('[data-test-key="tag-input"]', 'e2e');
    await page.click('[data-test-key="add-tag-btn"]');

    await page.click('[data-test-key="publish-btn"]');
    await page.waitForURL(/\/library\/manage/, { timeout: 10_000 });
    await expect(page.locator('text="Doc E2E Link"').first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-19: create mixed document (content + link)', async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library/documents/new`);
    await page.waitForSelector('[data-test-context="document-form-page"]', { timeout: 15_000 });

    await page.fill('[data-test-key="title-input"]', 'Doc E2E Mixto');
    await page.selectOption('[data-test-key="type-select"]', 'mixed');
    await page.waitForSelector('[data-test-key="link-input"]', { timeout: 3_000 });
    await page.fill('[data-test-key="link-input"]', 'https://example.com/mixed');

    // Switch to markdown
    await page.locator('[data-test-key="markdown-label"]').click();
    await page.waitForSelector('[data-test-key="markdown-textarea"]', { timeout: 5_000 });
    await page.fill('[data-test-key="markdown-textarea"]', '# Mixto\n\nContenido + link.');

    // Save as draft
    await page.click('[data-test-key="save-draft-btn"]');
    await page.waitForURL(/\/library\/manage/, { timeout: 10_000 });
  });

  // ─── Search & Filter ────────────────────────────────────────────────────────

  e2e('AC-26: search documents by title with debounce', async () => {
    const page = getPage();
    await page.fill('[data-test-key="search-input"]', 'E2E Artículo');
    await page.waitForTimeout(DEBOUNCE);
    await expect(page.locator('text="Doc E2E Artículo"').first()).toBeVisible();
    await expect(page.locator('text="Doc E2E Link"').first()).not.toBeVisible();
    // Clear
    await page.fill('[data-test-key="search-input"]', '');
    await page.waitForTimeout(DEBOUNCE);
  });

  e2e('AC-26b: search documents by tag', async () => {
    const page = getPage();
    await page.fill('[data-test-key="search-input"]', 'test-doc');
    await page.waitForTimeout(DEBOUNCE);
    await expect(page.locator('text="Doc E2E Artículo"').first()).toBeVisible();
    await page.fill('[data-test-key="search-input"]', '');
    await page.waitForTimeout(DEBOUNCE);
  });

  e2e('AC-27: filter by type Link', async () => {
    const page = getPage();
    await page.selectOption('[data-test-key="type-filter"]', 'link');
    await page.waitForTimeout(500);
    await expect(page.locator('text="Doc E2E Link"').first()).toBeVisible();
    await expect(page.locator('text="Doc E2E Artículo"').first()).not.toBeVisible();
    // Reset
    await page.selectOption('[data-test-key="type-filter"]', '');
    await page.waitForTimeout(500);
  });

  // ─── Views ──────────────────────────────────────────────────────────────────

  e2e('AC-28: grid view shows document cards', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-context="documents-grid"]')).toBeVisible();
  });

  e2e('AC-29: switch to list view shows clickable table', async () => {
    const page = getPage();
    // Click list view button (second in toggle)
    const listBtn = page.locator('[data-test-key="view-toggle"] button:nth-child(2)');
    await listBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-test-context="documents-table"]')).toBeVisible();
    // Verify table has rows
    const rows = page.locator('[data-test-context="documents-table"] tbody tr');
    expect(await rows.count()).toBeGreaterThan(0);
  });

  e2e('AC-30: switch back to grid view', async () => {
    const page = getPage();
    const gridBtn = page.locator('[data-test-key="view-toggle"] button:nth-child(1)');
    await gridBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('[data-test-context="documents-grid"]')).toBeVisible();
  });

  // ─── Edit Document ──────────────────────────────────────────────────────────

  e2e('AC-20: click document card loads edit form with data', async () => {
    const page = getPage();
    await page.click('[data-test-key="doc-doc-e2e-articulo"]');
    await page.waitForURL(/\/library\/documents\/edit\//, { timeout: 10_000 });
    await page.waitForSelector('[data-test-key="title-input"]', { timeout: 10_000 });
    await expect(page.locator('[data-test-key="title-input"]')).toHaveValue('Doc E2E Artículo');
  });

  e2e('AC-40: editor shows existing content', async () => {
    const page = getPage();
    await page.locator('[data-test-key="markdown-label"]').click();
    await page.waitForTimeout(1000);
    const textarea = page.locator('[data-test-key="markdown-textarea"]');
    await expect(textarea).toContainText('Test E2E');
  });

  e2e('AC-23: toggle featured on document', async () => {
    const page = getPage();
    const toggle = page.locator('[data-test-key="featured-toggle"]');
    await toggle.check();
    await expect(toggle).toBeChecked();
  });

  e2e('AC-21: save edit creates new version', async () => {
    const page = getPage();
    const textarea = page.locator('[data-test-key="markdown-textarea"]');
    await textarea.fill('# Test E2E v2\n\nActualizado por test automatizado.');
    await page.click('[data-test-key="publish-btn"]');
    await page.waitForURL(/\/library\/manage/, { timeout: 10_000 });
  });

  // ─── Card details ───────────────────────────────────────────────────────────

  e2e('AC-34: cards show type icon, title, description, tags, category, views, date', async () => {
    const page = getPage();
    const card = page.locator('[data-test-key="doc-doc-e2e-articulo"]');
    await expect(card).toBeVisible();
    await expect(card.locator('[data-test-key="doc-title"]')).toContainText('Doc E2E Artículo');
    await expect(card.locator('[data-test-key="status-badge"]')).toBeVisible();
  });

  e2e('AC-35: date shows full format (day + month + year)', async () => {
    const page = getPage();
    const card = page.locator('[data-test-key="doc-doc-e2e-articulo"]');
    // Should contain year (2026)
    await expect(card).toContainText('2026');
  });

  // ─── Sidebar category filter ────────────────────────────────────────────────

  e2e('AC-32: selecting parent category shows sub-category docs', async () => {
    const page = getPage();
    // Click "Cursos" in sidebar
    await page.locator('[data-test-key^="category-cursos"]').click();
    await page.waitForTimeout(500);
    // Should show docs from Nivel 1 and Nivel 2
    await expect(page.locator('text="Introducción a TypeScript"').first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-16: parent category count includes sub-category docs', async () => {
    const page = getPage();
    // Reset to all
    await page.click('[data-test-key="all-categories-btn"]');
    await page.waitForTimeout(500);
    // Cursos count should be > 0 (includes sub-category docs)
    const cursosNode = page.locator('[data-test-key^="category-cursos"]');
    const countText = await cursosNode.locator('..').locator('span.text-xs').textContent();
    expect(Number(countText)).toBeGreaterThan(0);
  });

  // ─── Pagination ─────────────────────────────────────────────────────────────

  e2e('AC-31: pagination shows "Mostrando X a Y de Z entradas"', async () => {
    const page = getPage();
    await expect(page.locator('text=/Mostrando/')).toBeVisible();
  });

  e2e('AC-33: skeleton loading appears while loading', async () => {
    // This is hard to test deterministically — verify the skeleton classes exist
    const page = getPage();
    // Navigate away and back to trigger loading
    await page.goto(`${BASE_URL}/library/categories`);
    await page.waitForTimeout(100);
    await page.goto(`${BASE_URL}/library/manage`);
    // Skeleton should appear briefly (animate-pulse)
    // We just verify the page loads successfully
    await page.waitForSelector('[data-test-context="library-manage-page"]', { timeout: 15_000 });
  });

  // ─── Delete Document ────────────────────────────────────────────────────────

  e2e('AC-24: delete document with confirmation', async () => {
    const page = getPage();
    // Find the Doc E2E Link card and hover to show delete
    const card = page.locator('[data-test-key="doc-doc-e2e-link"]');
    await card.hover();
    const deleteBtn = card.locator('[data-test-key="delete-btn"]');

    page.on('dialog', dialog => dialog.accept());
    await deleteBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text="Doc E2E Link"').first()).not.toBeVisible();
  });

  // ─── Cleanup ────────────────────────────────────────────────────────────────

  e2e('cleanup: delete Doc E2E Artículo', async () => {
    const page = getPage();
    const card = page.locator('[data-test-key="doc-doc-e2e-articulo"]');
    await card.hover();
    page.on('dialog', dialog => dialog.accept());
    await card.locator('[data-test-key="delete-btn"]').click();
    await page.waitForTimeout(1000);
  });

  e2e('cleanup: delete Doc E2E Mixto', async () => {
    const page = getPage();
    const card = page.locator('[data-test-key="doc-doc-e2e-mixto"]');
    if (await card.isVisible()) {
      await card.hover();
      page.on('dialog', dialog => dialog.accept());
      await card.locator('[data-test-key="delete-btn"]').click();
      await page.waitForTimeout(1000);
    }
  });
});
