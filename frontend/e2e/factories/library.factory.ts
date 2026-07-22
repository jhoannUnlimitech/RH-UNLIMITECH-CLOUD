/**
 * Library Factory — Interaction logic for Library module E2E tests.
 *
 * Covers: Categories CRUD + lifecycle, Documents CRUD, Editor dual,
 * Vista empleado (search, featured, pagination), Manage page (grid/list, sidebar).
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/library.pom';
import type { LibraryCategoryData, LibraryDocumentData } from '../fixtures/test-data';

// ─── Selectors ──────────────────────────────────────────────────────────────

const sel = {
  // Library employee page
  libraryPage:       pom.library_page.$(),
  libSearch:         pom.library_page._.search_input.$(),
  libTypeFilter:     pom.library_page._.type_filter.$(),
  featuredSection:   pom.library_page._.featured_section.$(),
  docsList:          pom.library_page._.documents_list.$(),

  // Manage page
  managePage:        pom.library_manage_page.$(),
  sidebar:           pom.library_manage_page._.categories_sidebar.$(),
  manageBtn:         pom.library_manage_page._.categories_sidebar._.manage_categories_btn.$(),
  allCategoriesBtn:  pom.library_manage_page._.categories_sidebar._.all_categories_btn.$(),
  docsPanel:         pom.library_manage_page._.documents_panel.$(),
  panelTitle:        pom.library_manage_page._.documents_panel._.panel_title.$(),
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

  // Category form modal (modal renders as portal, no wrapper context — use keys directly)
  catNameInput:      '[data-test-key="name-input"]',
  catDescInput:      '[data-test-key="description-input"]',
  catParentSelect:   '[data-test-key="parent-select"]',
  catSubmitBtn:      '[data-test-key="submit-btn"]',
  catCancelBtn:      '[data-test-key="cancel-btn"]',

  // Hard delete modal
  hardDeleteModal:   '[data-test-context="hard-delete-modal"]',
  confirmNameInput:  '[data-test-key="confirm-name-input"]',

  // Document form page
  docForm:           pom.document_form_page.$(),
  docTitle:          pom.document_form_page._.title_field._.title_input.$(),
  docDesc:           pom.document_form_page._.description_field._.description_input.$(),
  docCategory:       pom.document_form_page._.category_field._.category_select.$(),
  docType:           pom.document_form_page._.type_field._.type_select.$(),
  docTagInput:       pom.document_form_page._.tags_field._.tag_input.$(),
  docAddTag:         pom.document_form_page._.tags_field._.add_tag_btn.$(),
  docFeatured:       pom.document_form_page._.featured_field._.featured_toggle.$(),
  docLink:           pom.document_form_page._.link_field._.link_input.$(),
  docVisualLabel:    pom.document_form_page._.content_field._.document_editor._.editor_mode_toggle._.visual_label.$(),
  docMdLabel:        pom.document_form_page._.content_field._.document_editor._.editor_mode_toggle._.markdown_label.$(),
  docVisualEditor:   pom.document_form_page._.content_field._.document_editor._.visual_editor.$(),
  docMdEditor:       pom.document_form_page._.content_field._.document_editor._.markdown_editor.$(),
  docMdTextarea:     pom.document_form_page._.content_field._.document_editor._.markdown_editor._.markdown_textarea.$(),
  docMdPreview:      pom.document_form_page._.content_field._.document_editor._.markdown_editor._.markdown_preview.$(),
  docChangeNote:     pom.document_form_page._.change_note_field._.change_note_input.$(),
  docCancelBtn:      pom.document_form_page._.form_actions._.cancel_btn.$(),
  docSaveDraft:      pom.document_form_page._.form_actions._.save_draft_btn.$(),
  docPublishBtn:     pom.document_form_page._.form_actions._.publish_btn.$(),

  // Document view page
  docView:           pom.document_view_page.$(),
  backToLibrary:     pom.document_view_page._.back_to_library.$(),
  docViewTitle:      pom.document_view_page._.document_header._.doc_title.$(),
  docViewDesc:       pom.document_view_page._.document_header._.doc_description.$(),
  docViewAuthor:     pom.document_view_page._.document_header._.document_meta._.author.$(),
  docViewVersion:    pom.document_view_page._.document_header._.document_meta._.version.$(),
  docViewViews:      pom.document_view_page._.document_header._.document_meta._.views.$(),
  docViewDate:       pom.document_view_page._.document_header._.document_meta._.date.$(),
  docViewTags:       pom.document_view_page._.document_header._.tags.$(),
  docViewLink:       pom.document_view_page._.external_link.$(),
  docViewFile:       pom.document_view_page._.file_attachment.$(),
  docViewContent:    pom.document_view_page._.document_content.$(),
  catBadge:          pom.document_view_page._.document_header._.category_badge.$(),
  statusBadge:       pom.document_view_page._.document_header._.status_badge.$(),
};

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:9050/api/v1';
const DEBOUNCE_WAIT = 500; // 400ms debounce + 100ms buffer

// ─── Navigation ─────────────────────────────────────────────────────────────

export function navigateToLibrary(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library`);
    await page.waitForSelector(sel.libraryPage, { timeout: 15_000 });
  };
}

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

export function navigateToDocumentView(getPage: () => Page, slug: string) {
  return async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library/documents/${slug}`);
    await page.waitForSelector(sel.docView, { timeout: 15_000 });
  };
}

export function navigateToEditDocument(getPage: () => Page, slug: string) {
  return async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/library/documents/edit/${slug}`);
    await page.waitForSelector(sel.docForm, { timeout: 15_000 });
  };
}

// ─── Categories ─────────────────────────────────────────────────────────────

export function createCategory(getPage: () => Page, data: LibraryCategoryData) {
  return async () => {
    const page = getPage();
    await page.click(sel.createCatBtn);
    await page.waitForSelector(sel.catNameInput, { timeout: 5_000 });
    await page.fill(sel.catNameInput, data.name);
    if (data.description) await page.fill(sel.catDescInput, data.description);
    if (data.parent) {
      // Wait for parent select to populate
      await page.waitForTimeout(1000);
      const parentSelect = page.locator(sel.catParentSelect);
      const options = await parentSelect.locator('option').allTextContents();
      const idx = options.findIndex(t => t.includes(data.parent!));
      if (idx >= 0) await parentSelect.selectOption({ index: idx });
    }
    await page.click(sel.catSubmitBtn);
    await page.waitForSelector(sel.catNameInput, { state: 'hidden', timeout: 5_000 });
    await page.waitForTimeout(500);
  };
}

export function editCategory(getPage: () => Page, slug: string, newData: Partial<LibraryCategoryData>) {
  return async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key="category-row-${slug}"]`);
    await row.locator('button[title="Editar"]').click();
    await page.waitForSelector(sel.catNameInput, { timeout: 5_000 });
    if (newData.name) {
      await page.fill(sel.catNameInput, newData.name);
    }
    if (newData.description) {
      await page.fill(sel.catDescInput, newData.description);
    }
    await page.click(sel.catSubmitBtn);
    await page.waitForSelector(sel.catNameInput, { state: 'hidden', timeout: 5_000 });
    await page.waitForTimeout(500);
  };
}

export function deactivateCategory(getPage: () => Page, slug: string) {
  return async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key="category-row-${slug}"]`);
    await row.locator('button[title="Desactivar"]').click();
    await page.waitForTimeout(500);
  };
}

export function activateCategory(getPage: () => Page, slug: string) {
  return async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key="category-row-${slug}"]`);
    await row.locator('button[title="Activar"]').click();
    await page.waitForTimeout(500);
  };
}

export function softDeleteCategory(getPage: () => Page, slug: string) {
  return async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key="category-row-${slug}"]`);
    await row.locator('button[title="Eliminar"]').click();
    // DeleteConfirmModal opens — click confirm
    await page.waitForTimeout(300);
    const confirmBtn = page.locator('button:has-text("Eliminar")').last();
    await confirmBtn.click();
    await page.waitForTimeout(1000);
  };
}

export function restoreCategory(getPage: () => Page, slug: string) {
  return async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key="category-row-${slug}"]`);
    await row.locator('button[title="Restaurar"]').click();
    // Restore modal opens — click "Restaurar" button
    await page.waitForTimeout(300);
    const restoreBtn = page.locator('button:has-text("Restaurar")').last();
    await restoreBtn.click();
    await page.waitForTimeout(1000);
  };
}

export function hardDeleteCategory(getPage: () => Page, slug: string, exactName: string) {
  return async () => {
    const page = getPage();
    const row = page.locator(`[data-test-key="category-row-${slug}"]`);
    await row.locator('button[title="Eliminar permanentemente"]').click();
    // HardDeleteModal opens
    await page.waitForSelector(sel.hardDeleteModal, { timeout: 5_000 });
    await page.fill(sel.confirmNameInput, exactName);
    await page.waitForTimeout(200);
    // Click "Eliminar Permanentemente" button
    const deleteBtn = page.locator('button:has-text("Eliminar Permanentemente")');
    await deleteBtn.click();
    await page.waitForTimeout(1500);
  };
}

export function filterCategoriesByStatus(getPage: () => Page, status: string) {
  return async () => {
    const page = getPage();
    await page.selectOption(sel.catStatusFilter, status);
    await page.waitForTimeout(500);
  };
}

export function searchCategories(getPage: () => Page, query: string) {
  return async () => {
    const page = getPage();
    await page.fill(sel.catSearch, query);
    await page.waitForTimeout(DEBOUNCE_WAIT);
  };
}

export function setItemsPerPage(getPage: () => Page, count: string) {
  return async () => {
    const page = getPage();
    await page.selectOption(sel.catItemsPerPage, count);
    await page.waitForTimeout(300);
  };
}

// ─── Documents — Form ───────────────────────────────────────────────────────

export function fillDocumentForm(getPage: () => Page, data: LibraryDocumentData) {
  return async () => {
    const page = getPage();

    // 1. Título (siempre requerido)
    await page.fill(sel.docTitle, data.title);

    // 2. Descripción (opcional)
    if (data.description) await page.fill(sel.docDesc, data.description);

    // 3. Categoría (requerida para submit — seleccionar la primera si no se especifica)
    if (data.category) {
      await page.selectOption(sel.docCategory, { label: data.category });
    } else {
      // Wait for categories to load in the select (first non-empty option)
      await page.waitForTimeout(2000); // Give time for categories API to load
      const options = await page.locator(`${sel.docCategory} option`).allTextContents();
      if (options.length > 1) {
        // Select second option (first is "Seleccionar categoría" placeholder)
        await page.selectOption(sel.docCategory, { index: 1 });
      }
    }

    // 4. Tipo de documento
    // Default es 'article'. Solo cambiar si es diferente.
    const currentType = await page.locator(sel.docType).inputValue();
    if (currentType !== data.type) {
      await page.selectOption(sel.docType, data.type);
      await page.waitForTimeout(500); // Esperar re-render de campos condicionales
    }

    // 5. Link externo (solo si tipo es 'link' o 'mixed')
    if (data.externalLink && (data.type === 'link' || data.type === 'mixed')) {
      await page.waitForSelector(sel.docLink, { timeout: 5_000 });
      await page.fill(sel.docLink, data.externalLink);
    }

    // 6. Contenido markdown (solo si tipo es 'article' o 'mixed')
    if (data.content && (data.type === 'article' || data.type === 'mixed')) {
      // El editor carga lazy — esperar a que termine de cargar
      // El editor visual aparece primero con el loading, luego Quill
      // Necesitamos esperar que el editor-mode-toggle esté visible
      await page.waitForSelector('[data-test-context="document-editor"]', { timeout: 15_000 });

      // Esperar a que el loading desaparezca y aparezca el editor visual o el toggle
      await page.waitForSelector('[data-test-key="markdown-label"]', { timeout: 15_000 });

      // Click en el Switch label para cambiar a modo markdown
      await page.click('[data-test-context="editor-mode-toggle"] label');
      await page.waitForSelector(sel.docMdTextarea, { timeout: 10_000 });

      // Escribir contenido markdown
      await page.fill(sel.docMdTextarea, data.content);
    }

    // 7. Tags
    if (data.tags && data.tags.length > 0) {
      for (const tag of data.tags) {
        await page.fill(sel.docTagInput, tag);
        await page.click(sel.docAddTag);
        await page.waitForTimeout(150);
      }
    }

    // 8. Featured toggle — click en el label visual del switch
    if (data.featured) {
      const toggle = page.locator(sel.docFeatured);
      const isChecked = await toggle.isChecked();
      if (!isChecked) {
        const switchLabel = page.locator('[data-test-context="featured-field"] label');
        await switchLabel.click();
        await page.waitForTimeout(200);
      }
    }
  };
}

export function publishDocument(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // Scroll to the publish button (may be out of viewport if editor is tall)
    const publishBtn = page.locator('[data-test-key="publish-btn"]');
    await publishBtn.scrollIntoViewIfNeeded();
    await publishBtn.click();
    // Wait for navigation to /library/manage on success
    await page.waitForURL(/\/library\/manage/, { timeout: 20_000 });
  };
}

export function saveDraftDocument(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const draftBtn = page.locator('[data-test-key="save-draft-btn"]');
    await draftBtn.scrollIntoViewIfNeeded();
    await draftBtn.click();
    await page.waitForURL(/\/library\/manage/, { timeout: 20_000 });
  };
}

// ─── Documents — Manage page actions ────────────────────────────────────────

export function searchDocuments(getPage: () => Page, query: string) {
  return async () => {
    const page = getPage();
    await page.fill(sel.searchInput, query);
    await page.waitForTimeout(DEBOUNCE_WAIT);
  };
}

export function filterDocumentsByType(getPage: () => Page, type: string) {
  return async () => {
    const page = getPage();
    await page.selectOption(sel.typeFilter, type);
    await page.waitForTimeout(500);
  };
}

export function switchToListView(getPage: () => Page) {
  return async () => {
    const page = getPage();
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

export function clickSidebarCategory(getPage: () => Page, slug: string) {
  return async () => {
    const page = getPage();
    await page.click(`[data-test-key="category-${slug}"]`);
    await page.waitForTimeout(500);
  };
}

export function clickAllCategoriesBtn(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.click(sel.allCategoriesBtn);
    await page.waitForTimeout(500);
  };
}

export function publishDocFromCard(getPage: () => Page, slug: string) {
  return async () => {
    const page = getPage();
    const card = page.locator(`[data-test-key="doc-${slug}"]`);
    await card.hover();
    await card.locator('[data-test-key="publish-btn"]').click();
    await page.waitForTimeout(1000);
  };
}

export function deleteDocFromCard(getPage: () => Page, slug: string) {
  return async () => {
    const page = getPage();
    const card = page.locator(`[data-test-key="doc-${slug}"]`);
    await card.hover();

    // Click delete button on card
    await card.locator('[data-test-key="delete-btn"]').click();

    // DeleteConfirmModal (React component) opens — click "Eliminar" button
    await page.waitForTimeout(500);
    const modalDeleteBtn = page.locator('button.bg-red-600:has-text("Eliminar"), button:has-text("Eliminar")').last();
    await modalDeleteBtn.click();
    await page.waitForTimeout(1500);
  };
}

// ─── Documents — Employee view search ───────────────────────────────────────

export function searchLibrary(getPage: () => Page, query: string) {
  return async () => {
    const page = getPage();
    await page.fill(sel.libSearch, query);
    await page.waitForTimeout(DEBOUNCE_WAIT);
  };
}

export function filterLibraryByType(getPage: () => Page, type: string) {
  return async () => {
    const page = getPage();
    await page.selectOption(sel.libTypeFilter, type);
    await page.waitForTimeout(500);
  };
}

// ─── Cleanup helpers (API-based) ────────────────────────────────────────────

/**
 * Pre-cleanup: deletes E2E test data via API to avoid conflicts.
 * Call at the start of each spec to ensure clean state.
 */
