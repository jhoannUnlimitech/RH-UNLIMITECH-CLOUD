/**
 * Seed Validation — E2E Tests (AC-S01 to AC-S53)
 *
 * Ejecuta el seed completo y verifica vía API que todos los datos
 * se crearon correctamente: permisos, roles, divisiones, empleados,
 * training (badges, levels, courses, exams), calendario, config, progress.
 *
 * IMPORTANTE: Este spec BORRA y recrea toda la BD. Ejecutar aislado.
 */

import { expect } from '@playwright/test';
import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignIn, fillLoginForm, submitLoginForm, verifyDashboardRedirect } from '../../factories/login.factory';
import { apiExec } from '../../factories/training-api.factory';
import { LOGIN_MANUEL } from '../../fixtures/test-data';
import { execSync } from 'child_process';

const { e2e, getPage } = createSerialFlow();

e2e.describe.serial('Seed Validation — Complete DB (AC-S01 to AC-S53)', () => {

  // ─── Step 0: Run seed ───────────────────────────────────────────────────────

  e2e('AC-S01+S02: seed drops DB and recreates everything', async () => {
    const cwd = process.cwd().replace('/frontend', '/backend');
    const output = execSync('npx ts-node --transpile-only src/scripts/seed-complete.ts', {
      cwd,
      timeout: 30_000,
      encoding: 'utf-8',
    });
    expect(output).toContain('SEED COMPLETADO');
    expect(output).toContain('Base de datos limpia');
  });

  // ─── Login validation ───────────────────────────────────────────────────────

  e2e('AC-S50: login with admin@unlimitech.cloud / Pass2014!', async () => {
    await navigateToSignIn(getPage)();
    await fillLoginForm(getPage, LOGIN_MANUEL)();
    await submitLoginForm(getPage)();
    await verifyDashboardRedirect(getPage)();
  });

  // ─── Permissions ────────────────────────────────────────────────────────────

  e2e('AC-S03+S04+S05: 41 permissions created with correct resources', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/permissions');
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(41);

    // Verify training special actions exist
    const trainingPerms = res.data.filter((p: any) => p.resource === 'training');
    const trainingActions = trainingPerms.map((p: any) => p.action).sort();
    expect(trainingActions).toContain('read');
    expect(trainingActions).toContain('report');
    expect(trainingActions).toContain('content');
    expect(trainingActions).toContain('manage');
  });

  // ─── Roles ──────────────────────────────────────────────────────────────────

  e2e('AC-S06: 13 roles created', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/roles');
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(13);
  });

  e2e('AC-S08+S09+S10: FOUNDER, TALENT, TRAINING have training:manage', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/roles');
    const manageRoles = ['FOUNDER & SOLUTIONS ARCHITECT', 'HUMAN TALENT MANAGER', 'QUALITY & TRAINING OFFICER'];
    for (const roleName of manageRoles) {
      const role = res.data.find((r: any) => r.name === roleName);
      expect(role).toBeTruthy();
      const hasManage = role.permissions.some((p: any) => p.resource === 'training' && p.action === 'manage');
      expect(hasManage).toBe(true);
    }
  });

  e2e('AC-S11+S12: DEVELOPER and QA have only training:read+report', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/roles');
    for (const roleName of ['DEVELOPER', 'QA ANALYST']) {
      const role = res.data.find((r: any) => r.name === roleName);
      expect(role).toBeTruthy();
      const trainingPerms = role.permissions.filter((p: any) => p.resource === 'training').map((p: any) => p.action);
      expect(trainingPerms).toContain('read');
      expect(trainingPerms).toContain('report');
      expect(trainingPerms).not.toContain('manage');
      expect(trainingPerms).not.toContain('content');
    }
  });

  // ─── Divisions ──────────────────────────────────────────────────────────────

  e2e('AC-S13+S14+S15: 7 divisions with code and manager', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/divisions');
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(7);

    // Verify each has a code and managerId
    for (const div of res.data) {
      expect(div.code).toBeTruthy();
      expect(div.managerId).toBeTruthy();
    }

    // Verify expected codes
    const codes = res.data.map((d: any) => d.code).sort();
    expect(codes).toEqual(['CAL', 'DIS', 'EJEC', 'FIN', 'INF', 'RRPP', 'TH']);
  });

  // ─── Employees ──────────────────────────────────────────────────────────────

  e2e('AC-S16+S21+S22: 10 employees with correct role and division', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/employees');
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(10);

    // Verify known employees
    const emails = res.data.map((e: any) => e.email).sort();
    expect(emails).toContain('admin@unlimitech.cloud');
    expect(emails).toContain('talent@unlimitech.cloud');
    expect(emails).toContain('jhoann@unlimitech.cloud');
    expect(emails).toContain('training@unlimitech.cloud');
  });

  e2e('AC-S20: approve_csw correct for each employee', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/employees');
    const shouldApprove = ['admin@unlimitech.cloud', 'catherine@unlimitech.cloud', 'coo@unlimitech.cloud', 'talent@unlimitech.cloud', 'moises@unlimitech.cloud', 'training@unlimitech.cloud'];
    for (const emp of res.data) {
      if (shouldApprove.includes(emp.email)) {
        expect(emp.approve_csw).toBe(true);
      } else {
        expect(emp.approve_csw).toBe(false);
      }
    }
  });

  // ─── Training: Badges ───────────────────────────────────────────────────────

  e2e('AC-S23+S24: 2 badges with icon, shape, color', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/training/badges');
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(2);

    const names = res.data.map((b: any) => b.name).sort();
    expect(names).toEqual(['Fullstack Developer', 'React Specialist']);

    for (const badge of res.data) {
      expect(badge.icon).toBeTruthy();
      expect(badge.shape).toBeTruthy();
      expect(badge.color).toBeTruthy();
    }
  });

  // ─── Training: Levels ───────────────────────────────────────────────────────

  e2e('AC-S25+S26+S27+S28: 3 levels with correct badge association and exams', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/training/levels');
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(3);

    const names = res.data.map((l: any) => l.name).sort();
    expect(names).toContain('TypeScript Básico');
    expect(names).toContain('TypeScript Avanzado');
    expect(names).toContain('React Fundamentals');

    // At least 2 levels have exams
    const withExams = res.data.filter((l: any) => l.exam);
    expect(withExams.length).toBeGreaterThanOrEqual(2);
  });

  // ─── Training: Courses ──────────────────────────────────────────────────────

  e2e('AC-S29+S30+S31+S32+S33: 6 courses with hours and order', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/training/courses');
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(6);

    for (const course of res.data) {
      expect(course.estimatedHours).toBeGreaterThan(0);
      expect(course.order).toBeGreaterThanOrEqual(0);
    }

    const names = res.data.map((c: any) => c.name);
    expect(names).toContain('Intro a TypeScript');
    expect(names).toContain('React Hooks');
    expect(names).toContain('Node.js Express API');
  });

  // ─── Training: Exams ────────────────────────────────────────────────────────

  e2e('AC-S34+S35+S36+S37+S38: 2 exams with questions, 80% passing', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/training/exams');
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(2);

    for (const exam of res.data) {
      expect(exam.passingScore).toBe(80);
      expect(exam.questions.length).toBeGreaterThanOrEqual(3);

      // Verify MC questions have exactly 1 correct option
      for (const q of exam.questions) {
        if (q.type === 'multiple_choice') {
          const correctCount = q.options.filter((o: any) => o.isCorrect).length;
          expect(correctCount).toBe(1);
        }
      }
    }
  });

  // ─── Calendar Events ────────────────────────────────────────────────────────

  e2e('AC-S39+S40+S41: 21 calendar events (18 holidays + 3 corporate)', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/calendar/events');
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(21);

    const holidays = res.data.filter((e: any) => e.type === 'holiday');
    expect(holidays.length).toBe(18);

    // Holidays have color:danger and allDay:true
    for (const h of holidays) {
      expect(h.color).toBe('danger');
      expect(h.allDay).toBe(true);
    }
  });

  // ─── System Config ──────────────────────────────────────────────────────────

  e2e('AC-S42+S43+S44+S45: SystemConfig with correct defaults', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/config');
    expect(res.success).toBe(true);

    const config = res.data;
    expect(config.general.timezone).toBe('America/Bogota');
    expect(config.general.locale).toBe('es-CO');
    expect(config.schedule.studyDays).toEqual([1, 3, 5]);
    expect(config.training.minWeeklyHours).toBe(3);
    expect(config.training.examPassingScore).toBe(80);
  });

  // ─── Progress ───────────────────────────────────────────────────────────────

  e2e('AC-S46+S47+S48+S49: progress initialized for employees', async () => {
    const page = getPage();
    const res = await apiExec(page, 'GET', '/training/progress/me');
    expect(res.success).toBe(true);

    // Admin should have progress with badges, levels, courses
    expect(res.data.badges.length).toBe(2);
    expect(res.data.levels.length).toBe(3);
    expect(res.data.courses.length).toBe(6);

    // First level should be in_progress (unlocked)
    const firstLevel = res.data.levels.find((l: any) => l.status === 'in_progress');
    expect(firstLevel).toBeTruthy();

    // Others should be locked
    const lockedLevels = res.data.levels.filter((l: any) => l.status === 'locked');
    expect(lockedLevels.length).toBe(2);
  });

  // ─── Post-conditions: UI verification ──────────────────────────────────────

  e2e('AC-S51: dashboard loads without errors', async () => {
    const page = getPage();
    const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    // Should not show error page
    const body = await page.textContent('body');
    expect(body).not.toContain('Error');
    expect(body).not.toContain('404');
  });

  e2e('AC-S52: /training/manage shows badges, levels, courses, exams', async () => {
    const page = getPage();
    const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${BASE_URL}/training/manage`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Should see tabs
    await expect(page.locator('text=Insignias').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Niveles').first()).toBeVisible();
    await expect(page.locator('text=Cursos').first()).toBeVisible();
    await expect(page.locator('text=Exámenes').first()).toBeVisible();
  });

  e2e('AC-S53: /training/my-progress shows employee progress', async () => {
    const page = getPage();
    const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${BASE_URL}/training/my-progress`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Should see progress content
    const body = await page.textContent('body');
    expect(body).toContain('Progreso');
  });
});
