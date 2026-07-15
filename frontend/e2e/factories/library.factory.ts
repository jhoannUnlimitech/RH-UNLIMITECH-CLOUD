/**
 * Library Factory — Interaction logic for Library module E2E tests.
 *
 * Covers: Categories CRUD, Documents CRUD, Editor, Search, Pagination.
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/library.pom';

// ─── Selectors ──────────────────────────────────────────────────────────────

const sel = {
  // Manage page
  managePage:        pom.library_manage_page.$(),
  sidebar:           pom.library_manage_page._.categories_sidebar.$(),
  manageBtn:         pom.library_manage_page._.categories_sidebar._.manage_categories_btn.$(),
  allCategoriesBtn:  pom.library_manage_page._.categories_sidebar._.all_categories_btn.$(),
  docsPanel:         pom.library_manage_page._.documents_panel.$(),
  createDocBtn:      pom.library_manage_page._.documents_panel._.create_document_btn.$(),
  searchInput:       pom.library_manage_page._.documents_panel._.documents_filters._.search_input.$(),
  typeFilter:        pom.library_manage_page._.documents_panel._.documents_filters._.type_filter.$(),
  viewToggle:        pom.library_manage_page._.documents_panel._.documents_filters._.view_toggle.$(),
  docsGrid:          pom.library_manage_page._.documents_panel._.documents_grid.$(),
  docsTable:         pom.library_manage_page._.documents_panel._.documents_table.$(),
  emptyState:        pom.library_manage_page._.documents_panel._.empty_state.$(),

  // Categories page
  catPage:           pom.library_categories_page.$(),
  createCatBtn:      pom.library_categories_page._.create_category_btn.$(),
  catSearch:         pom.library_categories_page._.categories_filters._.search_input.$(),
  catStatusFilter:   pom.library_categories_page._.categories_filters._.status_filter.$(),
  catItemsPerPage:   pom.library_categories_page._.categories_filters._.items_per_page.$(),
  catTable:          pom.library_categories_page._.categories_table.$(),

  // Category modal
  catModal:          pom.category_form_modal.$(),
  catNameInput:      pom.category_form_modal._.name_input.$(),
  catDescInput:      pom.category_form_modal._.description_input.$(),
  catColorInput:     pom.category_form_modal._.color_input.$(),
  catParentSelect:   pom.category_form_modal._.parent_select.$(),
  catCancelBtn:      pom.category_form_modal._.cancel_btn.$(),
  catSubmitBtn:      pom.category_form_modal._.submit_btn.$(),

  // Document form
  docForm:           pom.document_form_page.$(),
  docTitle:          pom.document_form_page._.title_field._.title_input.$(),
  docDesc:           pom.document_form_page._.description_field._.description_input.$(),
  docCategory:       pom.document_form_page._.category_field._.category_select.$(),
  docType:           pom.document_form_page._.type_field._.type_select.$(),
  docTagInput:       pom.document_form_page._.tags_field._.tag_input.$(),
  docAddTag:         pom.document_form_page._.tags_field._.add_tag_btn.$(),
  docFeatured:       pom.document_form_page._.featured_field._.featured_toggle.$(),
  docLink:           pom.document_form_page._.link_field._.link_input.$(),
  docMdTextarea:     pom.document_form_page._.content_field._.document_editor._.markdown_editor._.markdown_textarea.$(),
  docCancelBtn:      pom.document_form_page._.form_actions._.cancel_btn.$(),
  docSaveDraft:      pom.document_form_page._.form_actions._.save_draft_btn.$(),
  docPublishBtn:     pom.document_form_page._.form_actions._.publish_btn.$(),
};

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const DEBOUNCE_WAIT = 500; // 400ms debounce + 100ms buffer

// ─── Navigation ─────────────────────────────────────────────────────────────

export function navigateToLibraryManage(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library/manage`);
    await page.waitForSelector(sel.managePage, { timeout: 15_000 });
  };
}

export function navigateToLibraryCategories(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library/categories`);
    await page.waitForSelector(sel.catPage, { timeout: 15_000 });
  };
}

export function navigateToNewDocument(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library/documents/new`);
    await page.waitForSelector(sel.docForm, { timeout: 15_000 });
  };
}

// ─── Categories ─────────────────────────────────────────────────────────────

export function createCategory(getPage: () => Page, data: { name: string; description?: string }) {
  return async () => {
    const page = getPage();
    await page.click(sel.createCatBtn);
    await page.waitForSelector(sel.catModal, { timeout: 5_000 });
    await page.fill(sel.catNameInput, data.name);
    if (data.description) await page.fill(sel.catDescInput, data.description);
    await page.click(sel.catSubmitBtn);
    // Wait for modal to close
    await page.waitForSelector(sel.catModal, { state: 'hidden', timeout: 5_000 });
  };
}

export function searchCategories(getPage: () => Page, query: string) {
  return async () => {
    const page = getPage();
    await page.fill(sel.catSearch, query);
    await page.waitForTimeout(DEBOUNCE_WAIT);
  };
}

export function filterCategoriesByStatus(getPage: () => Page, status: 'all' | 'active' | 'inactive') {
  return async () => {
    const page = getPage();
    await page.selectOption(sel.catStatusFilter, status);
    await page.waitForTimeout(300);
  };
}

export function verifyCategoryInTable(getPage: () => Page, categoryName: string) {
  return async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key^="category-row-"]`, { hasText: categoryName });
    await expect(row).toBeVisible({ timeout: 5_000 });
  };
}

export function verifyCategoryNotInTable(getPage: () => Page, categoryName: string) {
  return async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key^="category-row-"]`, { hasText: categoryName });
    await expect(row).not.toBeVisible();
  };
}

// ─── Documents ──────────────────────────────────────────────────────────────

export function createArticleDocument(getPage: () => Page, data: {
  title: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
}) {
  return async () => {
    const page = getPage();
    await page.fill(sel.docTitle, data.title);
    if (data.description) await page.fill(sel.docDesc, data.description);
    if (data.category) await page.selectOption(sel.docCategory, { label: data.category });
    await page.selectOption(sel.docType, 'article');

    // Switch to markdown mode and type content
    await page.locator('[data-test-key="markdown-label"]').click();
    await page.waitForSelector(sel.docMdTextarea, { timeout: 5_000 });
    await page.fill(sel.docMdTextarea, data.content);

    // Tags
    if (data.tags) {
      for (const tag of data.tags) {
        await page.fill(sel.docTagInput, tag);
        await page.click(sel.docAddTag);
      }
    }

    // Featured
    if (data.featured) {
      await page.check(sel.docFeatured);
    }
  };
}

export function createLinkDocument(getPage: () => Page, data: {
  title: string;
  description?: string;
  link: string;
  category?: string;
  tags?: string[];
}) {
  return async () => {
    const page = getPage();
    await page.fill(sel.docTitle, data.title);
    if (data.description) await page.fill(sel.docDesc, data.description);
    if (data.category) await page.selectOption(sel.docCategory, { label: data.category });
    await page.selectOption(sel.docType, 'link');
    await page.waitForSelector(sel.docLink, { timeout: 3_000 });
    await page.fill(sel.docLink, data.link);

    if (data.tags) {
      for (const tag of data.tags) {
        await page.fill(sel.docTagInput, tag);
        await page.click(sel.docAddTag);
      }
    }
  };
}

export function publishDocument(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.click(sel.docPublishBtn);
    await page.waitForURL(/\/library\/manage/, { timeout: 10_000 });
  };
}

export function saveDraftDocument(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.click(sel.docSaveDraft);
    await page.waitForURL(/\/library\/manage/, { timeout: 10_000 });
  };
}

export function searchDocuments(getPage: () => Page, query: string) {
  return async () => {
    const page = getPage();
    await page.fill(sel.searchInput, query);
    await page.waitForTimeout(DEBOUNCE_WAIT); // debounce 400ms + buffer
  };
}

export function filterDocumentsByType(getPage: () => Page, type: string) {
  return async () => {
    const page = getPage();
    await page.selectOption(sel.typeFilter, type);
    await page.waitForTimeout(300);
  };
}

export function switchToListView(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // Click second button in view toggle (list icon)
    const listBtn = page.locator(`${sel.viewToggle} button:nth-child(2)`);
    await listBtn.click();
    await page.waitForSelector(sel.docsTable, { timeout: 5_000 });
  };
}

export function switchToGridView(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const gridBtn = page.locator(`${sel.viewToggle} button:nth-child(1)`);
    await gridBtn.click();
    await page.waitForSelector(sel.docsGrid, { timeout: 5_000 });
  };
}

export function verifyDocumentVisible(getPage: () => Page, title: string) {
  return async () => {
    const page = getPage();
    await expect(page.locator(`text="${title}"`).first()).toBeVisible({ timeout: 5_000 });
  };
}

export function verifyDocumentNotVisible(getPage: () => Page, title: string) {
  return async () => {
    const page = getPage();
    await expect(page.locator(`text="${title}"`).first()).not.toBeVisible();
  };
}

export function clickDocumentCard(getPage: () => Page, slug: string) {
  return async () => {
    const page = getPage();
    await page.click(`[data-test-key="doc-${slug}"]`);
    await page.waitForURL(/\/library\/documents\/edit\//, { timeout: 10_000 });
  };
}

export function verifyDocumentFormLoaded(getPage: () => Page, expectedTitle: string) {
  return async () => {
    const page = getPage();
    const titleInput = page.locator(sel.docTitle);
    await expect(titleInput).toHaveValue(expectedTitle, { timeout: 10_000 });
  };
}

// ─── Sidebar Categories ─────────────────────────────────────────────────────

export function clickSidebarCategory(getPage: () => Page, categoryName: string) {
  return async () => {
    const page = getPage();
    await page.click(`[data-test-key^="category-"] >> text="${categoryName}"`);
    await page.waitForTimeout(500);
  };
}

export function verifyDocumentCount(getPage: () => Page, expectedCount: number) {
  return async () => {
    const page = getPage();
    const title = page.locator(sel.managePage).locator('[data-test-key="panel-title"]');
    await expect(title).toContainText(`(${expectedCount})`, { timeout: 5_000 });
  };
}

// ─── Pagination ─────────────────────────────────────────────────────────────

export function verifyPaginationText(getPage: () => Page, expectedText: string) {
  return async () => {
    const page = getPage();
    const paginationInfo = page.locator('text=/Mostrando/');
    await expect(paginationInfo).toContainText(expectedText);
  };
}