export function cleanupLibraryTestData(getPage: () => Page) {
  return async () => {
    const page = getPage();

    // Get auth cookie/token from page context
    const cookies = await page.context().cookies();
    const tokenCookie = cookies.find(c => c.name === 'token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (tokenCookie) {
      headers['Cookie'] = `token=${tokenCookie.value}`;
    }

    // Delete E2E documents via API
    try {
      const docsResp = await page.evaluate(async (apiUrl) => {
        const res = await fetch(`${apiUrl}/library/documents?limit=100`, { credentials: 'include' });
        return res.json();
      }, API_URL);

      if (docsResp?.data) {
        for (const doc of docsResp.data) {
          if (doc.title.startsWith('E2E ')) {
            await page.evaluate(async ({ apiUrl, id }) => {
              await fetch(`${apiUrl}/library/documents/${id}`, { method: 'DELETE', credentials: 'include' });
            }, { apiUrl: API_URL, id: doc._id });
          }
        }
      }
    } catch { /* ignore cleanup errors */ }

    // Delete E2E categories via API (children first)
    try {
      const catsResp = await page.evaluate(async (apiUrl) => {
        const res = await fetch(`${apiUrl}/library/categories?includeDeleted=true`, { credentials: 'include' });
        return res.json();
      }, API_URL);

      if (catsResp?.data) {
        // Sort: children before parents (deeper depth first)
        const e2eCats = catsResp.data
          .filter((c: any) => c.name.startsWith('E2E '))
          .sort((a: any, b: any) => (b.depth || 0) - (a.depth || 0));

        for (const cat of e2eCats) {
          await page.evaluate(async ({ apiUrl, id }) => {
            // Try hard delete first, then soft delete
            await fetch(`${apiUrl}/library/categories/${id}/permanent`, { method: 'DELETE', credentials: 'include' });
          }, { apiUrl: API_URL, id: cat._id });
        }
      }
    } catch { /* ignore cleanup errors */ }

    await page.waitForTimeout(500);
  };
}
