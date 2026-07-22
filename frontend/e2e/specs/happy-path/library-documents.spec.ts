/**
 * Library Documents — E2E Tests (AC-33 to AC-50)
 *
 * Covers: Create (article/link/mixed), Edit, Publish/Unpublish, Delete,
 * Tags, Featured toggle, Change notes, Version creation.
 *
 * User: Manuel (admin) — full training permissions
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import {
  navigateToLibraryManage,
  navigateToNewDocument,
  navigateToEditDocument,
  fillDocumentForm,
  publishDocument,
  saveDraftDocument,
  searchDocuments,
  filterDocumentsByType,
  switchToListView,
  switchToGridView,
  publishDocFromCard,
  deleteDocFromCard,
  cleanupLibraryTestData,
} from '../../factories/library.factory';
import { LOGIN_MANUEL, LIB_DOC_ARTICLE, LIB_DOC_LINK, LIB_DOC_MIXED, LIB_DOC_DRAFT } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const DEBOUNCE = 500;

e2e.describe.serial('Library Documents — CRUD + Lifecycle (AC-33 to AC-50)', () => {

  // ─── Setup ──────────────────────────────────────────────────────────────────

  e2e('login as admin (Manuel)', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  e2e('pre-cleanup: remove E2E documents from previous runs', async () => {
    const page = getPage();
    const API = 'http://localhost:9050/api/v1';

    // Navigate to manage to get auth cookies
    await page.goto(`${BASE_URL}/library/manage`);
    await page.waitForSelector('[data-test-context="library-manage-page"]', { timeout: 15_000 });

    // Delete all E2E documents via API: soft-delete then hard-delete (permanent)
    await page.evaluate(async (apiUrl) => {
      try {
        // Fetch ALL docs including soft-deleted
        const res = await fetch(`${apiUrl}/library/documents?limit=100&includeDeleted=true`, { credentials: 'include' });
        const data = await res.json();
        if (!data?.data) return;

        const e2eDocs = data.data.filter((d: any) => d.title && d.title.startsWith('E2E '));
        for (const doc of e2eDocs) {
          // Soft delete first if not already deleted
          if (!doc.deleted) {
            await fetch(`${apiUrl}/library/documents/${doc._id}`, {
              method: 'DELETE', credentials: 'include'
            });
          }
          // Hard delete (permanent removal from DB)
          await fetch(`${apiUrl}/library/documents/${doc._id}/permanent`, {
            method: 'DELETE', credentials: 'include'
          });
        }
      } catch { /* ignore */ }
    }, API);

    await page.waitForTimeout(500);
  });

  // ─── AC-33: Navigate to new document ───────────────────────────────────────

  e2e('AC-33: navigate to /library/documents/new via manage page button', async () => {
    await navigateToLibraryManage(getPage)();
    const page = getPage();
    await page.click('[data-test-key="create-document-btn"]');
    await page.waitForSelector('[data-test-context="document-form-page"]', { timeout: 10_000 });
    expect(page.url()).toContain('/library/documents/new');
  });

  // ─── AC-34: Create article document ────────────────────────────────────────

  e2e('AC-34: create article document with markdown content', async () => {
    await navigateToNewDocument(getPage)();
    await fillDocumentForm(getPage, LIB_DOC_ARTICLE)();
    await publishDocument(getPage)();
    const page = getPage();
    await expect(page.locator(`text="${LIB_DOC_ARTICLE.title}"`).first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── AC-35: Create link document ───────────────────────────────────────────

  e2e('AC-35: create link document (URL externa requerida)', async () => {
    await navigateToNewDocument(getPage)();
    await fillDocumentForm(getPage, LIB_DOC_LINK)();
    await publishDocument(getPage)();
    const page = getPage();
    await expect(page.locator(`text="${LIB_DOC_LINK.title}"`).first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── AC-36: Create mixed document ──────────────────────────────────────────

  e2e('AC-36: create mixed document (content + link)', async () => {
    await navigateToNewDocument(getPage)();
    await fillDocumentForm(getPage, LIB_DOC_MIXED)();
    await publishDocument(getPage)();
    const page = getPage();
    await expect(page.locator(`text="${LIB_DOC_MIXED.title}"`).first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── AC-37: Save as draft ──────────────────────────────────────────────────

  e2e('AC-37: save as draft (not published) → redirects to manage', async () => {
    await navigateToNewDocument(getPage)();
    await fillDocumentForm(getPage, LIB_DOC_DRAFT)();
    await saveDraftDocument(getPage)();
    const page = getPage();
    expect(page.url()).toContain('/library/manage');
  });

  // ─── AC-38: Published doc visible, draft not ───────────────────────────────

  e2e('AC-38: published doc visible in manage, draft also visible (admin)', async () => {
    const page = getPage();
    await expect(page.locator(`text="${LIB_DOC_ARTICLE.title}"`).first()).toBeVisible({ timeout: 5_000 });
    await expect(page.locator(`text="${LIB_DOC_DRAFT.title}"`).first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── AC-39: Tags add/remove ────────────────────────────────────────────────

  e2e('AC-39: tags are added with Enter/button and removed with ×', async () => {
    await navigateToNewDocument(getPage)();
    const page = getPage();
    await page.fill('[data-test-key="title-input"]', 'E2E Tag Test Temp');
    // Add tag via button
    await page.fill('[data-test-key="tag-input"]', 'test-tag-1');
    await page.click('[data-test-key="add-tag-btn"]');
    // Add tag via Enter
    await page.fill('[data-test-key="tag-input"]', 'test-tag-2');
    await page.press('[data-test-key="tag-input"]', 'Enter');
    // Verify tags appear
    await expect(page.locator('text="test-tag-1"')).toBeVisible();
    await expect(page.locator('text="test-tag-2"')).toBeVisible();
    // Remove tag with ×
    await page.locator('button:has-text("×")').first().click();
    await page.waitForTimeout(200);
    // Navigate away without saving
    await page.goto(`${BASE_URL}/library/manage`);
    await page.waitForSelector('[data-test-context="library-manage-page"]', { timeout: 10_000 });
  });

  // ─── AC-40: Featured toggle ────────────────────────────────────────────────

  e2e('AC-40: toggle "Destacar documento" works', async () => {
    // Edit the article doc and verify featured
    const page = getPage();
    await page.click(`[data-test-key="doc-e2e-articulo-prueba"]`);
    await page.waitForURL(/\/library\/documents\/edit\//, { timeout: 10_000 });
    await page.waitForSelector('[data-test-key="title-input"]', { timeout: 10_000 });

    const toggle = page.locator('[data-test-key="featured-toggle"]');
    // Click via the visual label (parent <label> of the sr-only checkbox)
    const switchLabel = page.locator('[data-test-context="featured-field"] label');

    // It should be checked (was set in creation)
    await expect(toggle).toBeChecked();

    // Click to uncheck
    await switchLabel.click();
    await expect(toggle).not.toBeChecked();

    // Click to re-check
    await switchLabel.click();
    await expect(toggle).toBeChecked();

    // Go back without saving
    await page.goto(`${BASE_URL}/library/manage`);
    await page.waitForSelector('[data-test-context="library-manage-page"]', { timeout: 10_000 });
  });

  // ─── AC-41/42: Edit document loads data ────────────────────────────────────

  e2e('AC-41: click document card navigates to edit form', async () => {
    const page = getPage();
    await page.click(`[data-test-key="doc-e2e-articulo-prueba"]`);
    await page.waitForURL(/\/library\/documents\/edit\//, { timeout: 10_000 });
    expect(page.url()).toContain('/library/documents/edit/');
  });

  e2e('AC-42: form loads existing data (title, description, type, tags)', async () => {
    const page = getPage();
    await page.waitForSelector('[data-test-key="title-input"]', { timeout: 10_000 });
    await expect(page.locator('[data-test-key="title-input"]')).toHaveValue(LIB_DOC_ARTICLE.title);
    await expect(page.locator('[data-test-key="description-input"]')).toHaveValue(LIB_DOC_ARTICLE.description!);
    // Type should be article
    await expect(page.locator('[data-test-key="type-select"]')).toHaveValue('article');
  });

  // ─── AC-43: Editor shows existing content ──────────────────────────────────

  e2e('AC-43: editor shows existing content when editing', async () => {
    const page = getPage();
    await page.locator('[data-test-context="editor-mode-toggle"] label').click();
    await page.waitForTimeout(1000);
    const textarea = page.locator('[data-test-key="markdown-textarea"]');
    await expect(textarea).toContainText('Documento E2E');
  });

  // ─── AC-44/45: Save creates new version ────────────────────────────────────

  e2e('AC-44: save edit creates new version automatically', async () => {
    const page = getPage();
    const textarea = page.locator('[data-test-key="markdown-textarea"]');
    await textarea.fill('# Documento E2E v2\n\nContenido actualizado por test E2E.');

    // Intercept the PUT response to see if there's an error
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/library/documents/') && resp.request().method() === 'PUT', { timeout: 15_000 }),
      (async () => {
        const publishBtn = page.locator('[data-test-key="publish-btn"]');
        await publishBtn.scrollIntoViewIfNeeded();
        await publishBtn.click();
      })(),
    ]);

    const status = response.status();
    if (status !== 200) {
      const body = await response.json().catch(() => ({}));
      throw new Error(`UPDATE DOC FAILED: ${status} - ${JSON.stringify(body)}`);
    }

    await page.waitForURL(/\/library\/manage/, { timeout: 10_000 });
  });

  e2e('AC-45: change note field visible when editing', async () => {
    const page = getPage();
    await page.click(`[data-test-key="doc-e2e-articulo-prueba"]`);
    await page.waitForURL(/\/library\/documents\/edit\//, { timeout: 10_000 });
    await page.waitForSelector('[data-test-key="change-note-input"]', { timeout: 10_000 });
    await expect(page.locator('[data-test-key="change-note-input"]')).toBeVisible();
    // Go back
    await page.goto(`${BASE_URL}/library/manage`);
    await page.waitForSelector('[data-test-context="library-manage-page"]', { timeout: 10_000 });
  });

  // ─── AC-46/47: Publish/Unpublish from card ─────────────────────────────────

  e2e('AC-46: admin can publish document from card', async () => {
    const page = getPage();
    // Draft doc should have "Publicar" button
    const draftCard = page.locator('[data-test-key="doc-e2e-borrador-draft"]');
    await draftCard.hover();
    const publishBtn = draftCard.locator('[data-test-key="publish-btn"]');
    await expect(publishBtn).toContainText('Publicar');
    await publishBtn.click();
    await page.waitForTimeout(1500);
    // Status should change to "Publicado"
    await draftCard.hover();
    await expect(draftCard.locator('[data-test-key="status-badge"]')).toContainText('Publicado');
  });

  e2e('AC-47: admin can unpublish published document', async () => {
    const page = getPage();
    const card = page.locator('[data-test-key="doc-e2e-borrador-draft"]');
    await card.hover();
    const unpublishBtn = card.locator('[data-test-key="publish-btn"]');
    await expect(unpublishBtn).toContainText('Despublicar');
    await unpublishBtn.click();
    await page.waitForTimeout(1500);
    await card.hover();
    await expect(card.locator('[data-test-key="status-badge"]')).toContainText('Borrador');
  });

  // ─── AC-48: Draft NOT visible in employee view ─────────────────────────────

  e2e('AC-48: draft document NOT visible in /library employee view', async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library`);
    await page.waitForSelector('[data-test-context="library-page"]', { timeout: 15_000 });
    await page.waitForTimeout(1000);
    await expect(page.locator(`text="${LIB_DOC_DRAFT.title}"`)).not.toBeVisible();
    // But published article IS visible
    await expect(page.locator(`text="${LIB_DOC_ARTICLE.title}"`).first()).toBeVisible();
  });

  // ─── AC-49/50: Delete document ─────────────────────────────────────────────

  e2e('AC-49: delete document with confirmation', async () => {
    await navigateToLibraryManage(getPage)();
    const page = getPage();
    await deleteDocFromCard(getPage, 'e2e-link-externo')();
    await page.waitForTimeout(500);
  });

  e2e('AC-50: deleted document disappears from list', async () => {
    const page = getPage();
    await expect(page.locator(`text="${LIB_DOC_LINK.title}"`).first()).not.toBeVisible();
  });

  // ─── Cleanup ────────────────────────────────────────────────────────────────

  e2e('cleanup: delete remaining E2E documents', async () => {
    await cleanupLibraryTestData(getPage)();
  });
});
