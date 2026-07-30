/**
 * Training Manage Factory — Interaction logic for /training/manage page.
 *
 * Provides factories for navigating, switching tabs, and CRUD operations
 * on Badges, Levels, Courses via the admin UI.
 */

import { expect, type Page } from '@playwright/test';
import { pom } from '../pom/training-manage.pom';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// ─── Selectors (derived from POM — evaluated once at module load) ───────────

const sel = {
  page: pom.training_manage_page.$(),
  createBadgeBtn: pom.training_manage_page._.badges_tab._.create_badge_btn.$(),
  createLevelBtn: pom.training_manage_page._.levels_tab._.create_level_btn.$(),
  createCourseBtn: pom.training_manage_page._.courses_tab._.create_course_btn.$(),

  // Badge modal
  badgeNameInput: pom.badge_form_modal._.badge_name_input.$(),
  badgeDescInput: pom.badge_form_modal._.badge_description_input.$(),

  // Course modal
  courseNameInput: pom.course_form_modal._.course_name_input.$(),
  courseDescInput: pom.course_form_modal._.course_description_input.$(),
  courseLevelSelect: pom.course_form_modal._.course_level_select.$(),
  courseHoursInput: pom.course_form_modal._.course_hours_input.$(),
};

// ─── Navigation ─────────────────────────────────────────────────────────────

export function navigateToTrainingManage(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/training/manage`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Insignias', { timeout: 15_000 });
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

// ─── Badge CRUD ─────────────────────────────────────────────────────────────

export function createBadge(getPage: () => Page, data: { name: string; description: string }) {
  return async () => {
    const page = getPage();
    await page.locator(sel.createBadgeBtn).click();
    await page.waitForTimeout(800);

    const modal = page.locator('.modal').last();
    await expect(modal).toBeVisible({ timeout: 5_000 });

    await modal.locator(sel.badgeNameInput).fill(data.name);
    await modal.locator(sel.badgeDescInput).fill(data.description);
    await modal.locator('button:has-text("Crear")').click();
    await expect(modal).not.toBeVisible({ timeout: 10_000 });
  };
}

// ─── Course CRUD ────────────────────────────────────────────────────────────

export function createCourse(getPage: () => Page, data: { name: string; description: string; hours: number }) {
  return async () => {
    const page = getPage();
    await page.click('button:has-text("Nuevo Curso")');
    await page.waitForTimeout(500);

    const modal = page.locator('.modal').last();
    await expect(modal).toBeVisible({ timeout: 5_000 });

    await modal.locator(sel.courseNameInput).fill(data.name);
    await modal.locator(sel.courseDescInput).fill(data.description);

    const levelSelect = modal.locator(sel.courseLevelSelect);
    const options = await levelSelect.locator('option').all();
    if (options.length > 1) {
      await levelSelect.selectOption({ index: 1 });
    }

    await modal.locator(sel.courseHoursInput).fill(String(data.hours));
    await modal.locator('button:has-text("Crear")').click();
    await page.waitForTimeout(1000);
  };
}
