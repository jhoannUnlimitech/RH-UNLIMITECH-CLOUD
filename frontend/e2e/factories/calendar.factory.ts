/**
 * Calendar Factory — Interaction logic for the Calendar module.
 */
import { expect, type Page } from '@playwright/test';
import type { LoginData } from '../fixtures/test-data';

async function loginAs(page: Page, credentials: LoginData): Promise<void> {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
  await page.context().clearCookies();
  await page.goto(`${baseUrl}/signin`);
  await page.waitForSelector('[data-test-context="login-form"][data-test-state="ready"]', { timeout: 15_000 });
  await page.locator('[data-test-key="email-input"]').fill(credentials.email);
  await page.locator('[data-test-key="password-input"]').fill(credentials.password);
  await page.locator('[data-test-key="submit-button"]').click();
  await page.locator('[data-test-context="signin-page"]').waitFor({ state: 'hidden', timeout: 15_000 });
}

export function loginAndNavigateToCalendar(getPage: () => Page, credentials: LoginData) {
  return async () => {
    const page = getPage();
    await loginAs(page, credentials);
    await page.goto(`${process.env.BASE_URL || 'http://localhost:5173'}/calendar`);
    await page.waitForSelector('[data-test-context="calendar-page"]', { timeout: 15_000 });
  };
}

export function navigateToEventsList(getPage: () => Page) {
  return async () => {
    const page = getPage();
    await page.goto(`${process.env.BASE_URL || 'http://localhost:5173'}/calendar/events`);
    await page.waitForSelector('[data-test-context="events-list"]', { timeout: 15_000 });
  };
}
