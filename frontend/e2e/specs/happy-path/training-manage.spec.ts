/**
 * Training Manage — E2E Tests (AC-01 to AC-30)
 *
 * Covers: CRUD Badges, Levels, Courses, Exams in /training/manage
 * User: Manuel (admin) — has training:manage
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

e2e.describe.serial('Training Manage — Badges/Levels/Courses/Exams CRUD', () => {

  // ─── Setup ──────────────────────────────────────────────────────────────────

  e2e('login as admin (Manuel)', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  e2e('navigate to /training/manage', async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/training/manage`);
    await page.waitForSelector('[data-test-context="training-manage-page"]', { timeout: 15_000 });
  });

  // ─── Flujo 1: Insignias ────────────────────────────────────────────────────

  e2e('AC-01: see seed badges in Insignias tab', async () => {
    const page = getPage();
    await page.click('[data-test-key="tab-badges"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-test-context="badges-tab"]')).toBeVisible();
    // Seed badges should be visible
    await expect(page.locator('text="[SEED] Fullstack Developer"')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('text="[SEED] React Specialist"')).toBeVisible();
  });

  e2e('AC-02: create new badge with name, description, icon, shape, color', async () => {
    const page = getPage();
    await page.click('[data-test-key="create-badge-btn"]');
    await page.waitForTimeout(500);

    // Fill form
    await page.fill('[data-test-key="badge-name-input"]', 'E2E Badge Test');
    await page.fill('[data-test-key="badge-description-input"]', 'Insignia creada por test automatizado');

    // Select icon (click brain)
    await page.click('[data-test-key="icon-brain"]');

    // Select shape (click hexagon)
    await page.click('[data-test-key="shape-hexagon"]');

    // Submit
    await page.locator('button:has-text("Crear")').last().click();
    await page.waitForTimeout(1500);
  });

  e2e('AC-03: created badge appears in grid', async () => {
    const page = getPage();
    await expect(page.locator('text="E2E Badge Test"')).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-04: edit badge', async () => {
    const page = getPage();
    const badge = page.locator('[data-test-key^="badge-"]', { hasText: 'E2E Badge Test' });
    await badge.locator('[data-test-key="edit-btn"]').click();
    await page.waitForTimeout(500);
    await page.fill('[data-test-key="badge-name-input"]', 'E2E Badge Edited');
    await page.locator('button:has-text("Actualizar")').click();
    await page.waitForTimeout(1500);
    await expect(page.locator('text="E2E Badge Edited"')).toBeVisible();
  });

  e2e('AC-05/06: delete badge with confirmation', async () => {
    const page = getPage();
    const badge = page.locator('[data-test-key^="badge-"]', { hasText: 'E2E Badge Edited' });
    await badge.locator('[data-test-key="delete-btn"]').click();
    await page.waitForTimeout(500);
    // DeleteConfirmModal
    await page.locator('button:has-text("Eliminar")').last().click();
    await page.waitForTimeout(1500);
    await expect(page.locator('text="E2E Badge Edited"')).not.toBeVisible();
  });

  // ─── Flujo 2: Niveles ──────────────────────────────────────────────────────

  e2e('AC-07: see seed levels in Niveles tab', async () => {
    const page = getPage();
    await page.click('[data-test-key="tab-levels"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-test-context="levels-tab"]')).toBeVisible();
    await expect(page.locator('text="[SEED] TypeScript Básico"')).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-08: create new level', async () => {
    const page = getPage();
    await page.click('[data-test-key="create-level-btn"]');
    await page.waitForTimeout(500);
    await page.fill('[data-test-key="level-name-input"]', 'E2E Nivel Test');
    await page.fill('[data-test-key="level-description-input"]', 'Nivel de prueba');
    // Select first badge
    await page.selectOption('[data-test-key="level-badge-select"]', { index: 1 });
    await page.locator('button:has-text("Crear")').last().click();
    await page.waitForTimeout(1500);
  });

  e2e('AC-09: created level appears in table', async () => {
    const page = getPage();
    await expect(page.locator('text="E2E Nivel Test"')).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-11: delete level', async () => {
    const page = getPage();
    const row = page.locator('[data-test-key^="level-"]', { hasText: 'E2E Nivel Test' });
    await row.locator('[data-test-key="delete-btn"]').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Eliminar")').last().click();
    await page.waitForTimeout(1500);
    await expect(page.locator('text="E2E Nivel Test"')).not.toBeVisible();
  });

  // ─── Flujo 3: Cursos ───────────────────────────────────────────────────────

  e2e('AC-12: see seed courses in Cursos tab', async () => {
    const page = getPage();
    await page.click('[data-test-key="tab-courses"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-test-context="courses-tab"]')).toBeVisible();
    await expect(page.locator('text="[SEED] Intro a TypeScript"')).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-13: create new course with level and document', async () => {
    const page = getPage();
    await page.click('[data-test-key="create-course-btn"]');
    await page.waitForTimeout(500);
    await page.fill('[data-test-key="course-name-input"]', 'E2E Curso Test');
    await page.fill('[data-test-key="course-description-input"]', 'Curso de prueba E2E');
    // Select first level
    await page.selectOption('[data-test-key="course-level-select"]', { index: 1 });
    await page.locator('button:has-text("Crear")').last().click();
    await page.waitForTimeout(1500);
  });

  e2e('AC-14: created course appears in table', async () => {
    const page = getPage();
    await expect(page.locator('text="E2E Curso Test"')).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-16: delete course', async () => {
    const page = getPage();
    const row = page.locator('[data-test-key^="course-"]', { hasText: 'E2E Curso Test' });
    await row.locator('[data-test-key="delete-btn"]').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Eliminar")').last().click();
    await page.waitForTimeout(1500);
    await expect(page.locator('text="E2E Curso Test"')).not.toBeVisible();
  });

  // ─── Flujo 4: Exámenes ─────────────────────────────────────────────────────

  e2e('AC-17: see seed exams in Exámenes tab', async () => {
    const page = getPage();
    await page.click('[data-test-key="tab-exams"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-test-context="exams-tab"]')).toBeVisible();
    await expect(page.locator('text="[SEED] Examen TypeScript Básico"')).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-18: navigate to create exam page', async () => {
    const page = getPage();
    await page.click('[data-test-key="create-exam-btn"]');
    await page.waitForURL(/\/training\/manage\/exams\/new/, { timeout: 10_000 });
    await expect(page.locator('[data-test-context="exam-form-page"]')).toBeVisible();
  });

  e2e('AC-19/20/21: fill exam with multiple choice question', async () => {
    const page = getPage();
    await page.fill('[data-test-key="title-input"]', 'E2E Examen Test');
    await page.fill('[data-test-key="description-input"]', 'Examen creado por test E2E');
    // Select level
    await page.selectOption('[data-test-key="level-select"]', { index: 1 });
    // Add question
    await page.click('[data-test-key="add-question-btn"]');
    await page.waitForTimeout(300);
    // Fill question
    const q = page.locator('[data-test-key="question-0"]');
    await q.locator('[data-test-key="question-input"]').fill('¿Cuánto es 2+2?');
    // Fill options (2 by default)
    const opts = q.locator('[data-test-key^="option-"]');
    await opts.nth(0).locator('[data-test-key="option-text-input"]').fill('3');
    await opts.nth(1).locator('[data-test-key="option-text-input"]').fill('4');
    // Mark second as correct
    await opts.nth(1).locator('[data-test-key="option-correct-radio"]').check();
  });

  e2e('AC-22: add open_text question with expectedAnswer', async () => {
    const page = getPage();
    await page.click('[data-test-key="add-question-btn"]');
    await page.waitForTimeout(300);
    const q = page.locator('[data-test-key="question-1"]');
    // Switch to open_text
    await q.locator('[data-test-key="type-radio-open"]').check();
    await q.locator('[data-test-key="question-input"]').fill('Explique qué es TypeScript.');
    await q.locator('[data-test-key="expected-answer-input"]').fill('Es un superset de JavaScript con tipos estáticos.');
  });

  e2e('AC-29: default passing score is 80%', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-key="passing-score-input"]')).toHaveValue('80');
  });

  e2e('AC-25: save exam redirects to /training/manage', async () => {
    const page = getPage();
    const saveBtn = page.locator('[data-test-key="save-btn"]');
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await page.waitForURL(/\/training\/manage/, { timeout: 15_000 });
  });

  e2e('AC-26: created exam appears in list', async () => {
    const page = getPage();
    await page.click('[data-test-key="tab-exams"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('text="E2E Examen Test"')).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-27: edit exam navigates to edit page', async () => {
    const page = getPage();
    const exam = page.locator('[data-test-key^="exam-"]', { hasText: 'E2E Examen Test' });
    await exam.locator('[data-test-key="edit-btn"]').click();
    await page.waitForURL(/\/training\/manage\/exams\/edit\//, { timeout: 10_000 });
    await expect(page.locator('[data-test-key="title-input"]')).toHaveValue('E2E Examen Test');
    // Go back
    await page.goto(`${BASE_URL}/training/manage`);
    await page.waitForSelector('[data-test-context="training-manage-page"]', { timeout: 10_000 });
  });

  e2e('AC-28: delete exam', async () => {
    const page = getPage();
    await page.click('[data-test-key="tab-exams"]');
    await page.waitForTimeout(1000);
    const exam = page.locator('[data-test-key^="exam-"]', { hasText: 'E2E Examen Test' });
    await exam.locator('[data-test-key="delete-btn"]').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Eliminar")').last().click();
    await page.waitForTimeout(1500);
    await expect(page.locator('text="E2E Examen Test"')).not.toBeVisible();
  });
});
