/**
 * CSW Factory — Interaction logic for the CSW (Solicitudes) module.
 *
 * Provides reusable factories for:
 * - Navigating to CSW pages (my-requests, new, pending, view)
 * - Filling the CSW form (category + textareas)
 * - Submitting/saving as draft
 * - Approving/rejecting at each level
 * - Filtering and verifying list state
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/csw.pom';
import type { CSWFormData, ApprovalData, LoginData } from '../fixtures/test-data';
import { pom as signinPom } from '../pom/signin.pom';

// ─── Selectors (derived from POM) ───────────────────────────────────────────

const sel = {
  // List page
  list: pom.csw_list.$(),
  pageTitle: pom.csw_list._.page_title.$(),
  createButton: pom.csw_list._.csw_controls._.create_button.$(),
  searchInput: pom.csw_list._.csw_controls._.search_input.$(),
  statusFilter: pom.csw_list._.csw_controls._.status_filter.$(),
  categoryFilter: pom.csw_list._.csw_controls._.category_filter.$(),
  tableBody: pom.csw_list._.csw_table._.table_body.$(),
  emptyState: pom.csw_list._.csw_table._.table_body._.empty_state.$(),
  tableLoaded: pom.csw_list._.csw_table.loaded.$(),
  tableLoading: pom.csw_list._.csw_table.loading.$(),

  // Form page
  form: pom.csw_form.$(),
  formReady: pom.csw_form.ready.$(),
  formTitle: pom.csw_form._.form_title.$(),
  categorySelect: pom.csw_form._.category_field._.category_select.$(),
  situationTextarea: pom.csw_form._.situation_field._.situation_textarea.$(),
  situationWordCount: pom.csw_form._.situation_field._.situation_word_count.$(),
  informationTextarea: pom.csw_form._.information_field._.information_textarea.$(),
  informationWordCount: pom.csw_form._.information_field._.information_word_count.$(),
  solutionTextarea: pom.csw_form._.solution_field._.solution_textarea.$(),
  solutionWordCount: pom.csw_form._.solution_field._.solution_word_count.$(),
  cancelButton: pom.csw_form._.form_actions._.cancel_button.$(),
  saveDraftButton: pom.csw_form._.form_actions._.save_draft_button.$(),
  submitButton: pom.csw_form._.form_actions._.submit_button.$(),
  updateButton: pom.csw_form._.form_actions._.update_button.$(),
  rejectionBanner: pom.csw_form._.rejection_banner.$(),

  // View page
  view: pom.csw_view.$(),
  viewTitle: pom.csw_view._.csw_title.$(),
  viewStatusBadge: pom.csw_view._.status_badge.$(),
  approvalChain: pom.csw_view._.approval_chain.$(),
  approveButton: pom.csw_view._.approval_actions._.approve_button.$(),
  rejectButton: pom.csw_view._.approval_actions._.reject_button.$(),
  commentsTextarea: pom.csw_view._.approval_actions._.comments_textarea.$(),

  // Signin (for login helper)
  signinFormReady: signinPom.signin_page._.login_form.ready.$(),
  signinEmailInput: signinPom.signin_page._.login_form._.login_inputs._.email_input.$(),
  signinPasswordInput: signinPom.signin_page._.login_form._.login_inputs._.password_input.$(),
  signinSubmitButton: signinPom.signin_page._.login_form._.login_inputs._.submit_button.$(),
  signinPage: signinPom.signin_page.$(),
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Login helper — logs in as a specific user, clearing previous session.
 */
async function loginAs(page: Page, credentials: LoginData): Promise<void> {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  await page.context().clearCookies();
  await page.goto(`${baseUrl}/signin`);
  await page.waitForSelector(sel.signinFormReady, { timeout: 15_000 });
  await page.locator(sel.signinEmailInput).fill(credentials.email);
  await page.locator(sel.signinPasswordInput).fill(credentials.password);
  await page.locator(sel.signinSubmitButton).click();
  await expect(page.locator(sel.signinPage)).toBeHidden({ timeout: 15_000 });
}

// ─── Navigation Factories ───────────────────────────────────────────────────

/**
 * Login and navigate to /csw/my-requests.
 */
