/**
 * Rules Compliance Report Factory — Generates the final .md report with pie chart.
 *
 * Collects all compliance results from the serial flow and writes a markdown report
 * to .temp/rules-compliance-report.md with:
 *   - Summary table
 *   - ASCII pie chart
 *   - Detailed pass/fail per AC
 *   - Discrepancies list for developer action
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export interface ReportResult {
  id: string;
  description: string;
  expected: string;
  actual: string;
  pass: boolean;
  group: string;
}

/**
 * Generate the final rules compliance report as a .md file.
 */
export function generateComplianceReport(allResults: ReportResult[]) {
  return async () => {
    const outputDir = resolve(process.cwd(), '.temp');
    mkdirSync(outputDir, { recursive: true });

    const total = allResults.length;
    const passed = allResults.filter(r => r.pass).length;
    const failed = allResults.filter(r => !r.pass).length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';
    const failRate = total > 0 ? ((failed / total) * 100).toFixed(1) : '0';

    // Group by group letter
    const groups: Record<string, ReportResult[]> = {};
    for (const r of allResults) {
      if (!groups[r.group]) groups[r.group] = [];
      groups[r.group].push(r);
    }

    const groupNames: Record<string, string> = {
      A: 'Form 1 — General Information',
      B: 'Form 2 — Company & Profile Details',
      C: 'Screen Messages',
      D: 'Email Wording',
      E: 'Dropdown Content',
    };

    // Build ASCII pie chart
    const pieChart = buildPieChart(passed, failed, total);

    // Build report
    let report = `# Rules Compliance Validation Report\n\n`;
    report += `> **Generated:** ${new Date().toISOString().replace('T', ' ').substring(0, 19)} COT\n`;
    report += `> **Rules Document:** Rules & Workflow Specification Manual (Revised: June 15, 2026)\n`;
    report += `> **Language validated:** English (en-US)\n\n`;
    report += `---\n\n`;

    // Summary
    report += `## Summary\n\n`;
    report += `| Metric | Value |\n`;
    report += `|--------|-------|\n`;
    report += `| Total ACs validated | ${total} |\n`;
    report += `| ✅ Pass | ${passed} (${passRate}%) |\n`;
    report += `| ❌ Fail (discrepancies) | ${failed} (${failRate}%) |\n\n`;

    // Pie chart
    report += `## Compliance Chart\n\n`;
    report += '```\n';
    report += pieChart;
    report += '```\n\n';

    // Group summary table
    report += `## Results by Group\n\n`;
    report += `| Group | Description | Pass | Fail | Total |\n`;
    report += `|-------|-------------|------|------|-------|\n`;
    for (const [g, items] of Object.entries(groups).sort()) {
      const gPass = items.filter(i => i.pass).length;
      const gFail = items.filter(i => !i.pass).length;
      report += `| ${g} | ${groupNames[g] ?? g} | ${gPass} | ${gFail} | ${items.length} |\n`;
    }
    report += `| **Total** | | **${passed}** | **${failed}** | **${total}** |\n\n`;

    // Detailed results per group
    report += `---\n\n## Detailed Results\n\n`;
    for (const [g, items] of Object.entries(groups).sort()) {
      report += `### Group ${g}: ${groupNames[g] ?? g}\n\n`;
      report += `| AC | Description | Status | Expected | Actual |\n`;
      report += `|----|-------------|--------|----------|--------|\n`;
      for (const r of items) {
        const status = r.pass ? '✅' : '❌';
        const exp = r.expected.length > 50 ? r.expected.substring(0, 47) + '...' : r.expected;
        const act = r.actual.length > 50 ? r.actual.substring(0, 47) + '...' : r.actual;
        report += `| ${r.id} | ${r.description} | ${status} | ${esc(exp)} | ${esc(act)} |\n`;
      }
      report += `\n`;
    }

    // Discrepancies for developer
    const discrepancies = allResults.filter(r => !r.pass);
    if (discrepancies.length > 0) {
      report += `---\n\n## Discrepancies for Developer Action\n\n`;
      report += `| # | AC | Issue | Expected | Actual |\n`;
      report += `|---|----|----|----------|--------|\n`;
      discrepancies.forEach((d, i) => {
        report += `| ${i + 1} | ${d.id} | ${d.description} | ${esc(d.expected.substring(0, 40))} | ${esc(d.actual.substring(0, 40))} |\n`;
      });
      report += `\n`;
    }

    // Write
    const filePath = resolve(outputDir, 'rules-compliance-report.md');
    writeFileSync(filePath, report, 'utf8');

    console.log(`\n📊 Rules Compliance Report Generated`);
    console.log(`════════════════════════════════════════`);
    console.log(`  Total: ${total} | ✅ Pass: ${passed} (${passRate}%) | ❌ Fail: ${failed} (${failRate}%)`);
    console.log(`  File: .temp/rules-compliance-report.md`);
    console.log(`════════════════════════════════════════\n`);
  };
}

/** Escape pipe characters for markdown tables. */
function esc(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

/** Build an ASCII pie chart representation. */
function buildPieChart(passed: number, failed: number, total: number): string {
  if (total === 0) return '  (no data)\n';

  const passPercent = Math.round((passed / total) * 100);
  const failPercent = 100 - passPercent;

  // Simple bar representation
  const barWidth = 40;
  const passBar = Math.round((passed / total) * barWidth);
  const failBar = barWidth - passBar;

  let chart = '';
  chart += `  ┌${'─'.repeat(barWidth + 2)}┐\n`;
  chart += `  │ ${'█'.repeat(passBar)}${'░'.repeat(failBar)} │\n`;
  chart += `  └${'─'.repeat(barWidth + 2)}┘\n`;
  chart += `    ${'█'.repeat(3)} Pass: ${passed}/${total} (${passPercent}%)\n`;
  chart += `    ${'░'.repeat(3)} Fail: ${failed}/${total} (${failPercent}%)\n`;
  chart += `\n`;
  chart += `  Compliance Rate: ${passPercent}%\n`;

  return chart;
}
