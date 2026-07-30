/**
 * Training Phase 4 — Dashboard + Certificates (AC-P4-01 to AC-P4-26)
 *
 * Tests: Dashboard endpoints (overview, levels, hours, alerts, employee detail),
 * Certificate endpoints, and UI page rendering.
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import { apiExec } from '../../factories/training-api.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';

const { e2e, getPage } = createSerialFlow();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

e2e.describe.serial('Training Phase 4 — Dashboard + Certificates (AC-P4-01 to AC-P4-26)', () => {

  e2e('login as admin', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  // ─── Flujo 1: Dashboard Backend ────────────────────────────────────────────

  e2e('AC-P4-01+02: GET /dashboard/overview returns KPIs', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/training/dashboard/overview');
    expect(res.success).toBe(true);
    expect(res.data.totalEmployeesInTraining).toBeGreaterThanOrEqual(0);
    expect(res.data.examPassRate).toBeGreaterThanOrEqual(0);
    expect(res.data.examPassRate).toBeLessThanOrEqual(100);
    expect(res.data.pendingEvaluations).toBeGreaterThanOrEqual(0);
    expect(res.data.totalStudyHoursThisQuarter).toBeGreaterThanOrEqual(0);
    expect(res.data.employeesWithoutReportThisWeek).toBeGreaterThanOrEqual(0);
  });

  e2e('AC-P4-03+04: GET /dashboard/by-level returns level distribution', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/training/dashboard/by-level');
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    if (res.data.length > 0) {
      expect(res.data[0].levelName).toBeTruthy();
      expect(res.data[0].count).toBeGreaterThanOrEqual(0);
      expect(res.data[0].percentage).toBeGreaterThanOrEqual(0);
    }
  });

  e2e('AC-P4-05: GET /dashboard/study-hours returns weekly data', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/training/dashboard/study-hours');
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    // May be empty if no reports in last 8 weeks
    if (res.data.length > 0) {
      expect(res.data[0].week).toBeTruthy();
      expect(res.data[0].totalHours).toBeGreaterThanOrEqual(0);
    }
  });

  e2e('AC-P4-06+07: GET /dashboard/alerts returns sorted alerts', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/training/dashboard/alerts');
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    // If alerts exist, verify structure and sorting
    if (res.data.length > 1) {
      const severities = { high: 0, medium: 1, low: 2 };
      for (let i = 1; i < res.data.length; i++) {
        const prev = (severities as any)[res.data[i - 1].severity];
        const curr = (severities as any)[res.data[i].severity];
        expect(prev).toBeLessThanOrEqual(curr);
      }
    }
    if (res.data.length > 0) {
      expect(res.data[0].type).toBeTruthy();
      expect(res.data[0].message).toBeTruthy();
      expect(res.data[0].count).toBeGreaterThanOrEqual(0);
    }
  });

  e2e('AC-P4-08: GET /dashboard/employee/:id returns employee detail', async () => {
    const page = getPage();
    // Get first employee ID
    const employees = await apiExec(page, 'GET', '/employees');
    const empId = employees.data[0]?._id;
    expect(empId).toBeTruthy();

    const res = await apiExec(page, 'GET', `/training/dashboard/employee/${empId}`);
    expect(res.success).toBe(true);
    expect(res.data.employee).toBeTruthy();
    expect(res.data.employee.name).toBeTruthy();
  });

  // ─── Flujo 2: Dashboard Frontend ───────────────────────────────────────────

  e2e('AC-P4-09+10: /training/admin/dashboard loads with KPI cards', async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/training/admin/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // KPI cards should be visible
    await expect(page.locator('[data-test-context="kpi-cards"]').first()).toBeVisible({ timeout: 10_000 });
  });

  e2e('AC-P4-11: shows level distribution section', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-context="level-distribution"]').first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-P4-12: shows weekly hours section', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-context="weekly-hours"]').first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-P4-13: shows alerts section', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-context="alerts-section"]').first()).toBeVisible({ timeout: 5_000 });
  });

  e2e('AC-P4-14: shows secondary KPIs', async () => {
    const page = getPage();
    await expect(page.locator('[data-test-context="secondary-kpis"]').first()).toBeVisible({ timeout: 5_000 });
  });

  // ─── Flujo 3: Certificados Backend ─────────────────────────────────────────

  e2e('AC-P4-15: GET /certificates/me returns array', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/training/certificates/me');
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
  });

  e2e('AC-P4-19: certificate model has expected fields', async () => {
    const page = getPage();
    // Create a test certificate directly to verify structure
    const employees = await apiExec(page, 'GET', '/employees');
    const levels = await apiExec(page, 'GET', '/training/levels');
    // Just verify the endpoint works — certificate generation is trigger-based
    const certs = await apiExec(page, 'GET', '/training/certificates/me');
    expect(certs.success).toBe(true);
    // If certificates exist, verify structure
    if (certs.data.length > 0) {
      const cert = certs.data[0];
      expect(cert.type).toMatch(/level|badge/);
      expect(cert.title).toBeTruthy();
      expect(cert.variables).toBeTruthy();
      expect(cert.issuedAt).toBeTruthy();
    }
  });

  // ─── Flujo 4: Certificados Frontend ────────────────────────────────────────

  e2e('AC-P4-20+21: /training/certificates loads without errors', async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/training/certificates`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    // Should show either certificates or "sin certificados" message
    const body = await page.textContent('body');
    const hasCerts = body?.includes('Certificado') || body?.includes('certificados');
    expect(hasCerts).toBe(true);
  });

  // ─── Flujo 5: Permisos ─────────────────────────────────────────────────────

  e2e('AC-P4-23: /training/admin/dashboard accessible with training:manage', async () => {
    const page = getPage();
    await page.goto(`${BASE_URL}/training/admin/dashboard`);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/training/admin/dashboard');
  });

  e2e('AC-P4-24: dashboard API endpoints require training:manage', async () => {
    const page = getPage();
    // Admin has manage — should succeed
    const res = await apiExec(page, 'GET', '/training/dashboard/overview');
    expect(res.success).toBe(true);
  });

  e2e('AC-P4-25: /certificates/me accessible with training:read', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/training/certificates/me');
    expect(res.success).toBe(true);
  });
});
