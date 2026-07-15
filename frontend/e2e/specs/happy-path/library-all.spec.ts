/**
 * Library Module — E2E Tests (Phase 1)
 *
 * Covers: Categories CRUD, Documents CRUD, Editor, Search, Pagination, Permissions.
 * Self-contained: uses existing seed data.
 * User: Manuel (admin@unlimitech.cloud) — has all training permissions.
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import {
  navigateToLibraryManage,
  navigateToLibraryCategories,
  navigateToNewDocument,
  createCategory,
  searchCategories,
  filterCategoriesByStatus,
  verifyCategoryInTable,
  verifyCategoryNotInTable,
  createArticleDocument,
  createLinkDocument,
  publishDocument,
  saveDraftDocument,
  searchDocuments,
  filterDocumentsByType,
  switchToListView,
  switchToGridView,
  verifyDocumentVisible,
  verifyDocumentNotVisible,
  clickDocumentCard,
  verifyDocumentFormLoaded,
  clickSidebarCategory,
  verifyPaginationText,
} from '../../factories/library.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('Library Module — Categories & Documents', () => {

  // ─── Login ──────────────────────────────────────────────────────────────────
  e2e('login as admin (Manuel)', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  // ─── Categories Page ────────────────────────────────────────────────────────

  e2e('AC-01: navigate to categories page and see system categories', async () => {
    await navigateToLibraryCategories(getPage)();
    const page = getPage();
    // Should see Cursos and Políticas (isSystem)
    await expect(page.locator('text="Cursos"').first()).toBeVisible();
    await expect(page.locator('text="Políticas"').first()).toBeVisible();
  });

  e2e('AC-02: create a new category', async () => {
    await createCategory(getPage, { name: 'E2E Test Category', description: 'Created by E2E test' })();
    await verifyCategoryInTable(getPage, 'E2E Test Category')();
  });

  e2e('AC-12: search categories by name', async () => {
    const page = getPage();
    await searchCategories(getPage, 'E2E Test')();
    await verifyCategoryInTable(getPage, 'E2E Test Category')();
    // Clear search
    await page.fill('[data-test-key="search-input"]', '');
    await page.waitForTimeout(500);
  });

  e2e('AC-11: filter categories by status', async () => {
    await filterCategoriesByStatus(getPage, 'active')();
    await verifyCategoryInTable(getPage, 'E2E Test Category')();
  });

  e2e('AC-13: show items changes row count', async () => {
    const page = getPage();
    await page.selectOption('[data-test-key="items-per-page"]', '5');
    await page.waitForTimeout(300);
    const rows = page.locator('[data-test-key^="category-row-"]');
    const count = await rows.count();
    expect(count).toBeLessThanOrEqual(5);
  });

  // ─── Library Manage Page ────────────────────────────────────────────────────

  e2e('AC-28: navigate to manage page and see documents in grid', async () => {
    await navigateToLibraryManage(getPage)();
    const page = getPage();
    await expect(page.locator('[data-test-context="documents-grid"]')).toBeVisible({ timeout: 10_000 });
  });

  e2e('AC-31: pagination shows "Mostrando X a Y de Z"', async () => {
    const page = getPage();
    await expect(page.locator('text=/Mostrando/')).toBeVisible();
  });

  e2e('AC-26: search documents by title (debounce 400ms)', async () => {
    await searchDocuments(getPage, 'TypeScript')();
    await verifyDocumentVisible(getPage, 'Introducción a TypeScript')();
    // Clear
    const page = getPage();
    await page.fill('[data-test-key="search-input"]', '');
    await page.waitForTimeout(500);
  });

  e2e('AC-27: filter documents by type (Link)', async () => {
    await filterDocumentsByType(getPage, 'link')();
    await verifyDocumentVisible(getPage, 'Curso React Avanzado')();
    // Reset
    await filterDocumentsByType(getPage, '')();
  });

  e2e('AC-29: switch to list view shows table', async () => {
    await switchToListView(getPage)();
    const page = getPage();
    await expect(page.locator('[data-test-context="documents-table"]')).toBeVisible();
  });

  e2e('AC-30: switch back to grid view shows cards', async () => {
    await switchToGridView(getPage)();
    const page = getPage();
    await expect(page.locator('[data-test-context="documents-grid"]')).toBeVisible();
  });

  e2e('AC-32: selecting parent category shows sub-category docs', async () => {
    await clickSidebarCategory(getPage, 'Cursos')();
    const page = getPage();
    // Should see docs from Nivel 1 and Nivel 2 sub-categories
    await expect(page.locator('text="Introducción a TypeScript"').first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('reset to all categories', async () => {
    const page = getPage();
    await page.click('[data-test-key="all-categories-btn"]');
    await page.waitForTimeout(500);
  });

  // ─── Document CRUD ──────────────────────────────────────────────────────────

  e2e('AC-17: create article document', async () => {
    await navigateToNewDocument(getPage)();
    await createArticleDocument(getPage, {
      title: 'E2E Test Article',
      description: 'Created by automated test',
      content: '# E2E Test\n\nThis is a test document.\n\n- Item 1\n- Item 2',
      tags: ['e2e', 'test'],
    })();
    await publishDocument(getPage)();
    // Should redirect to manage page
    await verifyDocumentVisible(getPage, 'E2E Test Article')();
  });

  e2e('AC-18: create link document', async () => {
    await navigateToNewDocument(getPage)();
    await createLinkDocument(getPage, {
      title: 'E2E Test Link',
      description: 'External link test',
      link: 'https://playwright.dev',
      tags: ['e2e', 'link'],
    })();
    await publishDocument(getPage)();
    await verifyDocumentVisible(getPage, 'E2E Test Link')();
  });

  e2e('AC-20: click document card loads edit form with data', async () => {
    await clickDocumentCard(getPage, 'e2e-test-article')();
    await verifyDocumentFormLoaded(getPage, 'E2E Test Article')();
  });

  e2e('AC-40: editor shows existing content when editing', async () => {
    const page = getPage();
    // Switch to markdown to verify content
    await page.locator('[data-test-key="markdown-label"]').click();
    await page.waitForTimeout(500);
    const textarea = page.locator('[data-test-key="markdown-textarea"]');
    await expect(textarea).toContainText('E2E Test');
  });

  e2e('AC-21: edit and save creates new version', async () => {
    const page = getPage();
    const textarea = page.locator('[data-test-key="markdown-textarea"]');
    await textarea.fill('# E2E Test Updated\n\nVersion 2 content.');
    await page.click('[data-test-key="save-draft-btn"]');
    await page.waitForURL(/\/library\/manage/, { timeout: 10_000 });
  });

  // ─── Editor Dual ────────────────────────────────────────────────────────────

  e2e('AC-36/37: editor toggle between visual and markdown', async () => {
    await navigateToNewDocument(getPage)();
    const page = getPage();
    // Should start in visual mode
    await expect(page.locator('[data-test-context="visual-editor"]')).toBeVisible({ timeout: 10_000 });
    // Switch to markdown
    await page.locator('[data-test-key="markdown-label"]').click();
    await expect(page.locator('[data-test-context="markdown-editor"]')).toBeVisible();
    // Switch back to visual
    await page.locator('[data-test-key="visual-label"]').click();
    await expect(page.locator('[data-test-context="visual-editor"]')).toBeVisible();
  });

  e2e('AC-38: markdown mode shows textarea + preview', async () => {
    const page = getPage();
    await page.locator('[data-test-key="markdown-label"]').click();
    await expect(page.locator('[data-test-key="markdown-textarea"]')).toBeVisible();
    await expect(page.locator('[data-test-key="markdown-preview"]')).toBeVisible();
  });

  // ─── Permissions ────────────────────────────────────────────────────────────

  e2e('AC-56: Training section visible in sidebar', async () => {
    const page = getPage();
    await expect(page.locator('text="Training"').first()).toBeVisible();
  });

  e2e('AC-57: admin items visible (Gestión Biblioteca)', async () => {
    const page = getPage();
    await expect(page.locator('text="Gestión Biblioteca"').first()).toBeVisible();
  });
});

// ─── Permissions test: employee without create ────────────────────────────────

const flow2 = createSerialFlow();

flow2.e2e.describe.serial('Library Permissions — Read-only user', () => {
  flow2.e2e('login as Moises (read-only training)', async () => {
    const page = flow2.getPage();
    await page.context().clearCookies();
    await page.goto('http://localhost:5173/signin');
    await page.waitForSelector('[data-test-state="ready"]', { timeout: 15_000 });
    await page.fill('[data-test-key="email-input"]', 'moises@unlimitech.cloud');
    await page.fill('[data-test-key="password-input"]', 'Pass2014!');
    await page.click('[data-test-key="submit-button"]');
    await page.waitForURL(/^\/$|\/dashboard/, { timeout: 15_000 });
  });

  flow2.e2e('AC-58: read-only user cannot access /library/manage', async () => {
    const page = flow2.getPage();
    await page.goto('http://localhost:5173/library/manage');
    await page.waitForTimeout(2000);
    // Should redirect away or show unauthorized
    const url = page.url();
    // If PermissionRoute redirects, user won't be on /library/manage
    expect(url).not.toContain('/library/manage');
  });
});
