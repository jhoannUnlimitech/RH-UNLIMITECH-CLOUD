/**
 * Training API CRUD — E2E Tests (AC-91 to AC-102)
 *
 * Tests the Training module API endpoints directly:
 * - Courses: GET, POST, PUT, DELETE
 * - Levels: GET, POST, PUT, DELETE
 * - Badges: GET, POST, PUT, DELETE (with active levels constraint)
 *
 * These are API-level tests executed through the browser context
 * (authenticated via cookies from login).
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import { LOGIN_MANUEL, TRAINING_COURSE, TRAINING_LEVEL, TRAINING_BADGE } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();
const API_URL = process.env.API_URL || 'http://localhost:9050/api/v1';

// Store IDs for created resources
let courseId: string;
let levelId: string;
let badgeId: string;

e2e.describe.serial('Training API CRUD — Courses/Levels/Badges (AC-91 to AC-102)', () => {

  e2e('login as admin (Manuel)', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  // ─── Cleanup previous E2E data ─────────────────────────────────────────────

  e2e('pre-cleanup: delete E2E training data from previous runs', async () => {
    const page = getPage();

    // Delete courses
    const courses = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/training/courses`, { credentials: 'include' });
      return res.json();
    }, API_URL);
    if (courses?.data) {
      for (const course of courses.data) {
        if (course.name.startsWith('E2E ')) {
          await page.evaluate(async ({ apiUrl, id }) => {
            await fetch(`${apiUrl}/training/courses/${id}`, { method: 'DELETE', credentials: 'include' });
          }, { apiUrl: API_URL, id: course._id });
        }
      }
    }

    // Delete levels
    const levels = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/training/levels`, { credentials: 'include' });
      return res.json();
    }, API_URL);
    if (levels?.data) {
      for (const level of levels.data) {
        if (level.name.startsWith('E2E ')) {
          await page.evaluate(async ({ apiUrl, id }) => {
            await fetch(`${apiUrl}/training/levels/${id}`, { method: 'DELETE', credentials: 'include' });
          }, { apiUrl: API_URL, id: level._id });
        }
      }
    }

    // Delete badges
    const badges = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/training/badges`, { credentials: 'include' });
      return res.json();
    }, API_URL);
    if (badges?.data) {
      for (const badge of badges.data) {
        if (badge.name.startsWith('E2E ')) {
          await page.evaluate(async ({ apiUrl, id }) => {
            await fetch(`${apiUrl}/training/badges/${id}`, { method: 'DELETE', credentials: 'include' });
          }, { apiUrl: API_URL, id: badge._id });
        }
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // El flujo correcto de dependencias es: Badge → Level (requiere badge) → Course (requiere level)
  // Testeamos en ese orden para satisfacer las FK obligatorias.
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── AC-99: GET /training/badges ────────────────────────────────────────────

  e2e('AC-99: GET /training/badges returns list', async () => {
    const page = getPage();
    const result = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/training/badges`, { credentials: 'include' });
      return { status: res.status, body: await res.json() };
    }, API_URL);

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(Array.isArray(result.body.data)).toBe(true);
  });

  // ─── AC-100: POST /training/badges ──────────────────────────────────────────

  e2e('AC-100: POST /training/badges creates badge', async () => {
    const page = getPage();
    const result = await page.evaluate(async ({ apiUrl, data }) => {
      const res = await fetch(`${apiUrl}/training/badges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return { status: res.status, body: await res.json() };
    }, { apiUrl: API_URL, data: TRAINING_BADGE });

    expect(result.status).toBe(201);
    expect(result.body.success).toBe(true);
    expect(result.body.data.name).toBe(TRAINING_BADGE.name);
    badgeId = result.body.data._id;
  });

  // ─── AC-101: PUT /training/badges/:id ───────────────────────────────────────

  e2e('AC-101: PUT /training/badges/:id updates badge', async () => {
    const page = getPage();
    const result = await page.evaluate(async ({ apiUrl, id, update }) => {
      const res = await fetch(`${apiUrl}/training/badges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(update),
      });
      return { status: res.status, body: await res.json() };
    }, { apiUrl: API_URL, id: badgeId, update: { name: 'E2E Badge Actualizado' } });

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.data.name).toBe('E2E Badge Actualizado');
  });

  // ─── AC-95: GET /training/levels ────────────────────────────────────────────

  e2e('AC-95: GET /training/levels returns list', async () => {
    const page = getPage();
    const result = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/training/levels`, { credentials: 'include' });
      return { status: res.status, body: await res.json() };
    }, API_URL);

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(Array.isArray(result.body.data)).toBe(true);
  });

  // ─── AC-96: POST /training/levels (requires badge) ─────────────────────────

  e2e('AC-96: POST /training/levels creates level', async () => {
    const page = getPage();
    const result = await page.evaluate(async ({ apiUrl, name, description, order, badge }) => {
      const res = await fetch(`${apiUrl}/training/levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, description, order, badge }),
      });
      return { status: res.status, body: await res.json() };
    }, { apiUrl: API_URL, name: TRAINING_LEVEL.name, description: TRAINING_LEVEL.description, order: TRAINING_LEVEL.order, badge: badgeId });

    expect(result.status).toBe(201);
    expect(result.body.success).toBe(true);
    expect(result.body.data.name).toBe(TRAINING_LEVEL.name);
    levelId = result.body.data._id;
  });

  // ─── AC-97: PUT /training/levels/:id ────────────────────────────────────────

  e2e('AC-97: PUT /training/levels/:id updates level', async () => {
    const page = getPage();
    const result = await page.evaluate(async ({ apiUrl, id, update }) => {
      const res = await fetch(`${apiUrl}/training/levels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(update),
      });
      return { status: res.status, body: await res.json() };
    }, { apiUrl: API_URL, id: levelId, update: { name: 'E2E Nivel Actualizado', order: 2 } });

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.data.name).toBe('E2E Nivel Actualizado');
  });

  // ─── AC-91: GET /training/courses ───────────────────────────────────────────

  e2e('AC-91: GET /training/courses returns list', async () => {
    const page = getPage();
    const result = await page.evaluate(async (apiUrl) => {
      const res = await fetch(`${apiUrl}/training/courses`, { credentials: 'include' });
      return { status: res.status, body: await res.json() };
    }, API_URL);

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(Array.isArray(result.body.data)).toBe(true);
  });

  // ─── AC-92: POST /training/courses (requires level) ────────────────────────

  e2e('AC-92: POST /training/courses creates course', async () => {
    const page = getPage();
    const result = await page.evaluate(async ({ apiUrl, courseName, courseDesc, lvlId }) => {
      const res = await fetch(`${apiUrl}/training/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: courseName, description: courseDesc, level: lvlId }),
      });
      return { status: res.status, body: await res.json() };
    }, { apiUrl: API_URL, courseName: TRAINING_COURSE.name, courseDesc: TRAINING_COURSE.description, lvlId: levelId });

    expect(result.status).toBe(201);
    expect(result.body.success).toBe(true);
    expect(result.body.data.name).toBe(TRAINING_COURSE.name);
    courseId = result.body.data._id;
  });

  // ─── AC-93: PUT /training/courses/:id ───────────────────────────────────────

  e2e('AC-93: PUT /training/courses/:id updates course', async () => {
    const page = getPage();
    const result = await page.evaluate(async ({ apiUrl, id, update }) => {
      const res = await fetch(`${apiUrl}/training/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(update),
      });
      return { status: res.status, body: await res.json() };
    }, { apiUrl: API_URL, id: courseId, update: { name: 'E2E Curso Actualizado', description: 'Updated' } });

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.data.name).toBe('E2E Curso Actualizado');
  });

  // ─── AC-94: DELETE /training/courses/:id ────────────────────────────────────

  e2e('AC-94: DELETE /training/courses/:id deletes (soft)', async () => {
    const page = getPage();
    const result = await page.evaluate(async ({ apiUrl, id }) => {
      const res = await fetch(`${apiUrl}/training/courses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return { status: res.status, body: await res.json() };
    }, { apiUrl: API_URL, id: courseId });

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });

  // ─── AC-98: DELETE /training/levels/:id ─────────────────────────────────────

  e2e('AC-98: DELETE /training/levels/:id deletes (soft)', async () => {
    const page = getPage();
    const result = await page.evaluate(async ({ apiUrl, id }) => {
      const res = await fetch(`${apiUrl}/training/levels/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return { status: res.status, body: await res.json() };
    }, { apiUrl: API_URL, id: levelId });

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });

  // ─── AC-102: DELETE /training/badges/:id ────────────────────────────────────

  e2e('AC-102: DELETE /training/badges/:id succeeds when no active levels', async () => {
    const page = getPage();
    const result = await page.evaluate(async ({ apiUrl, id }) => {
      const res = await fetch(`${apiUrl}/training/badges/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return { status: res.status, body: await res.json() };
    }, { apiUrl: API_URL, id: badgeId });

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
  });
});
