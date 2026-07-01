import { createSerialFlow } from '../../fixtures/base';
import { signAgreementMultipleSigners } from '../../factories/agreement.factory';
import { ZOHO_SIGN_LABELS_EN } from '../../fixtures/test-data';

/**
 * Agreement Signing Only — Isolated test for Zoho Sign iframe interaction.
 *
 * Uses an existing session already at the /agreement step.
 * Purpose: validate the signing flow works (Start → Terms → Sign → Submit).
 *
 * Run:
 *   CDP_ENDPOINT=http://localhost:9223 npx playwright test agreement-signing-only --reporter=list
 */

const { e2e, getPage } = createSerialFlow();

e2e.setTimeout(120_000);

e2e.describe.serial('Agreement Signing Only — Isolated', () => {

  e2e('navigate to agreement page', async () => {
    const page = getPage();
    await page.goto('https://localhost:9010/sign-up/ba0186f8-ee84-4b8e-9520-7dc18b6d532b/agreement');
    await page.waitForURL(/\/agreement/);
  });

  e2e('sign agreement', signAgreementMultipleSigners(getPage, 'Unlimitech Cloud', 'UC', ZOHO_SIGN_LABELS_EN));

});
