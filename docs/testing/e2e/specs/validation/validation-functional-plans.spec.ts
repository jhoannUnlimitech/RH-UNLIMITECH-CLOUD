/**
 * Validation Functional Plans — Ticket #868
 *
 * Validates that each plan × interval combination produces an agreement
 * with at least 2 signature fields for the client signer.
 *
 * Bug: Company (year) only shows 1 signature field — should be 2.
 * Rule: §3 Step 9 — "sign the appropriate signature lines" (plural).
 *
 * Strategy: For each plan, run full enrollment flow up to agreement signing,
 * count how many times #fillin-action-btn is clicked (= signature fields),
 * and assert >= 2.
 *
 * Output: Generates `.temp/plan-signing-report.json` with results per plan.
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test validation-functional-plans --reporter=list
 *
 * Run only Company (bug):
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test validation-functional-plans --grep "company" --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { fillLeadForm, submitLeadForm } from '../../factories/lead-form.factory';
import { fillRegistrationForm, submitRegistrationForm } from '../../factories/registration-form.factory';
import { selectPlan } from '../../factories/plan-selection.factory';
import { verifyThankYouPage, waitForEmailWithResend } from '../../factories/thank-you.factory';
import { navigateAndVerifyEmail } from '../../factories/verify.factory';
import { signAgreementMultipleSigners } from '../../factories/agreement.factory';
import {
  generateMailosaurEmail,
  LEAD_USA_V4,
  REG_USA_V4,
  ZOHO_SIGN_LABELS_EN,
} from '../../fixtures/test-data';
import { expect, test } from '@playwright/test';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Plan matrix ────────────────────────────────────────────────────────────

const PLAN_MATRIX: { plan: string; interval: 'month' | 'year'; bug?: boolean }[] = [
  { plan: 'individual', interval: 'year' },
  { plan: 'general',    interval: 'month' },
  { plan: 'general',    interval: 'year' },
  { plan: 'company',    interval: 'month' },
  { plan: 'company',    interval: 'year' },
  { plan: 'corporate',  interval: 'month' },
  { plan: 'corporate',  interval: 'year' },
];

// ─── Report output ──────────────────────────────────────────────────────────

interface PlanSigningResult {
  plan: string;
  interval: string;
  signatureFieldsSigned: number;
  status: 'pass' | 'fail';
  bug: boolean;
  timestamp: string;
  email: string;
}

const outputDir = resolve(process.cwd(), '.temp');
const reportPath = resolve(outputDir, 'plan-signing-report.json');

/** Load existing report (accumulates results across parallel workers) */
function loadReport(): PlanSigningResult[] {
  if (existsSync(reportPath)) {
    try { return JSON.parse(readFileSync(reportPath, 'utf8')); } catch { /* ignore */ }
  }
  return [];
}

/** Save report (append result) */
function saveReport(results: PlanSigningResult[]): void {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(reportPath, JSON.stringify(results, null, 2));
}

// ─── Generate one serial flow per plan ──────────────────────────────────────

for (const { plan, interval, bug } of PLAN_MATRIX) {
  const { e2e, getPage } = createSerialFlow();

  const testEmail = generateMailosaurEmail();
  const LEAD = { ...LEAD_USA_V4, email: testEmail };
  const REG = { ...REG_USA_V4, profilePhotoPath: undefined }; // skip photo — speed

  e2e.setTimeout(180_000); // 3 min per plan (agreement signing is slow)

  const label = bug ? `⚠️ ${plan} (${interval}) — BUG #868` : `${plan} (${interval})`;

  e2e.describe.serial(`Plan Signing Validation — ${label}`, () => {

    // ── Setup: Navigate → Form 1 → Form 2 → Plan Selection ──────────────
    e2e('navigate to enrollment', navigateToSignUpV4(getPage, { country: 'USA' }));
    e2e('fill lead form', fillLeadForm(getPage, LEAD));
    e2e('submit lead form', submitLeadForm(getPage));
    e2e('fill registration form', fillRegistrationForm(getPage, REG));
    e2e('submit registration', submitRegistrationForm(getPage));

    e2e(`select plan: ${plan} (${interval})`, selectPlan(getPage, { cname: plan, interval }));

    // ── Email verification → Agreement ──────────────────────────────────
    let verifyUrl = '';
    e2e('verify thank-you page', verifyThankYouPage(getPage));
    e2e('wait for verification email', async () => {
      const link = await waitForEmailWithResend(getPage, testEmail)();
      verifyUrl = link;
    });
    e2e('verify email → /agreement', () => navigateAndVerifyEmail(getPage, verifyUrl)());

    // ── Sign agreement and count fields ─────────────────────────────────
    e2e(`AC-868: sign ${plan} (${interval}) — verify ≥ 2 signatures`, async () => {
      const result = await signAgreementMultipleSigners(
        getPage, 'Test Signer', 'TS', ZOHO_SIGN_LABELS_EN,
      )();

      const passed = result.signatureFieldsSigned >= 2;

      console.log(`\n   ════════════════════════════════════════════`);
      console.log(`   📝 Plan "${plan}" (${interval}): ${result.signatureFieldsSigned} fields signed`);
      console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'} — minimum 2 required`);
      if (bug) console.log(`   ⚠️  This is the reported bug plan (Company year)`);
      console.log(`   ════════════════════════════════════════════\n`);

      // Save to report JSON
      const report = loadReport();
      report.push({
        plan,
        interval,
        signatureFieldsSigned: result.signatureFieldsSigned,
        status: passed ? 'pass' : 'fail',
        bug: !!bug,
        timestamp: new Date().toISOString(),
        email: testEmail,
      });
      saveReport(report);

      expect(
        result.signatureFieldsSigned,
        `Plan "${plan}" (${interval}) should have >= 2 signature fields. Got: ${result.signatureFieldsSigned}`,
      ).toBeGreaterThanOrEqual(2);
    });
  });
}

// ─── Final summary (runs after all plans) ───────────────────────────────────

test('Plan Signing Report — Summary', () => {
  const report = loadReport();

  if (report.length === 0) {
    console.log('   ⏭️ No plan signing results found (run individual plan tests first)');
    return;
  }

  console.log(`\n   ══════════════════════════════════════════════════════════════`);
  console.log(`   📊 PLAN SIGNING VALIDATION REPORT`);
  console.log(`   ══════════════════════════════════════════════════════════════`);
  console.log(`   | Plan        | Interval | Signatures | Status | Bug  |`);
  console.log(`   |-------------|----------|------------|--------|------|`);

  for (const r of report) {
    const status = r.status === 'pass' ? '✅' : '❌';
    const bugFlag = r.bug ? '⚠️' : '  ';
    console.log(`   | ${r.plan.padEnd(11)} | ${r.interval.padEnd(8)} | ${String(r.signatureFieldsSigned).padEnd(10)} | ${status}     | ${bugFlag}   |`);
  }

  const passed = report.filter(r => r.status === 'pass').length;
  const failed = report.filter(r => r.status === 'fail').length;

  console.log(`   ──────────────────────────────────────────────────────────────`);
  console.log(`   Total: ${report.length} plans | ✅ ${passed} pass | ❌ ${failed} fail`);
  console.log(`   Report: ${reportPath}`);
  console.log(`   ══════════════════════════════════════════════════════════════\n`);
});

