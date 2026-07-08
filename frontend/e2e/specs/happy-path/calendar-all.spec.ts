/**
 * Calendar Master Spec — Validates calendar and events list pages.
 *
 * Tests:
 * 1. Calendar page loads with FullCalendar view
 * 2. Holidays are visible (Colombia/US)
 * 3. Events list page loads
 * 4. Create event via API + verify in list
 * 5. Delete event
 */

import { createSerialFlow } from '../../fixtures/base';
import { expect } from '@playwright/test';
import {
  loginAndNavigateToCalendar,
  navigateToEventsList,
} from '../../factories/calendar.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();

const ts = Date.now().toString().slice(-6);

e2e.describe.serial('Calendar — Full Lifecycle', () => {
  // ─── CALENDAR VIEW ────────────────────────────────────────────────────
  e2e('1. Login and navigate to /calendar',
    loginAndNavigateToCalendar(getPage, LOGIN_MANUEL));

  e2e('2. Verify calendar renders (FullCalendar visible)', async () => {
    const page = getPage();
    // FullCalendar renders a .fc container
    const fcContainer = page.locator('.fc');
    await expect(fcContainer).toBeVisible({ timeout: 10_000 });
  });

  e2e('3. Verify month/week navigation buttons exist', async () => {
    const page = getPage();
    // FullCalendar has toolbar buttons
    const toolbar = page.locator('.fc-toolbar');
    await expect(toolbar).toBeVisible();
  });

  e2e('4. Verify holidays are loaded (at least one event)', async () => {
    const page = getPage();
    // Calendar should have at least one event (holidays)
    const events = page.locator('.fc-event');
    const count = await events.count();
    expect(count).toBeGreaterThan(0);
  });

  // ─── EVENTS LIST ──────────────────────────────────────────────────────
  e2e('5. Navigate to /calendar/events',
    navigateToEventsList(getPage));

  e2e('6. Verify events list page loaded', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-context="events-list"]')).toBeVisible();
  });

  e2e('7. Create event via API', async () => {
    const page = getPage();
    const baseApi = 'http://localhost:9050/api/v1';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split('T')[0];
    const endDate = startDate;

    const createRes = await page.evaluate(async ({ api, title, startDate, endDate }) => {
      const res = await fetch(`${api}/calendar/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          startDate,
          endDate,
          color: 'primary',
          type: 'meeting',
          allDay: true,
        }),
      });
      return res.json();
    }, { api: baseApi, title: `E2E Event ${ts}`, startDate, endDate });

    expect((createRes as any).success !== false).toBe(true);
  });

  e2e('8. Reload events list and verify event exists', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    // Check the event title appears in the table
    const eventText = page.locator(`text=E2E Event ${ts}`);
    await expect(eventText.first()).toBeVisible({ timeout: 10_000 });
  });

  e2e('9. Delete event via API', async () => {
    const page = getPage();
    const baseApi = 'http://localhost:9050/api/v1';

    // Get the event ID
    const listRes = await page.evaluate(async (api) => {
      const res = await fetch(`${api}/calendar/events`, { credentials: 'include' });
      return res.json();
    }, baseApi);

    const events = (listRes as any).data || [];
    const testEvent = events.find((e: any) => e.title?.includes('E2E Event'));

    if (testEvent) {
      await page.evaluate(async ({ api, id }) => {
        await fetch(`${api}/calendar/events/${id}`, { method: 'DELETE', credentials: 'include' });
      }, { api: baseApi, id: testEvent._id });
    }
  });

  e2e('10. Verify event removed after reload', async () => {
    const page = getPage();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const eventText = page.locator(`text=E2E Event ${ts}`);
    const count = await eventText.count();
    expect(count).toBe(0);
  });
});
