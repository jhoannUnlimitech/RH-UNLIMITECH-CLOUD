/**
 * CRM Report Generator — Produces markdown reports comparing expected vs actual CRM data.
 *
 * Generates a timestamped .md file in .temp/ with tables showing field-by-field
 * comparison results. Does NOT fail the test — discrepancies are informational.
 *
 * Related files:
 * - e2e/fixtures/crm-expected-data.ts (expected value builders)
 * - e2e/fixtures/zoho-client.ts (API client for fetching actual CRM data)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

// ─── Types ──────────────────────────────────────────────────────────────────

export type FieldStatus = '✅ Match' | '❌ Mismatch' | '⚠️ Not found' | '⏭️ Skipped';

export interface FieldResult {
  field: string;
  expected: string;
  actual: string;
  status: FieldStatus;
  category: string;
  ac: string;
}

export interface CRMReportData {
  email: string;
  contactId: string | null;
  accountId: string | null;
  accountName: string | null;
  contactFields: FieldResult[];
  accountFields: FieldResult[];
  crossModuleChecks: FieldResult[];
}

// ─── Comparison Logic ───────────────────────────────────────────────────────

/**
 * Compare expected fields against actual CRM record.
 * Returns array of FieldResult with status for each field.
 */
export function compareFields(
  expectedFields: Array<{ field: string; expected: string; category: string; ac: string }>,
  actualRecord: Record<string, any> | null,
): FieldResult[] {
  if (!actualRecord) {
    return expectedFields.map(f => ({
      ...f,
      actual: '(record not found)',
      status: '⚠️ Not found' as FieldStatus,
    }));
  }

  return expectedFields.map(f => {
    const actual = actualRecord[f.field];

    // Skip empty expected values (optional fields not filled)
    if (!f.expected && f.expected !== 'true' && f.expected !== 'false') {
      return { ...f, actual: String(actual ?? ''), status: '⏭️ Skipped' as FieldStatus };
    }

    // Special marker: verify field is not empty in CRM (when we don't know the exact value)
    if (f.expected === '__NOT_EMPTY__') {
      const hasValue = actual !== null && actual !== undefined && actual !== '';
      return {
        ...f,
        expected: '(not empty)',
        actual: String(actual ?? '(null)'),
        status: hasValue ? '✅ Match' as FieldStatus : '❌ Mismatch' as FieldStatus,
      };
    }

    // Normalize for comparison
    const normalizedExpected = normalizeValue(f.expected);
    const normalizedActual = normalizeValue(actual);

    const matches = normalizedExpected === normalizedActual;

    return {
      ...f,
      actual: String(actual ?? '(null)'),
      status: matches ? '✅ Match' as FieldStatus : '❌ Mismatch' as FieldStatus,
    };
  });
}

/** Normalize a value for comparison — handles booleans, numbers, whitespace, case. */
function normalizeValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);

  let str = String(value).trim();

  // Zoho multiselect fields may use different separators
  // Normalize semicolons with spaces to just semicolons
  str = str.replace(/\s*;\s*/g, '; ');

  return str;
}

// ─── Report Generator ───────────────────────────────────────────────────────

/**
 * Generate a markdown report and write it to .temp/
 * Returns the file path of the generated report.
 */
export function generateReport(data: CRMReportData): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toISOString().slice(11, 19);

  const outputDir = resolve(process.cwd(), '.temp');
  mkdirSync(outputDir, { recursive: true });

  const fileName = `report_crm_${timestamp}.md`;
  const filePath = resolve(outputDir, fileName);

  // ── Compute summary ──
  const allResults = [...data.contactFields, ...data.accountFields, ...data.crossModuleChecks];
  const matchCount = allResults.filter(r => r.status === '✅ Match').length;
  const mismatchCount = allResults.filter(r => r.status === '❌ Mismatch').length;
  const notFoundCount = allResults.filter(r => r.status === '⚠️ Not found').length;
  const skippedCount = allResults.filter(r => r.status === '⏭️ Skipped').length;

  // ── Build markdown ──
  let md = '';

  md += `# CRM Field Mapping Validation Report\n\n`;
  md += `**Date:** ${dateStr} ${timeStr}\n`;
  md += `**Email:** ${data.email}\n`;
  md += `**Contact ID:** ${data.contactId ?? '(not found)'}\n`;
  md += `**Account ID:** ${data.accountId ?? '(not found)'}\n`;
  md += `**Account Name:** ${data.accountName ?? '(not found)'}\n\n`;

  md += `---\n\n`;
  md += `## Summary\n\n`;
  md += `| Status | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| ✅ Match | ${matchCount} |\n`;
  md += `| ❌ Mismatch | ${mismatchCount} |\n`;
  md += `| ⚠️ Not found | ${notFoundCount} |\n`;
  md += `| ⏭️ Skipped (empty) | ${skippedCount} |\n`;
  md += `| **Total** | **${allResults.length}** |\n\n`;

  // ── Contact Fields Table ──
  if (data.contactFields.length > 0) {
    md += `---\n\n`;
    md += `## Contact Fields\n\n`;
    md += `| # | AC | Field (Zoho API Name) | Expected (from form) | Actual (in CRM) | Status |\n`;
    md += `|---|---|---|---|---|---|\n`;
    data.contactFields.forEach((r, i) => {
      md += `| ${i + 1} | ${r.ac} | ${r.field} | ${escMd(r.expected)} | ${escMd(r.actual)} | ${r.status} |\n`;
    });
    md += `\n`;
  }

  // ── Account Fields Table ──
  if (data.accountFields.length > 0) {
    md += `---\n\n`;
    md += `## Account Fields\n\n`;
    md += `| # | AC | Field (Zoho API Name) | Expected (from form) | Actual (in CRM) | Status |\n`;
    md += `|---|---|---|---|---|---|\n`;
    data.accountFields.forEach((r, i) => {
      md += `| ${i + 1} | ${r.ac} | ${r.field} | ${escMd(r.expected)} | ${escMd(r.actual)} | ${r.status} |\n`;
    });
    md += `\n`;
  }

  // ── Cross-Module Checks ──
  if (data.crossModuleChecks.length > 0) {
    md += `---\n\n`;
    md += `## Cross-Module Consistency\n\n`;
    md += `| # | AC | Check | Expected | Actual | Status |\n`;
    md += `|---|---|---|---|---|---|\n`;
    data.crossModuleChecks.forEach((r, i) => {
      md += `| ${i + 1} | ${r.ac} | ${r.field} | ${escMd(r.expected)} | ${escMd(r.actual)} | ${r.status} |\n`;
    });
    md += `\n`;
  }

  // ── Mismatches Detail ──
  const mismatches = allResults.filter(r => r.status === '❌ Mismatch');
  if (mismatches.length > 0) {
    md += `---\n\n`;
    md += `## Mismatches Detail\n\n`;
    md += `| # | AC | Field | Module | Expected | Actual |\n`;
    md += `|---|---|---|---|---|---|\n`;
    mismatches.forEach((r, i) => {
      const module = data.contactFields.includes(r) ? 'Contact'
        : data.accountFields.includes(r) ? 'Account' : 'Cross-Module';
      md += `| ${i + 1} | ${r.ac} | ${r.field} | ${module} | ${escMd(r.expected)} | ${escMd(r.actual)} |\n`;
    });
    md += `\n`;
  }

  // ── Write file ──
  writeFileSync(filePath, md, 'utf-8');

  return filePath;
}

/** Escape pipe characters in markdown table cells */
function escMd(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
