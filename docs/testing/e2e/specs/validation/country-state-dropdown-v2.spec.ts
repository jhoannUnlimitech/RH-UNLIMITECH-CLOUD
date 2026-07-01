/**
 * Country & State Dropdown V2 — Validation (#854, #855)
 *
 * Validates:
 *   #854: Country dropdown adjustments (USA first, Venezuela removed, Hong Kong without
 *         S.A.R., South Korea in alphabetical position)
 *   #855: US States cleanup (territories removed, only 50 states + DC + PR)
 *
 * Strategy:
 *   Navigate to Form 1 with country=USA param (pre-selects USA → states load)
 *   Query <option> elements directly to verify presence/absence/order
 *
 * Covers: AC-B2-16 to AC-B2-26
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test country-state-dropdown-v2 --reporter=list
 */

import { createSerialFlow } from '../../fixtures/base';
import { navigateToSignUpV4 } from '../../factories/navigation.factory';
import { PARAMS_V4_FULL } from '../../fixtures/test-data';
import { pom } from '../../pom/general-info.pom';
import { expect } from '@playwright/test';

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(60_000);

// ─── Selectors ──────────────────────────────────────────────────────────────

const sel = {
  countrySelect: pom.lead_form._.address_section._.country_select.$(),
  stateSelect:   pom.lead_form._.address_section._.state_select.$(),
};

// ═════════════════════════════════════════════════════════════════════════════

e2e.describe.serial('Country & State Dropdown V2 — Corrections (#854, #855)', () => {

  // ── Setup ─────────────────────────────────────────────────────────────────
  e2e('navigate to form 1 (country=USA)', navigateToSignUpV4(getPage, PARAMS_V4_FULL));

  // ══════════════════════════════════════════════════════════════════════════
  // #854 — Country Dropdown
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-B2-16: United States is the first option in country dropdown', async () => {
    const page = getPage();
    const select = page.locator(sel.countrySelect);
    await expect(select).toBeVisible({ timeout: 10_000 });

    const options = page.locator(`${sel.countrySelect} option`);
    const count = await options.count();

    // Find first option that is not placeholder (has a non-empty value)
    for (let i = 0; i < count; i++) {
      const value = await options.nth(i).getAttribute('value');
      if (value && value !== '') {
        const text = await options.nth(i).textContent();
        expect(text?.trim()).toBe('United States');
        break;
      }
    }
  });

  e2e('AC-B2-18: Venezuela NOT in the country list', async () => {
    const page = getPage();
    const vzla = page.locator(`${sel.countrySelect} option[value="VEN"]`);
    await expect(vzla).toHaveCount(0);
  });

  e2e('AC-B2-19: Hong Kong without S.A.R. suffix', async () => {
    const page = getPage();
    const hk = page.locator(`${sel.countrySelect} option[value="HKG"]`);
    await expect(hk).toHaveCount(1);
    const text = await hk.textContent();
    expect(text).toBe('Hong Kong');
    expect(text).not.toContain('S.A.R.');
  });

  e2e('AC-B2-17: South Korea in correct alphabetical position', async () => {
    const page = getPage();
    const options = page.locator(`${sel.countrySelect} option`);
    const allTexts = await options.allTextContents();

    // Filter out placeholder and USA (which is pinned first)
    const sorted = allTexts.filter(t => t !== '' && !t.includes('Select') && t !== 'United States');

    const koreaIdx = sorted.indexOf('South Korea');
    expect(koreaIdx).toBeGreaterThan(-1);

    // Should be between countries starting with "So..." alphabetically
    // Specifically: after "Slovenia" and before "Spain"
    const sloveniaIdx = sorted.indexOf('Slovenia');
    const spainIdx = sorted.indexOf('Spain');

    if (sloveniaIdx > -1) expect(koreaIdx).toBeGreaterThan(sloveniaIdx);
    if (spainIdx > -1) expect(koreaIdx).toBeLessThan(spainIdx);
  });

  e2e('AC-B2-20: countries after USA are in alphabetical order', async () => {
    const page = getPage();
    const options = page.locator(`${sel.countrySelect} option`);
    const allTexts = await options.allTextContents();

    // Get all countries except placeholder and USA
    const rest = allTexts.filter(t => t !== '' && !t.includes('Select') && t !== 'United States');

    // Verify alphabetical order
    for (let i = 1; i < rest.length; i++) {
      const prev = rest[i - 1].toLowerCase();
      const curr = rest[i].toLowerCase();
      expect(
        prev.localeCompare(curr) <= 0,
        `Countries not alphabetical: "${rest[i - 1]}" should come before "${rest[i]}"`,
      ).toBe(true);
    }
  });

  // ══════════════════════════════════════════════════════════════════════════
  // #855 — US States Dropdown (USA pre-selected via params)
  // ══════════════════════════════════════════════════════════════════════════

  e2e('AC-B2-21: exactly 52 state options (50 states + DC + PR)', async () => {
    const page = getPage();

    // Wait for state select to be enabled (country=USA pre-selected)
    const stateSelect = page.locator(sel.stateSelect);
    await expect(stateSelect).toBeEnabled({ timeout: 5_000 });

    // Count real options (exclude placeholder)
    const options = page.locator(`${sel.stateSelect} option`);
    const allTexts = await options.allTextContents();
    const realOptions = allTexts.filter(t => t !== '' && !t.includes('Select'));

    expect(realOptions.length).toBe(52);
  });

  e2e('AC-B2-22: American Samoa NOT in state list', async () => {
    const page = getPage();
    const option = page.locator(`${sel.stateSelect} option[value="AS"]`);
    await expect(option).toHaveCount(0);
  });

  e2e('AC-B2-23: Guam NOT in state list', async () => {
    const page = getPage();
    const option = page.locator(`${sel.stateSelect} option[value="GU"]`);
    await expect(option).toHaveCount(0);
  });

  e2e('AC-B2-24: Northern Mariana Islands NOT in state list', async () => {
    const page = getPage();
    const option = page.locator(`${sel.stateSelect} option[value="MP"]`);
    await expect(option).toHaveCount(0);
  });

  e2e('AC-B2-25: US Virgin Islands NOT in state list', async () => {
    const page = getPage();
    const option = page.locator(`${sel.stateSelect} option[value="VI"]`);
    await expect(option).toHaveCount(0);
  });

  e2e('AC-B2-26: FL, CA, NY, TX, DC, PR all present in states', async () => {
    const page = getPage();
    const requiredStates = ['FL', 'CA', 'NY', 'TX', 'DC', 'PR'];

    for (const stateCode of requiredStates) {
      const option = page.locator(`${sel.stateSelect} option[value="${stateCode}"]`);
      await expect(option, `State ${stateCode} should be present`).toHaveCount(1);
    }
  });
});