export function loginAndNavigateToMyRequests(getPage: () => Page, credentials: LoginData) {
  return async () => {
    const page = getPage();
    await loginAs(page, credentials);
    await page.goto(`${process.env.BASE_URL || 'http://localhost:5173'}/csw/my-requests`);
    await page.waitForSelector(sel.list, { timeout: 15_000 });
  };
}

/**
 * Navigate to /csw/new (create new CSW form).
 */
export function navigateToNewCSW(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // Click create button or navigate directly
    const createBtn = page.locator(sel.createButton);
    if (await createBtn.isVisible()) {
      await createBtn.click();
    } else {
      await page.goto(`${process.env.BASE_URL || 'http://localhost:5173'}/csw/new`);
    }
    await page.waitForSelector(sel.form, { timeout: 15_000 });
  };
}

/**
 * Login and navigate to /csw/pending (approver's pending list).
 */
export function loginAndNavigateToPending(getPage: () => Page, credentials: LoginData) {
  return async () => {
    const page = getPage();
    await loginAs(page, credentials);
    await page.goto(`${process.env.BASE_URL || 'http://localhost:5173'}/csw/pending`);
    await page.waitForSelector(sel.list, { timeout: 15_000 });
  };
}

// ─── Form Factories ─────────────────────────────────────────────────────────

/**
 * Fills the CSW form with provided data.
 */
export function fillCSWForm(getPage: () => Page, data: CSWFormData) {
  return async () => {
    const page = getPage();
    await page.waitForSelector(sel.form, { timeout: 10_000 });

    // Select category using the SearchableSelect (data-test-key="category-select")
    const categorySelect = page.locator(sel.categorySelect);
    await categorySelect.waitFor({ state: 'visible', timeout: 5_000 });

    // Click to open the dropdown
    await categorySelect.click();
    await page.waitForTimeout(500);

    // Type in the search input inside the dropdown
    const dropdownInput = categorySelect.locator('input[type="text"]');
    if (await dropdownInput.isVisible()) {
      await dropdownInput.fill(data.category);
      await page.waitForTimeout(600);
    }

    // Click the matching option button
    const option = categorySelect.locator('button').filter({ hasText: data.category }).first();
    await option.click();
    await page.waitForTimeout(300);

    // Fill situation textarea
    await page.locator(sel.situationTextarea).fill(data.situation);

    // Fill information textarea
    await page.locator(sel.informationTextarea).fill(data.information);

    // Fill solution textarea
    await page.locator(sel.solutionTextarea).fill(data.solution);
  };
}

/**
 * Clicks "Crear y Enviar" and waits for redirect to my-requests.
 */
export function submitCSWForm(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const submitBtn = page.locator(sel.submitButton);
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    // Wait for navigation back to my-requests
    await page.waitForURL('**/csw/my-requests', { timeout: 15_000 });
  };
}

/**
 * Clicks "Guardar Borrador" and waits for redirect.
 */
export function saveDraftCSW(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const draftBtn = page.locator(sel.saveDraftButton);
    await expect(draftBtn).toBeVisible();
    await draftBtn.click();
    await page.waitForURL('**/csw/my-requests', { timeout: 15_000 });
  };
}

/**
 * Opens the first draft CSW and sends it for approval (DRAFT → PENDING).
 * This clicks "Editar" on the draft, then clicks "Enviar Solicitud".
 */
export function submitDraftForApproval(getPage: () => Page) {
  return async () => {
    const page = getPage();
    // Click edit on the first row
    const editBtn = page.locator('[data-test-context="csw-table"] button[title="Editar"]').first();
    await expect(editBtn).toBeVisible({ timeout: 10_000 });
    await editBtn.click();
    await page.waitForSelector(sel.form, { timeout: 15_000 });

    // Click "Enviar Solicitud" button (data-test-key="submit-button")
    const submitBtn = page.locator(sel.submitButton);
    await expect(submitBtn).toBeVisible({ timeout: 5_000 });
    await submitBtn.click();

    // Wait for redirect back to my-requests
    await page.waitForURL('**/csw/my-requests', { timeout: 15_000 });
  };
}

