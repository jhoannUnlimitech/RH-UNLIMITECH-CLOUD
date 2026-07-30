/**
 * Training Factory — Interaction logic for Training Manage page.
 *
 * Provides factories for:
 * - Navigating to /training/manage
 * - Switching tabs (Badges, Levels, Courses, Exams)
 * - CRUD operations on each entity via UI
 * - API-level operations for exam attempts, progress, evaluations
 */

import { expect, type Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:9050/api/v1';

// ─── Navigation ─────────────────────────────────────────────────────────────

export function navigateToTrainingManage(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/training/manage`);
    await page.waitForLoadState('networkidle');
    // Wait for tabs to appear
    await page.waitForSelector('text=Insignias', { timeout: 15_000 });
  };
}

export function navigateToMyProgress(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/training/my-progress`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  };
}

// ─── Tab Switching ──────────────────────────────────────────────────────────

export function switchTab(getPage: () => Page, tabName: string) {
  return async () => {
    const page = getPage();
    await page.click(`button:has-text("${tabName}")`);
    await page.waitForTimeout(500);
  };
}

// ─── Badges CRUD ────────────────────────────────────────────────────────────

export function createBadge(getPage: () => Page, data: { name: string; description: string }) {
  return async () => {
    const page = getPage();
    // Click "+ Nueva Insignia" button
    await page.click('button:has-text("Nueva Insignia")');
    await page.waitForTimeout(300);

    // Fill form in modal
    const nameInput = page.locator('input[placeholder*="nombre" i], input[data-test-key="badge-name-input"]').first();
    await nameInput.fill(data.name);

    const descInput = page.locator('textarea[placeholder*="descripción" i], textarea[data-test-key="badge-description-input"]').first();
    if (await descInput.isVisible()) {
      await descInput.fill(data.description);
    }

    // Submit
    await page.click('button:has-text("Crear")');
    await page.waitForTimeout(1000);
  };
}

export function verifyBadgeExists(getPage: () => Page, name: string) {
  return async () => {
    const page = getPage();
    await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 5_000 });
  };
}

export function deleteBadge(getPage: () => Page, name: string) {
  return async () => {
    const page = getPage();
    // Find the badge card and click delete button
    const card = page.locator(`text=${name}`).first().locator('..').locator('..');
    const deleteBtn = card.locator('button[title*="liminar" i], button:has(svg)').last();
    await deleteBtn.click();
    await page.waitForTimeout(300);

    // Confirm in modal
    const confirmBtn = page.locator('button:has-text("Eliminar")').last();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    await page.waitForTimeout(1000);
  };
}

// ─── Levels CRUD ────────────────────────────────────────────────────────────

export function createLevel(getPage: () => Page, data: { name: string; badge: string; order: number }) {
  return async () => {
    const page = getPage();
    await page.click('button:has-text("Nuevo Nivel")');
    await page.waitForTimeout(300);

    // Fill name
    const nameInput = page.locator('input[placeholder*="nombre" i]').first();
    await nameInput.fill(data.name);

    // Select badge
    const badgeSelect = page.locator('select').filter({ hasText: /insignia/i }).first();
    if (await badgeSelect.isVisible()) {
      await badgeSelect.selectOption({ label: data.badge });
    }

    // Order
    const orderInput = page.locator('input[type="number"]').first();
    if (await orderInput.isVisible()) {
      await orderInput.fill(String(data.order));
    }

    await page.click('button:has-text("Crear")');
    await page.waitForTimeout(1000);
  };
}

// ─── Courses CRUD ───────────────────────────────────────────────────────────

export function createCourse(getPage: () => Page, data: { name: string; description: string; level: string; hours: number }) {
  return async () => {
    const page = getPage();
    await page.click('button:has-text("Nuevo Curso")');
    await page.waitForTimeout(300);

    // Fill name
    const nameInput = page.locator('[data-test-key="course-name-input"]').first();
    await nameInput.fill(data.name);

    // Fill description
    const descInput = page.locator('[data-test-key="course-description-input"]').first();
    await descInput.fill(data.description);

    // Select level
    const levelSelect = page.locator('[data-test-key="course-level-select"]').first();
    await levelSelect.selectOption({ label: data.level });

    // Hours
    const hoursInput = page.locator('[data-test-key="course-hours-input"]').first();
    await hoursInput.fill(String(data.hours));

    await page.click('button:has-text("Crear")');
    await page.waitForTimeout(1000);
  };
}

// ─── Exams ──────────────────────────────────────────────────────────────────

export function navigateToNewExam(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.click('a:has-text("Nuevo Examen"), button:has-text("Nuevo Examen")');
    await page.waitForURL(/\/training\/manage\/exams\/new/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');
  };
}

export function fillExamBasicInfo(getPage: () => Page, data: { title: string; passingScore?: number }) {
  return async () => {
    const page = getPage();
    const titleInput = page.locator('input[placeholder*="título" i], input[name="title"]').first();
    await titleInput.fill(data.title);

    if (data.passingScore) {
      const scoreInput = page.locator('input[type="number"]').filter({ hasText: /aprobación|passing/i }).first();
      if (await scoreInput.isVisible()) {
        await scoreInput.fill(String(data.passingScore));
      }
    }
  };
}

// ─── API-level helpers ──────────────────────────────────────────────────────

export function apiCall(getPage: () => Page, method: string, path: string, body?: any) {
  return async (): Promise<any> => {
    const page = getPage();
    return page.evaluate(async ({ apiUrl, method, path, body }) => {
      const res = await fetch(`${apiUrl}${path}`, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      return res.json();
    }, { apiUrl: API_URL, method, path, body });
  };
}

/**
 * Helper: execute API call and return result (for use inside test body).
 */
export async function apiExec(page: Page, method: string, path: string, body?: any): Promise<any> {
  return page.evaluate(async ({ apiUrl, method, path, body }) => {
    const res = await fetch(`${apiUrl}${path}`, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }, { apiUrl: API_URL, method, path, body });
}