/**
 * Clicks "Actualizar Solicitud" (for editing rejected CSW) and waits for redirect.
 */
export function updateCSWForm(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const updateBtn = page.locator(sel.updateButton);
    await expect(updateBtn).toBeVisible();
    await updateBtn.click();
    await page.waitForURL('**/csw/my-requests', { timeout: 15_000 });
  };
}

// ─── Approval Factories ─────────────────────────────────────────────────────

/**
 * Opens the first pending CSW from the pending list.
 */
export function openFirstPendingCSW(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.waitForTimeout(2000);
    // Click the first "view" button in the CSW table
    const viewBtn = page.locator('[data-test-context="csw-table"] button[title="Ver detalles"]').first();
    await expect(viewBtn).toBeVisible({ timeout: 10_000 });
    await viewBtn.click();
    await page.waitForSelector(sel.view, { timeout: 15_000 });
  };
}

/**
 * Approves the current CSW level with a comment.
 */
export function approveCSW(getPage: () => Page, data: ApprovalData) {
  return async () => {
    const page = getPage();
    // Wait for approve button to be visible (only current approver sees it)
    const approveBtn = page.locator(sel.approveButton);
    await expect(approveBtn).toBeVisible({ timeout: 10_000 });

    // Fill comments
    const commentsField = page.locator(sel.commentsTextarea);
    await commentsField.fill(data.comments);

    // Click approve
    await approveBtn.click();

    // Wait for navigation back to pending list
    await page.waitForURL('**/csw/pending', { timeout: 15_000 });
  };
}

/**
 * Rejects the current CSW level with a mandatory comment.
 */
export function rejectCSW(getPage: () => Page, data: ApprovalData) {
  return async () => {
    const page = getPage();
    // Wait for reject button
    const rejectBtn = page.locator(sel.rejectButton);
    await expect(rejectBtn).toBeVisible({ timeout: 10_000 });

    // Fill mandatory comments
    const commentsField = page.locator(sel.commentsTextarea);
    await commentsField.fill(data.comments);

    // Click reject
    await rejectBtn.click();

    // Wait for navigation back to pending list
    await page.waitForURL('**/csw/pending', { timeout: 15_000 });
  };
}

// ─── Verification Factories ─────────────────────────────────────────────────

/**
 * Verifies a CSW appears in the list with expected status.
 * If expectedStatus is empty string, only verifies category exists.
 */
export function verifyCSWInList(getPage: () => Page, expectedCategory: string, expectedStatus: string) {
  return async () => {
    const page = getPage();
    
    // Reload to get fresh data
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Simple check: verify the category text is visible on the page
    const categoryOnPage = page.locator(`text=${expectedCategory}`).first();
    await expect(categoryOnPage).toBeVisible({ timeout: 10_000 });

    // If status is specified, verify it's also present
    if (expectedStatus) {
      const statusOnPage = page.locator(`text=${expectedStatus}`).first();
      await expect(statusOnPage).toBeVisible({ timeout: 5_000 });
    }
  };
}

/**
 * Verifies the CSW view page shows expected status badge text.
 */
export function verifyCSWViewStatus(getPage: () => Page, expectedStatus: string) {
  return async () => {
    const page = getPage();
    const badge = page.locator(sel.viewStatusBadge);
    await expect(badge).toContainText(expectedStatus, { timeout: 10_000 });
  };
}

/**
 * Opens the first CSW in my-requests list for editing.
 */
export function editFirstCSWInList(getPage: () => Page) {
  return async () => {
    const page = getPage();
    const editBtn = page.locator('[data-test-context="csw-table"] button[title="Editar"]').first();
    await expect(editBtn).toBeVisible({ timeout: 10_000 });
    await editBtn.click();
    await page.waitForSelector(sel.form, { timeout: 15_000 });
  };
}

/**
 * Verifies the rejection banner is visible with expected info.
 */
export function verifyRejectionBanner(getPage: () => Page, rejectedBy: string) {
  return async () => {
    const page = getPage();
    const banner = page.locator(sel.rejectionBanner);
    await expect(banner).toBeVisible({ timeout: 5_000 });
    await expect(banner).toContainText(rejectedBy);
  };
}
